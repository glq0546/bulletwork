#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
YouTube痛点挖掘 - 第一步：定位 + 筛选目标视频
用 YouTube Data API v3 真实搜索并按SOP标准筛选
筛选: 订阅量1万-10万, 评论/播放>1.5%, 发布于2025-12-01之后
"""
import sys, json, urllib.request, urllib.error, time
from datetime import datetime

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace', line_buffering=True)

API_KEY = 'YOUR_YOUTUBE_API_KEY_HERE'
BASE = 'https://www.googleapis.com/youtube/v3'
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0.0.0 Safari/537.36'
PUBLISHED_AFTER = '2025-12-01T00:00:00Z'

# 筛选门槛
SUB_MIN, SUB_MAX = 10000, 100000
RATIO_MIN = 0.015  # 评论数/播放量 > 1.5%
VIEWS_MIN = 1000   # 过滤刚发布/无人看的噪音视频

SEARCHES = [
    # A. 对比型
    ('A', 'Zapier vs Make'),
    ('A', 'Notion vs Obsidian'),
    ('A', 'Webflow vs Framer'),
    ('A', 'Davinci Resolve vs Premiere Pro'),
    ('A', 'Squarespace vs Wordpress'),
    ('A', 'Cursor vs Copilot'),
    ('A', 'Airtable vs Notion'),
    ('A', 'Canva vs Photoshop'),
    # B. 替代型
    ('B', 'Ahrefs alternative'),
    ('B', 'cheaper alternative to Adobe'),
    ('B', 'ChatGPT alternative'),
    ('B', 'Photoshop alternative free'),
    ('B', 'Notion alternative'),
    ('B', 'Zapier alternative'),
    ('B', 'Mailchimp alternative'),
    # C. 卡点型
    ('C', 'how to scrape websites without coding'),
    ('C', 'how to remove background without Photoshop'),
    ('C', 'how to edit video without watermark'),
    ('C', 'how to build app without coding'),
    ('C', 'how to fix slow wordpress'),
    ('C', 'how to bypass paywall'),
    ('C', 'how to automate without zapier'),
    # D. 抱怨型
    ('D', 'why is Adobe so expensive'),
    ('D', 'is Notion worth it'),
    ('D', 'should I stop using Zapier'),
    ('D', 'is Webflow worth it'),
    ('D', 'why is Shopify so expensive'),
    ('D', 'is ChatGPT plus worth it'),
    ('D', 'why I quit Notion'),
    ('D', 'is Canva pro worth it'),
    # 补充批次
    ('A', 'Final Cut vs Premiere'),
    ('A', 'Wix vs Wordpress'),
    ('A', 'Lightroom vs Capture One'),
    ('A', 'Substack vs Beehiiv'),
    ('B', 'Calendly alternative'),
    ('B', 'Grammarly alternative'),
    ('B', 'Figma alternative'),
    ('B', 'Adobe Premiere alternative'),
    ('C', 'how to grow on youtube without spending money'),
    ('C', 'how to make money without showing face'),
    ('C', 'how to design logo without designer'),
    ('C', 'how to write blog without writing'),
    ('D', 'is Squarespace worth it'),
    ('D', 'why I stopped using Adobe'),
    ('D', 'is Shopify worth it 2026'),
    ('D', 'why I quit Substack'),
]


def api_get(endpoint, params):
    qs = '&'.join(f'{k}={urllib.parse.quote(str(v))}' for k, v in params.items())
    url = f'{BASE}/{endpoint}?{qs}&key={API_KEY}'
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', 'ignore')
        print(f'  ! HTTP {e.code}: {body[:200]}')
        return None
    except Exception as e:
        print(f'  ! ERR: {e}')
        return None


def search(query, n=25):
    d = api_get('search', {
        'part': 'snippet', 'q': query, 'type': 'video',
        'maxResults': n, 'order': 'relevance',
        'publishedAfter': PUBLISHED_AFTER, 'relevanceLanguage': 'en',
    })
    if not d:
        return []
    return [(it['id']['videoId'], it['snippet']['channelId'],
             it['snippet']['title'], it['snippet']['channelTitle'],
             it['snippet']['publishedAt']) for it in d.get('items', [])]


def video_stats(ids):
    out = {}
    for i in range(0, len(ids), 50):
        chunk = ids[i:i+50]
        d = api_get('videos', {'part': 'statistics,snippet', 'id': ','.join(chunk)})
        if not d:
            continue
        for it in d.get('items', []):
            s = it.get('statistics', {})
            out[it['id']] = {
                'views': int(s.get('viewCount', 0)),
                'comments': int(s.get('commentCount', 0)),
                'likes': int(s.get('likeCount', 0)),
                'published': it['snippet']['publishedAt'],
            }
    return out


def channel_stats(ids):
    out = {}
    uniq = list(set(ids))
    for i in range(0, len(uniq), 50):
        chunk = uniq[i:i+50]
        d = api_get('channels', {'part': 'statistics', 'id': ','.join(chunk)})
        if not d:
            continue
        for it in d.get('items', []):
            s = it.get('statistics', {})
            hidden = s.get('hiddenSubscriberCount', False)
            out[it['id']] = {
                'subs': int(s.get('subscriberCount', 0)) if not hidden else -1,
                'hidden': hidden,
            }
    return out


def main():
    rows = []
    seen = set()
    for cat, q in SEARCHES:
        print(f'[{cat}] 搜索: {q}')
        results = search(q)
        if not results:
            continue
        vids = [r[0] for r in results]
        chans = [r[1] for r in results]
        vstats = video_stats(vids)
        cstats = channel_stats(chans)
        for vid, cid, title, ch, pub in results:
            if vid in seen:
                continue
            v = vstats.get(vid)
            c = cstats.get(cid)
            if not v or not c:
                continue
            subs = c['subs']
            views = v['views']
            comments = v['comments']
            ratio = (comments / views) if views else 0
            ok_sub = SUB_MIN <= subs <= SUB_MAX
            ok_ratio = ratio > RATIO_MIN
            ok_date = v['published'] >= PUBLISHED_AFTER
            ok_views = views >= VIEWS_MIN
            if ok_sub and ok_ratio and ok_date and ok_views and comments > 0:
                seen.add(vid)
                rows.append({
                    'cat': cat, 'query': q, 'title': title, 'channel': ch,
                    'url': f'https://www.youtube.com/watch?v={vid}',
                    'views': views, 'comments': comments, 'subs': subs,
                    'ratio': round(ratio * 100, 2), 'published': v['published'][:10],
                })
        time.sleep(0.3)

    rows.sort(key=lambda r: (r['cat'], -r['ratio']))
    print('\n\n=== 入选视频 (%d) ===\n' % len(rows))
    print('| 搜索类型 | 搜索词 | 视频标题 | 博主 | 订阅量 | 播放量 | 评论数 | 评论/播放 | 发布 | 链接 |')
    print('|---|---|---|---|---|---|---|---|---|---|')
    for r in rows:
        print(f"| {r['cat']} | {r['query']} | {r['title'][:55]} | {r['channel']} | "
              f"{r['subs']:,} | {r['views']:,} | {r['comments']:,} | {r['ratio']}% | "
              f"{r['published']} | {r['url']} |")

    # 保存JSON
    out_path = r'C:\Users\Administrator\Desktop\bulletwork-repo\database\数据资产库\痛点挖掘-候选视频-20260624.json'
    import os
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)
    print(f'\n已保存 {len(rows)} 条到: {out_path}')
    # 同时输出纯URL列表，便于下一步提取
    url_path = r'C:\Users\Administrator\Desktop\视频链接列表.txt'
    with open(url_path, 'w', encoding='utf-8') as f:
        for r in rows:
            f.write(r['url'] + '\n')
    print(f'URL列表已写入: {url_path}')


if __name__ == '__main__':
    import urllib.parse
    main()
