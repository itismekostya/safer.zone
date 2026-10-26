# safer — Price

Buildless HTML/CSS/JS. `dist/` is the website. Run a static server in this folder with `python3 -m http.server 4176 --directory dist`. Run state-machine checks with `npm test`.

Arial 18px, regular, normal line height. Spacing uses a 10px base (5px within the amount, 20px between the title and price control, 40px page margins and between entries). Amount boxes are 33px high with 2px strokes. The ○, ⊙ and ● states use a 16px CSS circle with the same 2px stroke, a 4px central dot, or a solid fill. They no longer depend on font glyph metrics or canvas scaling, which gave inconsistent circle sizes and stroke weights across browsers. The shared-budget control is disabled.

An untouched amount needs one press to select the suggested price, then a second press to open. Typing a valid amount selects it immediately; the next press opens the content. After selection the amount field disappears. The remaining circle opens/pauses directly; it never returns to ⊙. Zero is valid. Both comma and period decimals are accepted. Mobile inputs request the system decimal keyboard.

Confirmed amounts for Episode I and Catalog.pdf are remembered in this browser with `settings.rememberSelections: true` in `dist/content.js`. Reloading restores direct one-press access without asking for the amount again. This storage belongs to the current browser and device; it does not synchronize between devices or survive clearing site data. Set the option to `false` to temporarily reset each visit for button testing.

Before confirmation, only the circle can select the suggested price or confirm the entered amount. The Episode I title is inactive and cannot select a price or confirm it. Once the amount is confirmed, the title and circle both toggle playback. During playback, only that episode block remains above the video; the catalogue, future episodes and budget button are hidden. Either the title or circle stops playback and restores the page. The video loops continuously until stopped with the title or circle. There is no close button and no native video controls. The video occupies the full viewport without padding, preserving the whole frame: edge-to-edge in width on portrait phones, edge-to-edge in height on wide desktops.

Green and orange apply only while selecting the amount. After confirmation, the remaining circle returns to black in both its open and filled states.

After the amount field disappears, the circle's layout height becomes its visible 16px diameter, so the title-to-control gap remains 20px instead of adding empty space from the former 33px row. Its invisible touch target stays enlarged without changing that spacing.

This is the requested price-selection prototype. No payment processor is connected and no money is charged. The selected amount is not a completed payment or a secure paywall.

`dist/content.js` configures media. Episode I uses the supplied video, converted to browser-compatible MP4. Catalog.pdf uses the supplied PDF. Confirming its amount opens the document in a new tab; subsequent presses reopen it directly.

The original video is retained locally. The website uses `dist/assets/episode-i.mp4`, H.264/AAC, fast-start, original resolution and frame rate.

## GitHub Pages

After GitHub Pages is enabled, `.github/workflows/pages.yml` publishes `dist/` after changes to `main`. Deployment is skipped while the repository is private. No build or dependency installation is required. The workflow runs the state checks, uploads the static site and deploys it to GitHub Pages.

Edit the HTML, CSS and JavaScript in `dist/`; media is in `dist/assets/`. Use `settings.rememberSelections` in `dist/content.js` to control browser persistence.
