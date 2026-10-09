#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
YouTube视频内容提取脚本
功能：提取视频字幕和评论区内容
创建日期：2026-06-18
版本：v1.0.0
"""

import os
import sys
import re
import time
import random
import json
import subprocess
from datetime import datetime
from urllib.parse import urlparse, parse_qs

# 修复Windows控制台Unicode编码问题 - 在导入其他模块前立即执行
if sys.platform == 'win32':
    # 方法1: 设置控制台代码页为UTF-8
    import ctypes
    kernel32 = ctypes.windll.kernel32
    kernel32.SetConsoleCP(65001)
    kernel32.SetConsoleOutputCP(65001)

    # 方法2: 强制标准输出使用UTF-8编码
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace', line_buffering=True)
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace', line_buffering=True)

    # 方法3: 设置环境变量
    os.environ['PYTHONIOENCODING'] = 'utf-8'

# =============================================================================
# 安全配置（必须严格执行）
# =============================================================================
# 注：已移除强制关闭代理的配置，避免某些网络环境下连接失败
# 如需使用代理，可通过系统环境变量配置

# Chrome User-Agent
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'

# 每次请求之间随机延迟范围（秒）
MIN_DELAY = 15
MAX_DELAY = 45

# 每天最多处理视频数
DAILY_LIMIT = 50

# 重试次数
MAX_RETRIES = 3

# 网络异常暂停时间（秒）
NETWORK_PAUSE = 300  # 5分钟

# =============================================================================
# YouTube Data API 配置
# API Key申请地址：https://console.cloud.google.com/apis/credentials
# 启用 YouTube Data API v3 后创建凭据
# =============================================================================
YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY_HERE'

YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3'

# =============================================================================
# 路径配置
# =============================================================================
DESKTOP = r'C:\Users\Administrator\Desktop'
INPUT_FILE = os.path.join(DESKTOP, '视频链接列表.txt')
OUTPUT_DIR = os.path.join(DESKTOP, 'video_extract')
SUBTITLES_DIR = os.path.join(OUTPUT_DIR, 'subtitles')
COMMENTS_DIR = os.path.join(OUTPUT_DIR, 'comments')
COUNT_FILE = os.path.join(OUTPUT_DIR, '.daily_count.json')

# 确保输出目录存在
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(SUBTITLES_DIR, exist_ok=True)
os.makedirs(COMMENTS_DIR, exist_ok=True)

# =============================================================================
# 工具函数
# =============================================================================

def sanitize_filename(filename):
    """清理文件名中的非法字符"""
    invalid_chars = r'[<>:"/\\|?*]'
    return re.sub(invalid_chars, '_', filename).strip()

def extract_video_id(url):
    """从YouTube链接中提取视频ID"""
    # 处理 youtu.be 短链接
    if 'youtu.be' in url:
        match = re.search(r'youtu\.be/([a-zA-Z0-9_-]{11})', url)
        if match:
            return match.group(1)

    # 处理 youtube.com 标准链接
    parsed = urlparse(url)
    if parsed.query:
        query_params = parse_qs(parsed.query)
        if 'v' in query_params:
            return query_params['v'][0]

    # 尝试其他模式
    match = re.search(r'[?&]v=([a-zA-Z0-9_-]{11})', url)
    if match:
        return match.group(1)

    return None

def get_daily_count():
    """获取今日已处理视频计数"""
    today = datetime.now().strftime('%Y-%m-%d')
    if os.path.exists(COUNT_FILE):
        try:
            with open(COUNT_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if data.get('date') == today:
                    return data.get('count', 0)
        except:
            pass
    return 0

def update_daily_count(count):
    """更新今日已处理视频计数"""
    today = datetime.now().strftime('%Y-%m-%d')
    data = {'date': today, 'count': count}
    with open(COUNT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f)

def get_next_number():
    """读取subtitles目录中已有文件，返回下一个编号"""
    if not os.path.exists(SUBTITLES_DIR):
        return 1

    existing_files = [f for f in os.listdir(SUBTITLES_DIR) if f.endswith('.txt')]
    if not existing_files:
        return 1

    # 从文件名中提取编号（格式：NNN-...）
    max_num = 0
    for f in existing_files:
        match = re.match(r'^(\d{3})-', f)
        if match:
            num = int(match.group(1))
            if num > max_num:
                max_num = num

    return max_num + 1

def random_delay():
    """随机延迟"""
    delay = random.uniform(MIN_DELAY, MAX_DELAY)
    print(f"  ⏱️  等待 {delay:.1f} 秒...")
    time.sleep(delay)

def is_useful_comment(text):
    """过滤无意义评论"""
    if not text or len(text.strip()) < 10:
        return False

    # 检查是否主要是表情符号
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map symbols
        "\U0001F1E0-\U0001F1FF"  # flags
        "\U00002500-\U00002BEF"  # various symbols
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "]+", flags=re.UNICODE
    )

    clean_text = emoji_pattern.sub('', text).strip()
    if len(clean_text) < 8:
        return False

    return True

# =============================================================================
# 字幕提取（使用 yt-dlp）
# =============================================================================

def extract_subtitles(video_id):
    """提取视频字幕"""
    video_url = f"https://www.youtube.com/watch?v={video_id}"
    temp_dir = os.path.join(OUTPUT_DIR, '.temp')
    os.makedirs(temp_dir, exist_ok=True)

    # 清理临时目录
    for f in os.listdir(temp_dir):
        os.remove(os.path.join(temp_dir, f))

    cmd = [
        sys.executable, '-m', 'yt_dlp',
        '--no-check-certificate',
        '--user-agent', USER_AGENT,
        '--sub-lang', 'en,en.*,zh,zh.*',   # 下载英语和中文相关字幕
        '--write-subs',            # 下载手动字幕
        '--write-auto-subs',       # 下载自动字幕
        '--skip-download',
        '-o', os.path.join(temp_dir, '%(title)s.%(ext)s'),
        video_url
    ]

    for attempt in range(MAX_RETRIES):
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120
            )

            # 查找生成的字幕文件 (支持 vtt, srt 等格式)
            subtitle_files = []
            for f in os.listdir(temp_dir):
                if f.endswith('.vtt') or f.endswith('.srt') or f.endswith('.txt'):
                    if not f.endswith('.info.txt'):
                        subtitle_files.append(os.path.join(temp_dir, f))

            if subtitle_files:
                # 打印调试信息：找到的所有字幕文件
                print(f"  🔍 找到 {len(subtitle_files)} 个字幕文件:")
                for f in subtitle_files[:5]:  # 最多显示5个
                    print(f"    - {os.path.basename(f)}")
                if len(subtitle_files) > 5:
                    print(f"    ... 还有 {len(subtitle_files) - 5} 个文件")

                # 简单策略：取第一个找到的字幕文件
                target_file = subtitle_files[0]
                base_name = os.path.basename(target_file)

                # 判断字幕类型
                if '.vtt.txt' in base_name:
                    subtitle_type = '自动字幕'
                else:
                    subtitle_type = '手动字幕'

                with open(target_file, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()

                # 检查字幕质量 - 从500降低到200
                if len(content.strip()) < 200:
                    return None, f"字幕过短（{len(content)}字符），质量可能不佳"

                return content, subtitle_type

            if attempt < MAX_RETRIES - 1:
                print(f"  ⚠️  字幕提取失败，第 {attempt + 1} 次重试...")
                time.sleep(10)

        except Exception as e:
            if attempt < MAX_RETRIES - 1:
                print(f"  ⚠️  字幕提取异常: {str(e)[:50]}，第 {attempt + 1} 次重试...")
                time.sleep(10)
            else:
                return None, f"提取异常: {str(e)[:100]}"

    # 字幕提取失败时，打印所有可用字幕列表（调试模式）
    print(f"  🔍 调试：正在查询该视频的可用字幕列表...")
    list_cmd = [
        sys.executable, '-m', 'yt_dlp',
        '--no-check-certificate',
        '--user-agent', USER_AGENT,
        '--list-subs',
        video_url
    ]
    try:
        list_result = subprocess.run(list_cmd, capture_output=True, text=True, timeout=60)
        print(f"  🔍 可用字幕列表:\n{list_result.stdout}")
        if list_result.stderr:
            print(f"  🔍 错误输出:\n{list_result.stderr}")
    except Exception as e:
        print(f"  🔍 无法获取可用字幕列表: {str(e)}")

    return None, "无可用字幕"

# =============================================================================
# 评论提取（使用 YouTube Data API）
# =============================================================================

def extract_comments(video_id, api_key=YOUTUBE_API_KEY):
    """提取视频评论"""
    # 检查是否是占位符（如 'YOUR_API_KEY_HERE' 或空字符串）
    if not api_key or 'YOUR_API' in api_key or len(api_key) < 20:
        return None, "API Key未配置"

    try:
        import urllib.request
        import urllib.error

        comments = []
        page_token = ''

        while len(comments) < 50:
            url = (f"{YOUTUBE_API_URL}/commentThreads?part=snippet"
                   f"&videoId={video_id}"
                   f"&key={api_key}"
                   f"&maxResults=50"
                   f"&order=relevance"
                   f"&pageToken={page_token}")

            req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})

            try:
                with urllib.request.urlopen(req, timeout=30) as response:
                    data = json.loads(response.read().decode('utf-8'))
            except urllib.error.HTTPError as e:
                if e.code == 403:
                    return None, "评论区不可访问或API配额耗尽"
                elif e.code == 404:
                    return None, "视频不存在"
                else:
                    return None, f"API错误: {e.code}"

            for item in data.get('items', []):
                snippet = item.get('snippet', {}).get('topLevelComment', {}).get('snippet', {})
                comment_text = snippet.get('textDisplay', '')

                if is_useful_comment(comment_text):
                    comments.append({
                        'username': snippet.get('authorDisplayName', '匿名'),
                        'content': comment_text,
                        'likes': snippet.get('likeCount', 0),
                        'replies': item.get('snippet', {}).get('totalReplyCount', 0)
                    })

                if len(comments) >= 50:
                    break

            page_token = data.get('nextPageToken', '')
            if not page_token:
                break

            time.sleep(1)

        return comments, f"成功提取 {len(comments)} 条有效评论"

    except ImportError:
        return None, "缺少依赖"
    except Exception as e:
        return None, f"评论提取异常: {str(e)[:80]}"

def get_video_info(video_id, api_key=YOUTUBE_API_KEY):
    """获取视频标题等基本信息"""
    try:
        import urllib.request
        import urllib.error

        # 如果有有效的API Key，先尝试用API获取
        if api_key and 'YOUR_API' not in api_key and len(api_key) >= 20:
            url = (f"{YOUTUBE_API_URL}/videos?part=snippet"
                   f"&id={video_id}"
                   f"&key={api_key}")

            req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})

            try:
                with urllib.request.urlopen(req, timeout=30) as response:
                    data = json.loads(response.read().decode('utf-8'))
                    items = data.get('items', [])
                    if items:
                        return items[0].get('snippet', {}).get('title', f'video_{video_id}')
            except:
                pass

        # API不可用时使用 yt-dlp 获取标题
        video_url = f"https://www.youtube.com/watch?v={video_id}"
        cmd = [
            sys.executable, '-m', 'yt_dlp',
                '--get-title',
            '--no-check-certificate',
            video_url
        ]

        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.stdout.strip():
            return result.stdout.strip()

        return f'video_{video_id}'

    except:
        return f'video_{video_id}'

# =============================================================================
# 主处理函数
# =============================================================================

def process_video(url, video_number):
    """处理单个视频

    Args:
        url: 视频链接
        video_number: 视频编号（从1开始递增）
    """
    video_id = extract_video_id(url)
    if not video_id:
        return {'status': 'failed', 'url': url, 'reason': '无法解析视频ID'}

    # 编号格式化为3位数字
    num_str = f"{video_number:03d}"

    print(f"\n{'='*60}")
    print(f"📺 处理视频 #{num_str}: {url}")
    print(f"🔗 视频ID: {video_id}")

    # 获取视频标题
    video_title = get_video_info(video_id)
    print(f"📝 视频标题: {video_title[:50]}...")

    today_str = datetime.now().strftime('%Y%m%d')
    safe_title = sanitize_filename(video_title)[:80]
    base_filename = f"{num_str}-{today_str}-{safe_title}"

    # 提取字幕
    print("\n📄 提取字幕中...")
    subtitle_content, subtitle_result = extract_subtitles(video_id)

    if subtitle_content is None:
        print(f"  ❌ 字幕提取失败: {subtitle_result}")
        return {
            'status': 'skipped',
            'url': url,
            'video_id': video_id,
            'title': video_title,
            'video_number': video_number,
            'reason': f'字幕问题: {subtitle_result}'
        }

    print(f"  ✅ 字幕提取成功 ({subtitle_result}, {len(subtitle_content)} 字符)")

    # 提取评论
    print("\n💬 提取评论中...")
    comments, comment_result = extract_comments(video_id)
    print(f"  ℹ️  {comment_result}")

    # 保存字幕文件 → subtitles 目录
    subtitle_file = os.path.join(SUBTITLES_DIR, f"{base_filename}.txt")
    with open(subtitle_file, 'w', encoding='utf-8') as f:
        f.write(f"视频标题: {video_title}\n")
        f.write(f"视频链接: {url}\n")
        f.write(f"视频ID: {video_id}\n")
        f.write(f"编号: {num_str}\n")
        f.write(f"字幕类型: {subtitle_result}\n")
        f.write(f"提取时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("="*80 + "\n\n")
        f.write(subtitle_content)

    print(f"  💾 字幕已保存: subtitles/{os.path.basename(subtitle_file)}")

    # 保存评论文件 → comments 目录（如果有）
    comment_file = None
    if comments:
        comment_file = os.path.join(COMMENTS_DIR, f"{base_filename}-评论.txt")
        with open(comment_file, 'w', encoding='utf-8') as f:
            f.write(f"视频标题: {video_title}\n")
            f.write(f"视频链接: {url}\n")
            f.write(f"编号: {num_str}\n")
            f.write(f"提取时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"有效评论数: {len(comments)}\n")
            f.write("="*80 + "\n\n")

            for i, comment in enumerate(comments, 1):
                f.write(f"【评论 {i}】\n")
                f.write(f"用户: {comment['username']}\n")
                f.write(f"点赞: {comment['likes']} | 回复: {comment['replies']}\n")
                f.write(f"内容: {comment['content']}\n")
                f.write("-"*60 + "\n\n")

        print(f"  💾 评论已保存: comments/{os.path.basename(comment_file)}")

    return {
        'status': 'success',
        'url': url,
        'video_id': video_id,
        'title': video_title,
        'video_number': video_number,
        'subtitle_file': subtitle_file,
        'comment_file': comment_file,
        'subtitle_chars': len(subtitle_content),
        'comment_count': len(comments) if comments else 0
    }

# =============================================================================
# 主程序
# =============================================================================

__VERSION__ = '1.1.0'

def main():
    # 立即打印启动信息（确保有输出）
    print("\n" + "="*70)
    print("  YouTube 视频内容提取工具")
    print(f"  版本: {__VERSION__}")
    print("="*70)
    print()

    # 检查 yt-dlp
    try:
        result = subprocess.run(
            [sys.executable, '-m', 'yt_dlp', '--version'],
            capture_output=True, text=True, timeout=10
        )
        print(f"✅ yt-dlp 已安装 (版本: {result.stdout.strip()})")
    except:
        print("❌ yt-dlp 未安装！请运行以下命令安装:")
        print(f"   pip install yt-dlp")
        print(f"   或: {sys.executable} -m pip install yt-dlp")
        return

    # 检查 JS runtime (yt-dlp[default] 依赖的 JavaScript 环境)
    try:
        # 使用一个简单的视频提取测试来检测 JS runtime 警告
        test_result = subprocess.run(
            [sys.executable, '-m', 'yt_dlp', '--list-subs',
             'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
            capture_output=True, text=True, timeout=30
        )
        # 检查 stderr 中是否有 JS runtime 警告
        js_warning = False
        if "JS runtime" in test_result.stderr or "without a JS runtime" in test_result.stderr:
            js_warning = True

        if js_warning:
            print("⚠️  检测到缺少 JS runtime！这可能导致字幕提取失败")
            print("   请运行以下命令安装完整依赖:")
            print(f"   pip install yt-dlp[default]")
            print(f"   或: {sys.executable} -m pip install yt-dlp[default]")
        else:
            print("✅ JS runtime 检查通过")
    except Exception as e:
        print(f"⚠️  检查 JS runtime 时出错: {str(e)[:50]}")
        print("   如遇字幕提取问题，请尝试安装完整依赖:")
        print(f"   pip install yt-dlp[default]")

    # 检查输入文件
    if not os.path.exists(INPUT_FILE):
        print(f"\n⚠️  输入文件不存在: {INPUT_FILE}")
        print("   正在创建测试文件...")
        with open(INPUT_FILE, 'w', encoding='utf-8') as f:
            f.write("https://www.youtube.com/watch?v=dQw4w9WgXcQ\n")
        print(f"   已创建测试文件，包含 Rick Astley 测试视频")

    # 读取链接
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        urls = [line.strip() for line in f if line.strip() and not line.startswith('#')]

    if not urls:
        print("❌ 输入文件中没有有效链接")
        return

    print(f"\n📋 共读取 {len(urls)} 个视频链接")

    # 检查每日限制
    daily_count = get_daily_count()
    remaining = DAILY_LIMIT - daily_count
    print(f"📊 今日已处理: {daily_count} / {DAILY_LIMIT}")

    if remaining <= 0:
        print("⚠️  已达到今日处理上限，请明天再运行")
        return

    urls = urls[:remaining]
    print(f"🎯 本次将处理: {len(urls)} 个视频\n")

    # 获取起始编号（读取已有字幕文件中的最大编号）
    start_number = get_next_number()
    print(f"📝 起始编号: {start_number:03d}（读取已有文件自动递增）")

    # 处理视频
    results = []
    start_time = time.time()
    current_number = start_number

    for i, url in enumerate(urls, 1):
        print(f"\n【进度 {i}/{len(urls)}】")

        try:
            result = process_video(url, current_number)
            results.append(result)
            # 只有成功或跳过的视频才递增编号
            if result['status'] in ['success', 'skipped']:
                current_number += 1
        except Exception as e:
            print(f"  💥 严重异常: {str(e)}")
            results.append({
                'status': 'failed',
                'url': url,
                'video_number': current_number,
                'reason': f'严重异常: {str(e)[:80]}'
            })
            # 网络异常时暂停
            if 'network' in str(e).lower() or 'connection' in str(e).lower():
                print(f"  ⏸️  检测到网络异常，暂停 {NETWORK_PAUSE//60} 分钟...")
                time.sleep(NETWORK_PAUSE)
            # 失败也递增编号，避免重复
            current_number += 1

        # 更新每日计数
        if results[-1]['status'] in ['success', 'skipped']:
            daily_count += 1
            update_daily_count(daily_count)

        # 不是最后一个视频则延迟
        if i < len(urls):
            random_delay()

    # 输出汇总
    elapsed = time.time() - start_time
    success_count = sum(1 for r in results if r['status'] == 'success')
    failed_count = sum(1 for r in results if r['status'] == 'failed')
    skipped_count = sum(1 for r in results if r['status'] == 'skipped')

    print("\n" + "="*70)
    print("📊 处理汇总")
    print("="*70)
    print(f"✅ 成功: {success_count} 个")
    print(f"❌ 失败: {failed_count} 个")
    print(f"⏭️  跳过: {skipped_count} 个")
    print(f"⏱️  总耗时: {elapsed:.1f} 秒")

    if failed_count > 0:
        print("\n❌ 失败列表:")
        for r in results:
            if r['status'] == 'failed':
                print(f"  - {r['url'][:60]}: {r['reason']}")

    if skipped_count > 0:
        print("\n⏭️  跳过列表:")
        for r in results:
            if r['status'] == 'skipped':
                print(f"  - {r.get('title', '未知')[:50]}: {r['reason']}")

    print(f"\n📁 输出目录:")
    print(f"   字幕: {SUBTITLES_DIR}")
    print(f"   评论: {COMMENTS_DIR}")
    print(f"   下一个编号: {current_number:03d}")
    print("="*70 + "\n")

if __name__ == '__main__':
    main()
