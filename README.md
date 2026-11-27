# DealBeacon — Real Black Friday Deal Finder

[![make.fun](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/vansouthrace/black-friday-deal-finder-01/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/vansouthrace/black-friday-deal-finder-01/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01)

DealBeacon is a static Black Friday and Cyber Monday deal finder with 49 real deals from 5 stores — Amazon, Best Buy, Target, Walmart and Kate Spade Outlet. Every price was read from the store or from a deals roundup that names the store, on the date shown on each deal, and every deal carries an honest verdict: **New low**, **Strong price** or **Routine sale**, with the evidence for the call.

This is an entry for the [make.fun Black Friday deal finder bounty](https://make.fun/bounty/black-friday-deal-finder-01).

## What it does

- **49 checked deals** across 17 categories — audio, wearables, TVs, gaming, home, kitchen, toys, fashion and more — each with its product, store, sale price, usual price, discount, a link to the product at that store, and when the price was checked.
- **Search and filters that work**: free-text search, category chips, store and minimum-discount filters, and sorting by biggest discount, biggest saving, lowest price or new lows first. The filter state lives in the URL hash, so a filtered view can be shared.
- **An honest signal on every deal**: 7 new lows across 6 products (AirPods Pro 3 at $149 at Amazon and Walmart, Sony WH-1000XM5 at $169, the TCL 65-inch TV at $229.99, the Ring Battery Doorbell 2K at $38, the MacBook Neo at $599, the Kate Spade Lucy wristlet at $26), the rest marked strong or routine with a one-line reason.
- **Cross-store comparison**: the same product at another store is shown on its detail page (AirPods Pro 3 at Amazon and Walmart, Beats Studio Pro at Amazon and Target).
- **Detail pages** for every deal with the full price story, the verdict and its evidence, and where and when the price was read.
- **Phone layout**: the grid collapses to one column and the filters stack, verified with a phone-size screenshot.
- **Nothing placeholder**: every card shows a real product, a real price and a real store link; an empty filter result says so plainly instead of showing a blank page.

## How it is built

- `app/` — the site as plain static files, no build step, no network requests: `index.html`, `style.css`, `data.js` (the deals), `views.js` (the pages) and `main.js` (routing, search, filters, sorting). Served with `app/` at the root.
- `main.ts` — the hand-in program: copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored make.fun library.
- `vendor/makefun-frontend.ts` — the kit's copy, unchanged.
- `screenshots/` — 4 real renders of the site in headless Chrome: the full list, a filtered view, a deal page, and a phone-size view.

## Run it locally

```sh
# serve app/ at http://localhost:8080 (any static server works)
python3 -m http.server 8080 --directory app
# or: node --experimental-strip-types serve.ts  (from the kit's starter, if copied in)

# build the hand-in output
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## How the deals were checked

Prices were read on 27 November 2026 (Black Friday) from Redmond Pie's 100+ tech deals roundup, Applescoop's electronics guide, Flash Deal Feed's Target list (prices checked 25 November), DealNews' Walmart Top 100 and Yahoo Shopping's live blog. Each deal on the site names its source and its check time. Prices change during Black Friday week — the site says so, and tells shoppers to confirm the price at the store before buying.

## License

MIT — see [LICENSE](LICENSE).
