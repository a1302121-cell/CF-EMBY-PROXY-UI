// Small metadata only; personalized Emby lists are never stored here.
export function createAggregationLookupState() {
  return {
    TmdbLookupCache: new Map(),
    TodbVideoIdCache: new Map(),
    flights: new Map(),
    jsonFlights: new Map(),
  };
}

export function readAggregationLookup(state, cache, key, ttl, loader, now = Date.now) {
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now()) {
    cache.delete(key);
    cache.set(key, cached);
    return Promise.resolve(cached.value);
  }
  cache.delete(key);
  return runAggregationFlight(state.flights, key, async () => {
    const value = await loader();
    cache.set(key, { value, expiresAt: now() + (value == null ? 60_000 : ttl) });
    if (cache.size > 4096) cache.delete(cache.keys().next().value);
    return value;
  });
}

export function runAggregationFlight(flights, key, loader) {
  const pending = flights.get(key);
  if (pending) return pending;
  // Keep in-flight work bounded without evicting a live flight and duplicating it.
  if (flights.size >= 128) return Promise.resolve(null);
  const task = Promise.resolve()
    .then(loader)
    .finally(() => {
      if (flights.get(key) === task) flights.delete(key);
    });
  flights.set(key, task);
  return task;
}
