#!/usr/bin/env python3
"""Build search-index.json for LMCS Bye Laws static site."""
import os, json, re

ROOT = os.path.dirname(os.path.abspath(__file__))
SKIP_FILES = {'search.html'}

def strip_tags(html):
    return re.sub(r'<[^>]+>', ' ', html)

def clean(text):
    return ' '.join(text.split())

def parse_page(content):
    # Title — strip site suffix
    m = re.search(r'<title>(.*?)</title>', content, re.DOTALL | re.IGNORECASE)
    title = clean(strip_tags(m.group(1))) if m else ''
    title = re.sub(r'\s*[–—-]\s*LMCS Bye Laws 2026\s*$', '', title).strip()

    # Headings h1–h3
    headings = [clean(strip_tags(h))
                for h in re.findall(r'<h[123][^>]*>(.*?)</h[123]>', content, re.DOTALL | re.IGNORECASE)]

    # Main body — extract <main> block, strip nav/sidebar/script/style inside it
    m = re.search(r'<main[^>]*>(.*?)</main>', content, re.DOTALL | re.IGNORECASE)
    body_html = m.group(1) if m else ''
    # Remove script/style blocks
    body_html = re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', body_html, flags=re.DOTALL | re.IGNORECASE)
    body = clean(strip_tags(body_html))

    # Breadcrumb path for display
    m = re.search(r'<div[^>]+class="breadcrumb"[^>]*>(.*?)</div>', content, re.DOTALL | re.IGNORECASE)
    breadcrumb = clean(strip_tags(m.group(1))).replace('›', '›') if m else ''

    return title, headings, body, breadcrumb

index = []

for dirpath, dirs, files in os.walk(ROOT):
    dirs[:] = sorted(d for d in dirs if not d.startswith('.'))
    for fname in sorted(files):
        if not fname.endswith('.html'):
            continue
        if fname in SKIP_FILES:
            continue
        fpath = os.path.join(dirpath, fname)
        rel = os.path.relpath(fpath, ROOT).replace('\\', '/')
        with open(fpath, encoding='utf-8') as f:
            content = f.read()
        title, headings, body, breadcrumb = parse_page(content)
        if not title:
            continue
        index.append({
            'url': rel,
            'title': title,
            'headings': headings,
            'breadcrumb': breadcrumb,
            'body': body[:3000]
        })

out_path = os.path.join(ROOT, 'search-index.json')
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(index, f, ensure_ascii=False, separators=(',', ':'))

print(f'Indexed {len(index)} pages → search-index.json ({os.path.getsize(out_path)//1024} KB)')
for p in index[:5]:
    print(f'  {p["url"]:55s}  {p["title"]}')
