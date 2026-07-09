# colors.dotui.org

An interactive learning path for color in design systems — from perception and
OKLCH through gamut, contrast, ramps, and tokens — building up to a
state-of-the-art color engine. Each chapter pairs short prose with a hands-on
playground.

## Curriculum

A 25-chapter path in three parts (see `src/config/curriculum.ts`):

1. **Foundations** — how color works: perception, color spaces, gamut,
   contrast, and color vision.
2. **Building a color system** — scales, lightness and chroma curves, seeds,
   neutrals, dark mode, semantic tokens, and shipping color in CSS.
3. **How the greats did it** — Radix, Tailwind, Material 3, Adobe Spectrum, and
   Vercel Geist, read through the same lens.

Chapters publish as they pass review; the rest are listed as planned.

## Stack

- [TanStack Start](https://tanstack.com/start) + Vite, React Aria Components,
  Tailwind CSS v4.
- Chapters are MDX, wired through [fumadocs-mdx](https://fumadocs.dev).
- Color math via [culori](https://culorijs.org).
- A vendored React Aria UI kit under `src/ui/`.

## Structure

- `content/chapters/*.mdx` — chapter prose + imported playgrounds. The filename
  is the slug and must match `curriculum.ts`.
- `src/config/curriculum.ts` — single source of truth for the path: parts,
  chapters, order, and published/planned status.
- `src/routes/index.tsx` — home: hero + curriculum listing.
- `src/routes/$slug.tsx` — a chapter page (fumadocs loader + MDX render).
- `src/components/playgrounds/` — the interactive playgrounds.
- `src/ui/` — the vendored React Aria component kit.

## Development

```bash
pnpm install
pnpm dev        # dev server on http://localhost:4446
pnpm build      # production build
pnpm preview    # preview the build
pnpm typecheck
pnpm check      # oxlint + oxfmt
```

`dev`, `build`, and `typecheck` run `fumadocs-mdx` first to generate `.source`.

## Adding a chapter

1. Set the chapter's `status` to `published` in `src/config/curriculum.ts`.
2. Add `content/chapters/<slug>.mdx` with matching frontmatter
   (`title`, `description`, `part`, `question`).
3. Import and place its playground inside the MDX.
