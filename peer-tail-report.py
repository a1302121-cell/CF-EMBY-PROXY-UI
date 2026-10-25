#!/usr/bin/env python3
"""解析 wrangler tail --format json，聚焦跨节点聚合（列表级 + PlaybackInfo 版本级）。

用法：
  python peer-tail-report.py            # 全量摘要
  python peer-tail-report.py --since N  # 只看最近 N 条事件
"""
import io
import json
import re
import sys
from collections import Counter
from urllib.parse import parse_qsl, urlparse

PATH = "peer-tail.jsonl"


def load(path):
    raw = io.open(path, encoding="utf-8", errors="replace").read()
    objs = []
    dec = json.JSONDecoder()
    i = 0
    while True:
        j = raw.find("{", i)
        if j < 0:
            break
        try:
            obj, end = dec.raw_decode(raw, j)
            objs.append(obj)
            i = end
        except Exception:
            i = j + 1
    return objs


def req(obj):
    return (obj.get("event") or {}).get("request") or {}


def url_of(obj):
    return str(req(obj).get("url") or "")


def path_of(obj):
    return urlparse(url_of(obj)).path


def logs_of(obj):
    return [str((e or {}).get("message") or "") for e in (obj.get("logs") or [])]


def main():
    since = None
    if "--since" in sys.argv:
        since = int(sys.argv[sys.argv.index("--since") + 1])
    events = load(PATH)
    if since:
        events = events[-since:]

    versions = Counter(o.get("scriptVersion", {}).get("id", "")[:8] for o in events)
    print(f"事件总数: {len(events)}")
    print("scriptVersion:", dict(versions), "\n")

    # 1) PlaybackInfo 版本聚合
    print("=== 1. [peer_playback_version] 版本聚合 ===")
    hits = [l for o in events for l in logs_of(o) if "[peer_playback_version]" in l]
    if hits:
        for line in hits:
            print(f"  {line}")
    else:
        print("  未出现")

    # 2) 聚合跳过原因
    print("\n=== 2. [peer_aggregation_skip] ===")
    skips = [l for o in events for l in logs_of(o) if "[peer_aggregation_skip]" in l]
    if skips:
        for line in skips[-8:]:
            print(f"  {line}")
        print(f"  共 {len(skips)} 条")
    else:
        print("  未出现")

    # 3) 剧集 / 列表 / PlaybackInfo 请求
    print("\n=== 3. 关键请求 ===")
    pb, ep, items = [], [], []
    for o in events:
        p = path_of(o)
        if "PlaybackInfo" in p:
            pb.append(o)
        elif re.search(r"/Shows/[^/]+/Episodes", p, re.I):
            ep.append(o)
        elif re.search(r"/Items($|/|\?)", p):
            items.append(o)
    print(f"  PlaybackInfo: {len(pb)}   剧集列表: {len(ep)}   Items: {len(items)}")

    if pb:
        print("\n  -- PlaybackInfo 明细 --")
        for o in pb:
            q = dict(parse_qsl(urlparse(url_of(o)).query))
            ms = q.get("MediaSourceId", "")
            if ms:
                tag = "★前缀片源" if re.match(r"^n[A-Za-z0-9_-]+\.", ms) else "带片源Id"
            else:
                tag = "首次(触发聚合)"
            print(f"    [{tag}] {path_of(o)}")

    if ep:
        print("\n  -- 剧集列表请求 --")
        for o in ep:
            q = dict(parse_qsl(urlparse(url_of(o)).query))
            print(f"    {path_of(o)}  Fields={'ProviderIds' in q.get('Fields', '')}")

    # 4) 异常
    print("\n=== 4. 异常与 5xx ===")
    bad = []
    for o in events:
        outcome = str(o.get("outcome") or "")
        exc = o.get("exceptions") or []
        if outcome and outcome != "ok":
            bad.append((outcome, url_of(o), exc))
        elif exc:
            bad.append(("exception", url_of(o), exc))
    if bad:
        for outcome, u, exc in bad[:15]:
            print(f"  [{outcome}] {u[:130]}")
            for e in exc[:2]:
                print(f"      {e.get('name')}: {str(e.get('message'))[:140]}")
    else:
        print("  无")


if __name__ == "__main__":
    main()
