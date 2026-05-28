#!/usr/bin/env python3
"""Build search-index.json for LMCS Bye Laws static site."""
import os, json, re

ROOT = os.path.dirname(os.path.abspath(__file__))
SKIP_FILES = {'search.html'}

HTML_ENTITIES = {'&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
                  '&#8592;': '', '&#8594;': '', '&#8593;': '', '&#8595;': '',
                  '&mdash;': '—', '&ndash;': '–', '&nbsp;': ' '}

def decode_entities(text):
    for ent, rep in HTML_ENTITIES.items():
        text = text.replace(ent, rep)
    # remove remaining numeric entities
    text = re.sub(r'&#\d+;', '', text)
    return text

def strip_tags(html):
    return re.sub(r'<[^>]+>', ' ', html)

def clean(text):
    return ' '.join(text.split())

def parse_page(content):
    # Title — strip site suffix
    m = re.search(r'<title>(.*?)</title>', content, re.DOTALL | re.IGNORECASE)
    title = clean(decode_entities(strip_tags(m.group(1)))) if m else ''
    title = re.sub(r'\s*[–—-]\s*LMCS Bye Laws 2026\s*$', '', title).strip()

    # Headings h1–h3
    headings = [clean(decode_entities(strip_tags(h)))
                for h in re.findall(r'<h[123][^>]*>(.*?)</h[123]>', content, re.DOTALL | re.IGNORECASE)]

    # Main body — extract <main> block, strip nav/sidebar/script/style/back-link inside it
    m = re.search(r'<main[^>]*>(.*?)</main>', content, re.DOTALL | re.IGNORECASE)
    body_html = m.group(1) if m else ''
    # Remove script/style/back-link/footer blocks
    body_html = re.sub(r'<(script|style|footer)[^>]*>.*?</\1>', ' ', body_html, flags=re.DOTALL | re.IGNORECASE)
    # Remove back-link anchors (← arrows)
    body_html = re.sub(r'<a[^>]+class="back-link"[^>]*>.*?</a>', ' ', body_html, flags=re.DOTALL | re.IGNORECASE)
    body = clean(decode_entities(strip_tags(body_html)))

    # Breadcrumb path for display — decode entities for clean text
    m = re.search(r'<div[^>]+class="breadcrumb"[^>]*>(.*?)</div>', content, re.DOTALL | re.IGNORECASE)
    breadcrumb = clean(decode_entities(strip_tags(m.group(1)))) if m else ''

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
