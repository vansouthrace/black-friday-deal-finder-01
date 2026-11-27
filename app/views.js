// HTML for DealBeacon's pages, built from the deal data. Every value is escaped before it
// goes into the page, and every price shown is computed from the deal's own price and was,
// so the discount on screen always matches the two prices.
//
//   #/                                   the deal list, with search and filters
//   #/deal/<id>                          one deal, with its check and its verdict
//   #/?q=..&cat=..&store=..&min=..&sort=..   the list, pre-filtered (for sharing)

import { categories, deals, pctOff, saving, stores, verdictLabels } from './data.js';

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const usd = (n) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;

// "Nov 27, 2026, 06:30 UTC" from an ISO timestamp.
const day = (iso) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }) + ' UTC';

const verdictClass = (v) => `verdict verdict-${v}`;

// One deal as a card in the grid. The title links to the deal's own page; the store link
// goes out to the product at the store.
export function card(d) {
  return `<li class="deal-card verdict-${d.verdict}">
  <h3><a href="#/deal/${encodeURIComponent(d.id)}">${escape(d.title)}</a></h3>
  <p class="meta">${escape(d.store)} · ${escape(d.category)}</p>
  <p class="price-row"><span class="price">${usd(d.price)}</span> <span class="was"><s>${usd(d.was)}</s></span> <span class="off-badge">${pctOff(d)}% off</span></p>
  <p class="saved">You save ${usd(saving(d))}</p>
  <span class="${verdictClass(d.verdict)}">${escape(verdictLabels[d.verdict])}</span>
  <p class="why">${escape(d.why)}</p>
  <p class="checked">Checked ${day(d.checked)} · ${escape(d.source)}</p>
  <a class="store-link" href="${escape(d.url)}" rel="noopener">View at ${escape(d.store)} ↗</a>
</li>`;
}

export function cards(shown) {
  if (shown.length === 0) {
    return '<p class="empty">No deal matches those filters. Try clearing the search or lowering the minimum discount.</p>';
  }
  return `<ul class="deals">${shown.map(card).join('')}</ul>`;
}

// The list page: hero with live stats, then the filters, then the grid.
export function listPage(state) {
  const total = deals.length;
  const newLows = deals.filter((d) => d.verdict === 'newlow').length;
  const biggest = Math.max(...deals.map(pctOff));
  const biggestSaving = Math.max(...deals.map(saving));
  const chip = (cat) =>
    `<button type="button" class="chip" data-cat="${escape(cat)}" aria-pressed="${state.cat === cat ? 'true' : 'false'}">${escape(cat)}</button>`;
  const storeOptions = [''].concat(stores)
    .map((s) => `<option value="${escape(s)}" ${state.store === s ? 'selected' : ''}>${s === '' ? 'All stores' : escape(s)}</option>`)
    .join('');
  const minOptions = [
    ['', 'Any discount'],
    ['30', '30% off or more'],
    ['40', '40% off or more'],
    ['50', '50% off or more'],
  ]
    .map(([v, label]) => `<option value="${v}" ${state.min === v ? 'selected' : ''}>${label}</option>`)
    .join('');
  const sortOptions = [
    ['discount', 'Biggest discount first'],
    ['saving', 'Biggest saving first'],
    ['price', 'Lowest price first'],
    ['newlow', 'New lows first'],
  ]
    .map(([v, label]) => `<option value="${v}" ${state.sort === v ? 'selected' : ''}>${label}</option>`)
    .join('');
  return `<section class="hero">
  <h1>Black Friday deals worth your money</h1>
  <p>${total} real deals from ${stores.length} stores, each price read at the store or in a deals roundup that names it — with an honest verdict on whether it is really a deal.</p>
  <ul class="stats">
    <li><b>${total}</b><span>deals checked</span></li>
    <li><b>${newLows}</b><span>new lows</span></li>
    <li><b>${biggest}%</b><span>biggest discount</span></li>
    <li><b>${usd(biggestSaving)}</b><span>biggest saving</span></li>
  </ul>
</section>
<section class="filters" aria-label="Search and filters">
  <div class="search-row">
    <input type="search" id="q" placeholder="Search deals, stores, categories…" value="${escape(state.q)}" aria-label="Search deals">
    <select id="store" aria-label="Filter by store">${storeOptions}</select>
    <select id="min" aria-label="Filter by minimum discount">${minOptions}</select>
    <select id="sort" aria-label="Sort deals">${sortOptions}</select>
  </div>
  <div class="chips" role="group" aria-label="Filter by category">
    <button type="button" class="chip" data-cat="" aria-pressed="${state.cat === '' ? 'true' : 'false'}">All categories</button>
    ${categories.map(chip).join('')}
  </div>
</section>
<p class="count-line" id="count-line" aria-live="polite"></p>
<div id="grid" aria-live="polite"></div>`;
}

// One deal's own page: the full price story, the verdict with its evidence, and where and
// when the price was checked — plus the same product at another store, when one is listed.
export function dealPage(d, others) {
  const also =
    others.length > 0
      ? `<div class="also"><h2>Same product at another store</h2><ul>${others
          .map(
            (o) =>
              `<li><a href="#/deal/${encodeURIComponent(o.id)}">${escape(o.store)}</a> — ${usd(o.price)} (was ${usd(o.was)}, ${pctOff(o)}% off)</li>`,
          )
          .join('')}</ul></div>`
      : '';
  return `<p class="back"><a href="#/">&larr; All deals</a></p>
<article class="detail verdict-${d.verdict}">
  <h1>${escape(d.title)}</h1>
  <p class="meta">${escape(d.store)} · ${escape(d.category)}</p>
  <p class="price-row"><span class="price">${usd(d.price)}</span> <span class="was"><s>${usd(d.was)}</s></span> <span class="off-badge">${pctOff(d)}% off</span></p>
  <p class="saved">You save ${usd(saving(d))} off the usual price of ${usd(d.was)}.</p>
  <p><span class="${verdictClass(d.verdict)}">${escape(verdictLabels[d.verdict])}</span></p>
  <dl>
    <dt>Store</dt><dd>${escape(d.store)}</dd>
    <dt>Category</dt><dd>${escape(d.category)}</dd>
    <dt>Sale price</dt><dd>${usd(d.price)}</dd>
    <dt>Usual price</dt><dd>${usd(d.was)}</dd>
    <dt>Discount</dt><dd>${pctOff(d)}% off, saving ${usd(saving(d))}</dd>
    <dt>Checked</dt><dd>${day(d.checked)}</dd>
    <dt>Read in</dt><dd>${escape(d.source)}</dd>
  </dl>
  <div class="check-box">
    <h2>Is it really a deal?</h2>
    <p><strong>${escape(verdictLabels[d.verdict])}.</strong> ${escape(d.why)}</p>
    <p>The sale price and the usual price above are the ones ${escape(d.source)} showed when this deal was checked on ${day(d.checked)}. A new low means no lower price for this product has been seen this season; a strong price is a deep cut off a confirmed usual price; a routine sale is a small or often-repeated cut.</p>
  </div>
  <a class="store-link" href="${escape(d.url)}" rel="noopener">View it at ${escape(d.store)} ↗</a>
</article>
${also}`;
}

export function missingPage() {
  return `<section class="notfound"><h1>No deal there</h1><p>There is no deal at this address. <a href="#/">See all deals</a>.</p></section>`;
}
