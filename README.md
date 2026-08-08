# John Rayver Colina — Portfolio

Personal portfolio site. Plain HTML/CSS/JS, no build step, no framework.

## Structure

```
.
├── index.html          # markup
├── css/
│   └── style.css        # all styles
├── js/
│   └── script.js         # theme toggle, nav, avatar crossfade, photo stack, chat widget
└── assets/               # profile + gallery photos (see assets/README.txt)
```

## Running locally

No build tools needed — just serve the folder. Easiest options:

- VS Code "Live Server" extension → right-click `index.html` → "Open with Live Server"
- or, from this folder: `npx serve .`

Just make sure the tool serves **this folder** (the one containing `index.html`
and `assets/`), not a parent folder.

## Adding your photos

See `assets/README.txt` — drop `profile-1`, `profile-2` (avatar) and
`gallery-1`, `gallery-2`, `gallery-3` (photo stack) into `assets/`. Any of
`.jpg`, `.jpeg`, `.png`, `.webp` works, no renaming needed.

## Deploying

**GitHub:** push this folder as a repo (this README, `.gitignore`, etc. are
already set up for it).

**Vercel:** import the GitHub repo in Vercel → Framework Preset: **Other** →
no build command, output directory is the project root. Deploy.
