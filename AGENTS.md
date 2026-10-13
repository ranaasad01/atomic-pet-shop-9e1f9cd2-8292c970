# AGENTS.md

Project conventions for AI agents and humans editing this codebase.

## Original request
Build a single-page pet shop game called "Pet Pals" for kids aged 6–10. The player starts with 100 coins and 4 pets, each with hunger and happiness bars. They can feed (costs coins), play with and pet each animal, and the bars update. Add a small shop for food and toys, a coin counter, and a "You're a great pet keeper!" message when all pets are happy. Bright, rounded, playful design with big buttons and emoji. Everything works inside the page, with no login, no forms and no external links.

## Goal
Build "Pet Pals" — a fully self-contained single-page browser game for kids aged 6–10 where players manage 4 pets with hunger/happiness bars, spend coins on food and toys, and earn a celebration message when all pets are happy.

## Project type
other

## Design system — match this exactly
- Color tokens: `--background: #FFF8EC`, `--foreground: #2D1B00`, `--card: #FFFFFF`, `--border: #FFD580`, `--muted-foreground: #7A5C2E`, `--primary: #FF6B6B`, `--accent: #FFD700`, `--primary-hover: #ff5252`, `--accent-hover: #f5c800`

## Existing components — reuse these, don't create near-duplicates
- Footer (components/Footer.tsx)
- LanguageToggle (components/LanguageToggle.tsx)
- LocaleProvider (components/LocaleProvider.tsx)
- Navbar (components/Navbar.tsx)

## Existing i18n namespaces
Every translation key must be namespaced (`hero.title`, never a bare `title`) so two components never collide on the same catalog slot. Reuse one of these, or pick a new, distinct name:
`celebration`, `coinCounter`, `facts`, `header`, `hero`, `howToPlay`, `meta`, `nav`, `pets`, `petsGrid`, `shop`, `shopSection`

When editing or adding pages: preserve the design system above, reuse existing components and the shared nav data file, and keep the established structure and tone.
