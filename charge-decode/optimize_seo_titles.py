#!/usr/bin/env python3
"""
optimize_seo_titles.py

扫描 charge-decode/pages/ 下所有 HTML 文件，为尚未带有年份标记的
<title> 标签安全追加 " (2026 Guide)" 后缀。

规则：
  1. 若 <title> 已包含 "(2026 Guide)" 或 "(2026 Update)"，跳过（防重复追加）。
  2. 若 <title> 文本中含有问号 "?"，紧接在第一个 "?" 之后插入后缀，
     保留其后的品牌后缀（例如 "? | ChargeDecode"）。
  3. 若没有问号，则追加在文本末尾（闭合标签之前）。
  4. 只改写 <title>...</title>，不动 og:title / twitter:title 等其他标签。
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PAGES_DIR = SCRIPT_DIR / "pages"
SUFFIX = " (2026 Guide)"
EXISTING_MARKERS = ("(2026 Guide)", "(2026 Update)")

# 仅匹配 <title>...</title>，不区分大小写，非贪婪，跨行也能处理
TITLE_RE = re.compile(
    r"(<title[^>]*>)(.*?)(</title>)",
    re.IGNORECASE | re.DOTALL,
)


def optimize_title_text(inner: str) -> tuple[str, bool]:
    """返回 (新文本, 是否被修改)。"""
    stripped = inner.strip()
    if any(marker in stripped for marker in EXISTING_MARKERS):
        return inner, False  # 已经有年份标记，防重复

    if "?" in stripped:
        # 在第一个问号之后插入后缀
        idx = stripped.index("?")
        new_text = stripped[: idx + 1] + SUFFIX + stripped[idx + 1 :]
    else:
        # 没有问号则追加在末尾
        new_text = stripped + SUFFIX

    # 保留原始外层空白风格（通常无缩进），这里直接用 stripped 结果
    return new_text, True


def process_file(path: Path) -> str:
    """处理单个文件，返回状态字符串。"""
    try:
        original = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        # 个别文件可能是其他编码，兜底
        original = path.read_text(encoding="utf-8", errors="replace")

    modified = {"changed": False}

    def _replace(match: re.Match) -> str:
        open_tag, inner, close_tag = match.group(1), match.group(2), match.group(3)
        new_inner, did_change = optimize_title_text(inner)
        if did_change:
            modified["changed"] = True
            return f"{open_tag}{new_inner}{close_tag}"
        return match.group(0)

    updated = TITLE_RE.sub(_replace, original)

    if modified["changed"]:
        path.write_text(updated, encoding="utf-8", newline="")
        return "MODIFIED"
    return "SKIPPED"


def main() -> int:
    if not PAGES_DIR.is_dir():
        print(f"[ERROR] Pages directory not found: {PAGES_DIR}", file=sys.stderr)
        return 1

    html_files = sorted(PAGES_DIR.glob("*.html"))
    if not html_files:
        print(f"[WARN] No HTML files found in {PAGES_DIR}")
        return 0

    modified_count = 0
    skipped_count = 0

    print(f"Scanning {len(html_files)} HTML files in {PAGES_DIR}\n")
    print(f"{'STATUS':<10} FILE")
    print("-" * 60)

    for path in html_files:
        status = process_file(path)
        if status == "MODIFIED":
            modified_count += 1
            # 打印新 title 方便复核
            try:
                content = path.read_text(encoding="utf-8")
                m = TITLE_RE.search(content)
                new_title = m.group(2).strip() if m else "(title not found)"
            except Exception:
                new_title = "(read error)"
            print(f"{'MODIFIED':<10} {path.name}")
            print(f"{'':<10} -> {new_title}")
        else:
            skipped_count += 1
            print(f"{'SKIPPED':<10} {path.name}")

    print("\n" + "=" * 60)
    print(f"Done. Modified: {modified_count}, Skipped (already has year marker): {skipped_count}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
