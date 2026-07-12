# colors — colors.dotui.org

An interactive learning path teaching web developers the color concepts needed to build a state-of-the-art design-system color system in 2026 — perception, OKLCH, gamut, contrast, ramps, tokens. Practitioner-focused: understand and apply modern concepts, never invent new color science. TanStack Start + Vite + Tailwind v4 + fumadocs-mdx; split out of the `mehdibha/dotUI` monorepo (history preserved).

The site's deeper purpose: the maintainer is learning color deeply enough to rewrite dotUI's color engine. The site is done when they can write that rewrite spec. Every chapter must serve a real decision that engine will make — no chapter exists for completeness's sake.

## The publish gate (non-negotiable workflow)

Claude drafts chapters and playgrounds, but a chapter flips to `published` only after the maintainer has worked through it: asked their questions (**questions become revisions** — reshape the chapter until it's clear), done a voice pass on the prose, and can answer its "Check yourself" questions. Drafting may run ahead of publishing; publishing follows the maintainer's pace. If they're skimming instead of verifying, say so — that's the failure mode this workflow exists to prevent.

Status (2026-07-12): all 25 chapters are drafted. Chapters 1–16 are live on colors.dotui.org (merged to main); chapters 17–25 sit on the `chapters` branch (draft PR #5). **No chapter has passed the maintainer's publish gate yet** — expect revision requests against any of them, and merging PR #5 (= deploying 17–25) is the maintainer's call after their pass. Drafting-pipeline state lives in `.pipeline/` (gitignored).

## Curriculum

`src/config/curriculum.ts` is the single source of truth: 25 chapters in 3 parts — Foundations (1–9), Building a color system (10–20), How the greats did it (21–25: Radix, Tailwind, Material/HCT, Spectrum/Leonardo, Geist). Chapter `status` (`published` | `planned`) drives the home page; planned chapters render disabled. A chapter's MDX slug must match its `curriculum.ts` slug exactly.

Scope guards (the outline came from a multi-agent gap audit — it's settled; additions need a real gap):

- Every Part 1 chapter must name the Part 2 decision it unlocks, or it gets cut.
- No print/CMYK, no color-harmony art theory, no PhD detours — this is not colorandcontrast.com.

## Content rules

- **One chapter = one decision.** Show, don't describe: use as many interactives as the chapter needs, at two grades. The **flagship playground** (shared `Playground` frame) answers the frontmatter `question` — one per chapter. **Minimal demos** (`Demo` frame — static or one control, no chrome) sit next to any paragraph that describes something visual; if the reader has to imagine what a color looks like, that's a missing demo, not acceptable prose.
- Chapter anatomy: frontmatter (`title`, `description`, `part`, `question`) → prose with playground(s) inline → `## Check yourself` (2–3 questions answerable without scrolling up) → `## Further reading` (primary sources).
- **Verify every factual claim against primary sources while drafting** — Ottosson's OKLab posts, the CSS Color 4 spec, WCAG/APCA docs, the systems' own docs for case studies. Wrong prose on a learning site is worse than wrong code: nothing fails loudly.
- Honesty bar: teach all three ramp-generation philosophies (lightness-anchored, contrast-anchored, hand-tuned reference) with trade-offs — never dismiss a technique without a playground demonstrating why. State standards status plainly (WCAG 2 is the normative standard; APCA is not yet one).
- Prose reads in the maintainer's voice: direct, short paragraphs, no hype. Minimal code comments (one terse line max, only for non-obvious reasoning).

## Structure

- `content/chapters/<slug>.mdx` — chapter content; components imported directly in MDX.
- `src/components/playgrounds/` — one file per playground or demo; flagship frame in `src/components/playground.tsx` (eyebrow + question + optional reset), minimal-demo frame in `src/components/demo.tsx` (optional caption only). Color math via `culori`.
- `src/ui/` — vendored dotUI kit (React Aria Components + tailwind-variants). Use it; don't add UI dependencies.
- `src/routes/` — `index.tsx` (hero + curriculum), `$slug.tsx` (chapter page: gutter TOC, part/chapter eyebrow, pager). `src/routeTree.gen.ts` is generated; never edit.

## Commands

- `pnpm dev` — port 5000 (`fumadocs-mdx` generates `.source/` first; also runs on postinstall). macOS AirPlay Receiver squats on 5000; vite falls back to the next free port.
- `pnpm check` / `check:fix` — oxlint + oxfmt; `pnpm typecheck`; `pnpm build`.

## Gotchas

- A npm dep imported **only** by MDX-loaded components must be added to `optimizeDeps.include` in `vite.config.ts` (culori is there). Otherwise Vite discovers it mid-page-load in dev, re-optimizes, and splits the page across two React copies — "Invalid hook call" / null `useState` crashes in the playgrounds on first chapter visit.
- Deploys: Vercel project `dotui-colors`, production branch `main`, domain colors.dotui.org. **Pushing main is publishing** — the publish gate above is enforced by what you merge, so unpassed chapters stay `planned` in `curriculum.ts` even if their MDX is drafted.
