# Teyvat Travel

Static site built with HTML5 and CSS only (no JavaScript, no build step).
Open `index.html` in a browser, or serve the folder with any static server.

```
index.html              Home (hero, our story, director, mission, nations, why us, FAQ, contact)
nations/                One page per nation
  mondstadt.html  liyue.html  sumeru.html  inazuma.html
  fontaine.html  natlan.html  snezhnaya.html      all use the same "stops" layout
css/
  styles.css            Shared: tokens, header, footer, buttons
  home.css              Home page
  nation-stops.css      Shared layout for every nation page
  themes/               One small file per nation (colors, fonts, hero art)
assets/
  icons/                Logos, nation crests, UI icons (tinted variants pre-rendered)
  img/                  Photos and backgrounds, grouped by page
```

## Fonts
Loaded from Google Fonts: Playfair Display (+ SC), Bodoni Moda, Plus Jakarta Sans,
DM Serif Display, Alegreya, Newsreader. To work fully offline, download them and add
`@font-face` rules to `css/styles.css`.

## Notes
- Sizing scales with the viewport (`html { font-size: 100vw / 90 }`), matching the
  1920px prototype at any desktop width; below 800px it switches to a stacked layout.
- The FAQ uses native `<details>`.
