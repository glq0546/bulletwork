#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
YouTube痛点挖掘 - 第一步续：补齐到50个
新增筛选: 时长10-30分钟, 近3个月内(2026-03-24之后)
博主限频: 单博主已出现>=3次则跳过
优先补B/C类, 主题多样化
"""
import sys, os, json, re, urllib.request, urllib.error, urllib.parse, time
from collections import Counter

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace', line_buffering=True)

API_KEY = 'YOUR_YOUTUBE_API_KEY_HERE'
BASE = 'https://www.googleapis.com/youtube/v3'
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0.0.0 Safari/537.36'

PUBLISHED_AFTER = '2026-03-24T00:00:00Z'   # 近3个月
SUB_MIN, SUB_MAX = 10000, 100000
RATIO_MIN = 0.015
VIEWS_MIN = 1000
DUR_MIN, DUR_MAX = 600, 1800               # 10-30分钟(秒)
CHANNEL_CAP = 3                            # 单博主最多3个
TARGET = 50

JSON_PATH = r'C:\Users\Administrator\Desktop\bulletwork-repo\database\数据资产库\痛点挖掘-候选视频-20260624.json'
URL_PATH = r'C:\Users\Administrator\Desktop\视频链接列表.txt'

# B/C类优先排前面执行
SEARCHES = [
    # B. 卡点与限制型 (优先)
    ('B', 'how to bypass OpenAI limits'),
    ('B', 'how to bypass ChatGPT limit'),
    ('B', 'workaround for Stripe'),
    ('B', 'is there a way to automate without coding'),
    ('B', 'how to connect Notion to Google Sheets'),
    ('B', 'how to scrape data without coding'),
    ('B', 'how to automate without Zapier'),
    ('B', 'no code automation tutorial'),
    ('B', 'connect Airtable to website no code'),
    ('B', 'how to build SaaS without coding'),
    # C. 情绪与踩坑型 (优先)
    ('C', 'honest review AI writing tool'),
    ('C', 'why is Notion so expensive'),
    ('C', 'waste of money SEO tool'),
    ('C', 'I hate subscriptions'),
    ('C', 'honest review AI tool'),
    ('C', 'AI tools overrated'),
    ('C', 'SEO tools waste of money'),
    ('C', 'subscription fatigue'),
    ('C', 'stop paying for software'),
    # A. 替代与对比型
    ('A', 'alternative to SaaS'),
    ('A', 'cheaper alternative to Ahrefs'),
    ('A', 'why I quit agency'),
    ('A', 'why I quit freelance'),
    ('A', 'Make vs Zapier'),
    ('A', 'Webflow vs WordPress'),
    ('A', 'cheaper alternative to Adobe'),
    ('A', 'free alternative to Photoshop'),
    ('A', 'best Notion alternative 2026'),
    ('A', 'open source alternative to'),
    # D. 工具组合/工作流卡点型
    ('D', 'my tech stack tools'),
    ('D', 'productivity stack 2026'),
    ('D', 'why I stopped using'),
    ('D', 'my biggest business failure'),
    ('D', 'solopreneur tech stack'),
    ('D', 'my SaaS tech stack'),
    ('D', 'tools I use to run my business'),
    ('D', 'why my startup failed'),
    ('D', 'indie hacker tech stack'),
    ('D', 'AI tools I actually use'),
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
        print(f'  ! HTTP {e.code}: {body[:150]}')
        if e.code == 403:
            raise SystemExit('API配额可能耗尽，已停止。')
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
             it['snippet']['title'], it['snippet']['channelTitle']) for it in d.get('items', [])]


def parse_duration(iso):
    m = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', iso or '')
    if not m:
        return 0
    h, mn, s = (int(x) if x else 0 for x in m.groups())
    return h * 3600 + mn * 60 + s


def video_details(ids):
    out = {}
    for i in range(0, len(ids), 50):
        d = api_get('videos', {'part': 'statistics,contentDetails,snippet', 'id': ','.join(ids[i:i+50])})
        if not d:
            continue
        for it in d.get('items', []):
            s = it.get('statistics', {})
            out[it['id']] = {
                'views': int(s.get('viewCount', 0)),
                'comments': int(s.get('commentCount', 0)),
                'dur': parse_duration(it.get('contentDetails', {}).get('duration')),
                'published': it['snippet']['publishedAt'],
            }
    return out


def channel_subs(ids):
    out = {}
    uniq = list(set(ids))
    for i in range(0, len(uniq), 50):
        d = api_get('channels', {'part': 'statistics', 'id': ','.join(uniq[i:i+50])})
        if not d:
            continue
        for it in d.get('items', []):
            s = it.get('statistics', {})
            hidden = s.get('hiddenSubscriberCount', False)
            out[it['id']] = int(s.get('subscriberCount', 0)) if not hidden else -1
    return out


def main():
    # 加载已有
    existing = []
    if os.path.exists(JSON_PATH):
        with open(JSON_PATH, encoding='utf-8') as f:
            existing = json.load(f)
    seen_urls = {r['url'] for r in existing}
    seen_vids = {r['url'].split('=')[-1] for r in existing}
    ch_count = Counter(r['channel'] for r in existing)
    start_count = len(existing)
    print(f'已有 {start_count} 个，目标 {TARGET}，还差 {TARGET - start_count}\n')

    new_rows = []
    for cat, q in SEARCHES:
        if start_count + len(new_rows) >= TARGET:
            break
        print(f'[{cat}] {q}')
        results = search(q)
        if not results:
            continue
        vids = [r[0] for r in results if r[0] not in seen_vids]
        if not vids:
            continue
        chans = [r[1] for r in results]
        vd = video_details(vids)
        cs = channel_subs(chans)
        for vid, cid, title, ch in results:
            if start_count + len(new_rows) >= TARGET:
                break
            if vid in seen_vids:
                continue
            v = vd.get(vid)
            subs = cs.get(cid)
            if not v or subs is None:
                continue
            views, comments = v['views'], v['comments']
            ratio = (comments / views) if views else 0
            if not (SUB_MIN <= subs <= SUB_MAX):
                continue
            if ratio <= RATIO_MIN or views < VIEWS_MIN or comments <= 0:
                continue
            if not (DUR_MIN <= v['dur'] <= DUR_MAX):
                continue
            if v['published'] < PUBLISHED_AFTER:
                continue
            if ch_count[ch] >= CHANNEL_CAP:
                continue  # 博主限频
            seen_vids.add(vid)
            ch_count[ch] += 1
            row = {
                'cat': cat, 'query': q, 'title': title, 'channel': ch,
                'url': f'https://www.youtube.com/watch?v={vid}',
                'views': views, 'comments': comments, 'subs': subs,
                'ratio': round(ratio * 100, 2), 'published': v['published'][:10],
                'duration_min': round(v['dur'] / 60, 1),
            }
            new_rows.append(row)
            print(f"   + {title[:50]} | {ch} | {subs:,}订 | {ratio*100:.2f}% | {row['duration_min']}min")
        time.sleep(0.2)

    # 合并保存
    all_rows = existing + new_rows
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(all_rows, f, ensure_ascii=False, indent=2)
    # 追加URL
    with open(URL_PATH, 'w', encoding='utf-8') as f:
        for r in all_rows:
            f.write(r['url'] + '\n')

    print('\n=== 本次新增明细 ===')
    print('| 类 | 搜索词 | 标题 | 博主 | 订阅 | 播放 | 评论 | 互动率 | 时长 | 链接 |')
    print('|---|---|---|---|---|---|---|---|---|---|')
    for r in new_rows:
        print(f"| {r['cat']} | {r['query']} | {r['title'][:45]} | {r['channel']} | {r['subs']:,} | "
              f"{r['views']:,} | {r['comments']} | {r['ratio']}% | {r['duration_min']}min | {r['url']} |")

    print(f'\n本次新增: {len(new_rows)}')
    print(f'累计: {len(all_rows)}')
    print(f'还差: {max(0, TARGET - len(all_rows))}')
    # 分类统计
    cc = Counter(r['cat'] for r in all_rows)
    print(f"分类分布: A={cc['A']} B={cc['B']} C={cc['C']} D={cc['D']}")


if __name__ == '__main__':
    main()
