# Teyvat Travel

Static site built with HTML, CSS, and vanilla JavaScript (no build step).
Open `index.html` in a browser, or serve the folder with any static server.
Package filters, inquiry validation, and booking estimates run in the browser. The home page filters by maximum budget, and inquiry forms require a dotted email domain and a Philippine mobile number (+63).
The inquiry forms are demo-only: they do not send or save details or reserve a trip.

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
js/
  data.js               Shared package names, trip lengths, prices, and focus
  filter.js             Home-page package filters
  inquiry.js            Shared inquiry forms, validation, and estimates
assets/
  icons/                Logos, nation crests, UI icons (tinted variants pre-rendered)
  img/                  Photos and backgrounds, grouped by page
```

## Fonts
Loaded from Google Fonts: Playfair Display (+ SC), Bodoni Moda, Plus Jakarta Sans,
DM Serif Display, Alegreya, Newsreader. To work fully offline, download them and add
`@font-face` rules to `css/styles.css`.

## Notes
- Text uses a bounded fluid size and switches to a stacked layout below 800px.
- Inquiry forms are generated from one shared JavaScript template so the home and
  nation pages use the same labels, validation, and help text.
- The FAQ uses native `<details>`.
