// DealBeacon's behaviour: hash routes, live search and filters, sorting. The list state lives
// in the hash (#/?q=..&cat=..&store=..&min=..&sort=..) so a filtered view can be shared and
// a screenshot can open it directly. No network: everything comes from data.js.
//
//   #/            the list, with a search box
//   #/deal/<id>   one deal
//
// window.__shotReady is false while a page renders and true once it is on screen, so a
// screenshot script knows when to capture.

import { dealById, deals, pctOff, saving } from './data.js';
import { cards, dealPage, listPage, missingPage } from './views.js';

const app = document.getElementById('app');

// Read the list state out of the hash: ?q=..&cat=..&store=..&min=..&sort=..
function readState() {
  const query = location.hash.startsWith('#/?') ? location.hash.slice(3) : '';
  const params = new URLSearchParams(query);
  const sort = params.get('sort') ?? 'discount';
  return {
    q: params.get('q') ?? '',
    cat: params.get('cat') ?? '',
    store: params.get('store') ?? '',
    min: params.get('min') ?? '',
    sort: ['discount', 'saving', 'price', 'newlow'].includes(sort) ? sort : 'discount',
  };
}

// Write the list state back into the hash without adding a history entry.
function writeState(state) {
  const params = new URLSearchParams();
  if (state.q !== '') params.set('q', state.q);
  if (state.cat !== '') params.set('cat', state.cat);
  if (state.store !== '') params.set('store', state.store);
  if (state.min !== '') params.set('min', state.min);
  if (state.sort !== 'discount') params.set('sort', state.sort);
  const suffix = params.toString();
  history.replaceState(null, '', suffix === '' ? '#/' : `#/?${suffix}`);
}

// The deals a state shows, in the order the state sorts them.
export function visibleDeals(state) {
  const q = state.q.trim().toLowerCase();
  const min = state.min === '' ? 0 : Number(state.min);
  const shown = deals.filter(
    (d) =>
      (q === '' || `${d.title} ${d.store} ${d.category}`.toLowerCase().includes(q)) &&
      (state.cat === '' || d.category === state.cat) &&
      (state.store === '' || d.store === state.store) &&
      pctOff(d) >= min,
  );
  const verdictRank = { newlow: 0, strong: 1, routine: 2 };
  const by = {
    discount: (a, b) => pctOff(b) - pctOff(a) || saving(b) - saving(a),
    saving: (a, b) => saving(b) - saving(a) || pctOff(b) - pctOff(a),
    price: (a, b) => a.price - b.price || pctOff(b) - pctOff(a),
    newlow: (a, b) => verdictRank[a.verdict] - verdictRank[b.verdict] || pctOff(b) - pctOff(a),
  };
  return shown.sort(by[state.sort]);
}

function renderGrid(state) {
  const shown = visibleDeals(state);
  const grid = document.getElementById('grid');
  const count = document.getElementById('count-line');
  if (grid) grid.innerHTML = cards(shown);
  if (count) {
    count.textContent =
      shown.length === deals.length
        ? `Showing all ${deals.length} deals.`
        : `Showing ${shown.length} of ${deals.length} deals.`;
  }
  document.title =
    shown.length === deals.length
      ? 'DealBeacon — Real Black Friday deals, checked'
      : `DealBeacon — ${shown.length} of ${deals.length} deals`;
}

function renderList() {
  const state = readState();
  document.title = 'DealBeacon — Real Black Friday deals, checked';
  app.innerHTML = listPage(state);
  renderGrid(state);

  const search = document.getElementById('q');
  const store = document.getElementById('store');
  const min = document.getElementById('min');
  const sort = document.getElementById('sort');
  // Search filters the grid in place, so typing never loses focus; the other controls
  // rewrite the hash, which re-renders the whole list.
  search.addEventListener('input', () => {
    state.q = search.value;
    renderGrid(state);
  });
  search.addEventListener('change', () => writeState(state));
  store.addEventListener('change', () => {
    state.store = store.value;
    writeState(state);
    render();
  });
  min.addEventListener('change', () => {
    state.min = min.value;
    writeState(state);
    render();
  });
  sort.addEventListener('change', () => {
    state.sort = sort.value;
    writeState(state);
    render();
  });
  app.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.cat = chip.dataset.cat ?? '';
      writeState(state);
      render();
    });
  });
}

function renderDeal(id) {
  const found = dealById(decodeURIComponent(id));
  if (!found) {
    document.title = 'Not found | DealBeacon';
    app.innerHTML = missingPage();
    return;
  }
  document.title = `${found.title} | DealBeacon`;
  // The same product at another store, for the cross-store comparison.
  const others = deals.filter((d) => d.id !== found.id && d.title === found.title);
  app.innerHTML = dealPage(found, others);
}

function render() {
  window.__shotReady = false;
  const match = location.hash.match(/^#\/deal\/([^/?]+)/);
  if (match) renderDeal(match[1]);
  else renderList();
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', render);
render();
