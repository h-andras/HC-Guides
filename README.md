## Deák Téri Hack Club Guides

This repository contains a small, static website used at the Deák Téri Hack Club to onboard members and help them through common tooling:

- Creating and completing a **Hack Club Auth** account
- Setting up **Hackatime** (time tracking for YSWS and other events)
- Applying for **GitHub Education / Student Developer Pack**
- Linking to **other helpful resources**

Everything is bilingual (English/Hungarian) and designed to be easy to browse during club meetings.

---

## Live Site & Hosting

The site is built as a static front-end and is suitable for GitHub Pages or any static hosting service.

- `CNAME` is used to point a custom domain at the deployed site.
- All pages are plain HTML/CSS/JS – no backend.

---

## Features

- **Landing page with tiles**
	- Animated welcome screen.
	- Tiles linking to each guide: HC Auth, Hackatime, GitHub Education, Other Resources.
- **Client-side navigation**
	- `js/main.js` uses the History API and `fetch` to load guide subpages without full page reloads.
	- Keeps CSS in sync when switching between sections.
- **Bilingual UI (EN / HU)**
	- `js/i18n.js` powers a simple translation system based on `data-i18n` attributes.
	- Language choice is stored in `localStorage` and reused across pages.
- **Guide layout**
	- Each main guide (`/hc-auth/`, `/hackatime/`, `/github-education/`, `/other-resources/`) has its own `index.html` with a sidebar and two language blocks.
	- Content is heavily illustrated with screenshots under `assets/`.
- **Responsive, Hack Club–themed design**
	- Styling lives in `css/styles.css`, `css/guides.css`, and `css/flag-animation.css`.
	- Works on desktop and mobile, including a collapsible sidebar.

---

## Project Structure

```text
HC-Guides/
├─ index.html             # Landing page with tiles and language toggle
├─ hc-auth/               # HC Auth guide (EN + HU)
├─ hackatime/             # Hackatime guide (EN + HU)
├─ github-education/      # GitHub Education guide (EN + HU)
├─ other-resources/       # Misc links & resources
├─ assets/
│  ├─ icon.png            # Site icon
│  └─ guides_md/          # Markdown sources and screenshots
│     ├─ EN/              # English markdown guides
│     └─ HU/              # Hungarian markdown guides
├─ css/
│  ├─ styles.css          # Global layout + landing page styles
│  ├─ guides.css          # Guide page layout + sidebar
│  └─ flag-animation.css  # Hack Club flag animation
├─ js/
│  ├─ main.js             # Client-side router + interactions
│  └─ i18n.js             # Simple translation helper
└─ package.json           # NPM metadata (markdown-it dependency only)
```

The website is static – `markdown-it` is present as a dependency but the deployed site is pure HTML/CSS/JS.

---

## Running Locally

Because client-side routing uses `fetch` and the History API, it is best to serve the site over HTTP instead of opening `index.html` directly from the filesystem.

From the project root:

```bash
# Option 1: use a simple Node static server
npx serve .

# Option 2: use Python's built-in server
python3 -m http.server 8000
```

Then open:

- http://localhost:3000 or the URL printed by `serve`, or
- http://localhost:8000 for the Python server.

Navigation between tiles and guide pages should now work correctly.

---

## Editing / Adding Guides

### Update front page tiles

- Edit `index.html` to change tile titles, icons, or descriptions.
- Translatable strings live in `data-i18n` attributes and are mapped in `js/i18n.js`.

### Edit guide content

- Each guide has its own folder with an `index.html` (for example: `hc-auth/index.html`).
- Within each guide page:
	- `.lang-en` contains the English content.
	- `.lang-hu` contains the Hungarian content.
- Images and supporting assets live under `assets/guides_md/...`.

If you prefer to draft content in Markdown, you can place `.md` files under `assets/guides_md/EN` or `assets/guides_md/HU` and then copy the rendered HTML into the guide pages.

### Add a new guide section

1. Create a new folder at the project root (e.g. `new-guide/`) with an `index.html` modeled on the existing guide pages.
2. Add a tile for it in `index.html` so it appears on the landing page.
3. Add translation keys for the new tile description in `js/i18n.js`.

The client-side router in `js/main.js` will automatically handle navigation as long as the new guide has its own `index.html` and is linked with a relative path (e.g. `/new-guide/`).

---

## Contributing / Local Tweaks

This project is mainly for use inside the club, but you’re welcome to:

- Fork it and adapt the guides for your own Hack Club.
- Translate the content into additional languages using the existing `data-i18n` approach.
- Adjust styling in `css/` to match your club’s branding.

If you open an issue or PR, please keep screenshots and instructions up to date with the current Hack Club tools.

---

## Credits

- Built for the Deák Téri Hack Club community.
- Inspired by and using assets from Hack Club.