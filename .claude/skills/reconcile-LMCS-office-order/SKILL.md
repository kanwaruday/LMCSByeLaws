---
name: reconcile-LMCS-office-order
description: Reconcile a new LMCS office order (PDF/DOCX) against the live LMCSByeLaws site and the Obsidian vault knowledge base. Finds conflicts with existing published content, resolves them with the user directly (never guesses), updates the site and the vault as one unit, verifies live deployment. Use when the user shares a new office order document and wants it incorporated into the bye-laws site, or asks to "reconcile", "add", or "incorporate" an office order.
---

# Reconcile LMCS Office Order

Takes one or more new LMCS office order documents and incorporates them into both the
public bye-laws site (`kanwaruday.github.io/LMCSByeLaws`) and Uday's Obsidian vault
knowledge base, as a single unit of work.

## Invocation

`/reconcile-LMCS-office-order <path-to-pdf-or-docx> [more paths...]`

Accepts one file or several. Process multiple documents in sequence, one fully through
the pipeline before starting the next — do not parallelize. Conflicts must surface one
order at a time; tangling two orders' conflicts together makes them harder for the user
to resolve correctly.

## Non-negotiable guardrails

These apply on every run without exception. If a run would violate one of these, stop
and say so rather than proceeding.

1. **Never guess on a genuine conflict.** If the new order's numbers, definitions, or
   deadlines disagree with what's currently published, stop and ask the user directly —
   present both versions plainly, one conflict at a time if there are several. Do not
   infer an answer from the document alone, even if one reading seems more likely.
2. **Site and vault are one unit of work, not two passes.** The run is not complete —
   and must not be reported as complete — until both the site and the vault are updated
   and verified. Do not stop after the push and call it finished.
3. **Never push without an explicit go-ahead.** Committing locally is fine to do without
   asking. `git push` always stops and asks, every time, regardless of how routine or
   low-risk the change looks.
4. **Never bundle unrelated pending work.** Run `git status` before staging anything.
   Anything not touched by this run — pre-existing uncommitted changes, untracked files
   — gets named explicitly to the user and left alone, never silently included in a
   commit or a `git add -A`.
5. **Verify, don't assume, at three separate points:**
   - Locally, in an actual browser against a local `python3 -m http.server`, before
     committing — click through every new/changed page, not just read the diff.
   - The live public URL, after pushing — poll until the actual change is visible, don't
     trust the push exit code alone.
   - The vault files, by reading them back after writing, not just trusting the Write
     call succeeded with the intended content.
6. **Re-derive paths every run.** Never hardcode the repo or vault location from a prior
   session. Confirm the bye-laws repo by checking its git remote resolves to
   `github.com/kanwaruday/LMCSByeLaws.git` — it has moved location before. Find the vault
   via `~/.claude/CLAUDE.md`'s vault-location pointer, not a remembered path.
7. **Stay scoped.** Fix a stale link, a broken reference, or a duplicate-file pattern
   *if directly encountered* while doing the real work of this run, and say so. Do not
   turn a content-reconciliation run into an unrelated repo audit unless the user
   explicitly asked for one.

## Pipeline

### 1. Extract

- Table-aware extraction: `python-docx` for `.docx` files (never a naive text/textutil
  dump for anything containing a table — column alignment breaks silently). For PDFs,
  extract text properly, preserving table structure where present.
- Pull **Ref.**, **Date**, and **Subject** from the document's own header.
- If the Ref. field is blank, a placeholder (e.g. `OO/__/26`), or otherwise malformed in
  the source document itself, that is a finding to report back to the user — not
  something to silently paper over by inventing a number from the filename.

### 2. Map what it touches

- Search the live site by topic and keyword, not only by office-order number — existing
  related content will not yet cite the new order.
- Produce one table before writing anything: `page → {net-new | clean supersession |
  conflicts}`. Show this to the user as part of the analysis, the same way a deep
  reconciliation was presented in prior sessions, before making any edits.

### 3. Resolve, page by page

- **Clean supersession** (no conflict, just newer): proceed. Move the old content to
  `archived/` (or the appropriate section's archive), add it to `archived/index.html`,
  and cross-link both directions — the archived page notes what supersedes it, the new
  page notes what it supersedes. This is the established site pattern; follow it exactly
  rather than inventing a variant.
- **Conflict** (the new order's text genuinely disagrees with what's published — a
  number, a deadline, a definition, a term used for two different things): stop, present
  both versions clearly, and get an explicit decision before writing anything for that
  page. Batch multiple independent conflicts into as few rounds of questions as
  reasonable, but never resolve one without asking.
- **Net-new**: draft using an existing sibling page as the literal template — same
  `.office-order`/`.ref` box markup, same breadcrumb depth, same sidebar structure,
  same card-grid conventions. Never freehand a new HTML pattern when the site already
  has one for this shape of content.
- **Side channel — policy reform signals:** if, during conflict resolution, the user's
  answer reads as "this rule itself may need to change" rather than "here is what it
  currently, correctly says," that is a different category from a normal content
  update. Log it to the vault's `LMCS Bye Laws 2026/Policy Reforms To-Do.md` (create if
  absent) instead of quietly writing it into the page as settled fact.

### 4. Wire it in

- Update the relevant parent index / card-grid page(s) so new content is discoverable
  from normal navigation, not reachable only by a direct URL.
- Exactly **one** page per office order carries the extractable `Ref.: X ... Date: Y`
  citation (the section landing page is usually right). Do not repeat the citation
  verbatim on every sub-page it touches — the homepage's Latest Updates banner extracts
  one entry per Ref./Date pair it finds, and repeating the citation floods it with
  near-duplicates for a single order. Sub-pages get a lighter inline reference instead
  (e.g. "Updated 2026-09-16 per OO-09/26" as plain text with a link).
- If editing a landing page that turns out to have a twin-file duplicate (`X.html`
  sitting beside `X/index.html`), fix it in passing and say so — but do not go looking
  for other instances of that pattern unless asked.

### 5. Verify the site — before any git command

- Rebuild the search index: `python3 build-search-index.py`.
- Run a full resolved-path link-integrity scan across the repo. Resolve every `href` to
  its actual filesystem target relative to the linking file's own location — never
  string-match on filename alone, since an unrelated file elsewhere in the repo can
  share a basename with something just edited.
- Start a local server (`python3 -m http.server <port>`) and drive it with the browser
  tool: open every new/changed page, follow at least one cross-link and one back-link,
  run one search query relevant to the new content, and check the homepage banner shows
  exactly one entry for this order, not several.

### 6. Commit → confirm → push → confirm live

- `git add` only the specific files this run touched (never `-A` blindly — re-check
  `git status` against the intended file list first).
- Write a commit message that documents what changed, which conflicts were resolved and
  how they were decided, and what was superseded/archived. End with the standard
  `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` trailer.
- Stop and ask for explicit confirmation before `git push`.
- After pushing, poll the actual public URL for the specific change (not just that the
  site loads) before treating the site side as done.

### 7. Vault sync — required, not optional cleanup

- Create or update the matching vault note(s) for **every** page the site side touched
  — full coverage, not a subset picked for convenience.
- Match the vault's existing frontmatter shape exactly: `title`, `section`, `subsection`,
  `source_url`, `tags`. Look at a real sibling note in the same subsection before writing
  one, rather than assuming the shape.
- Every note whose content actually changed gets a `> [!warning] Updated <date> per
  OO-X` (or `> [!success] Net-new note, <date>` for a brand-new one) callout stating
  what changed and why — never a silent overwrite that erases the record of what the
  note used to say.
- Refresh the section index note (its "Pages in This Section" list and any summary/
  quick-reference table) if it is now stale because of this run.
- While updating `source_url` fields, check whether other notes in the same section
  carry the same now-dead URL pattern (this has happened before after a site
  restructure) — fix what's found, report what's out of scope.
- Update the project note (`work/active/lmcs-bye-laws.md` or equivalent): add a Current
  Status entry for this run, add Key Decisions rows for anything the user personally
  resolved, update Open Tasks.

### 8. Final report

One summary covering both sides — not two separate summaries that leave it ambiguous
whether the vault half actually happened:

- Pages changed on the site (new / superseded / updated), with links
- Conflicts encountered and how each was resolved, attributed to the user's actual
  decision, not presented as Claude's inference
- Anything sent to Policy Reforms To-Do
- Vault notes created/updated
- Confirmation that both the live site and the vault files were verified, not just
  written

## Non-goals

- Not a general repo-cleanup tool. Structural issues (duplicate files, broken links
  elsewhere) get fixed only when directly encountered in the course of this run, and are
  reported — never silently expanded into an unrelated audit.
- Not autonomous on push or on conflicts. Those two checkpoints stay manual regardless
  of how smoothly the rest of a run goes.
- Not a Notion sync. Works from the vault and the live site only. If Notion is still a
  source of truth for some content, reconciling against it is out of scope for this
  skill.
