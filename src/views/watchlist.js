import './watchlist.css';
import { store, getAsset } from '../store.js';

export function renderWatchlist(container, navigateTo) {
  const { watchlist } = store.state;

  container.innerHTML = `
    <div class="dashboard-header">
      <div>
        <h1 class="view-title">Watchlist</h1>
        <p class="view-subtitle">Track your favorite assets</p>
      </div>
    </div>

    <div class="card watchlist-main-card">
      <div class="table-container">
        <table class="data-table interactive-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Price</th>
              <th>24h Change</th>
              <th>Volume</th>
              <th>Market Cap</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="watchlist-tbody">
          </tbody>
        </table>
      </div>
    </div>
  `;

  const tbody = container.querySelector('#watchlist-tbody');

  function renderTable() {
    if (watchlist.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><span class="material-icons">visibility_off</span><h2>Empty Watchlist</h2><p>Click the star icon on any asset to add it here.</p><button class="btn-primary" style="margin-top: 16px;" id="goto-markets-wl">Explore Markets</button></div></td></tr>';
      const btn = container.querySelector('#goto-markets-wl');
      if (btn) btn.addEventListener('click', () => navigateTo('markets'));
      return;
    }

    let html = '';
    watchlist.forEach(symbol => {
      const asset = getAsset(symbol);
      html += `
        <tr data-symbol="${asset.symbol}">
          <td>
            <div class="asset-cell">
              <div class="asset-icon">${asset.symbol.charAt(0)}</div>
              <div>
                <div class="symbol">${asset.symbol}</div>
                <div class="name">${asset.name}</div>
              </div>
            </div>
          </td>
          <td class="price-cell">$${asset.price.toFixed(2)}</td>
          <td>
            <span class="${asset.up ? 'profit-bg' : 'loss-bg'}">${asset.change}</span>
          </td>
          <td>${asset.volume}</td>
          <td>${asset.cap}</td>
          <td>
            <div class="row-actions">
              <button class="icon-btn remove-wl-btn tooltip" style="color: #FFD700;" title="Remove from Watchlist">
                <span class="material-icons">star</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html;

    // Events
    container.querySelectorAll('.remove-wl-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tr = e.target.closest('tr');
        const sym = tr.dataset.symbol;
        store.toggleWatchlist(sym);
        renderTable(); 
      });
    });

    container.querySelectorAll('tr[data-symbol]').forEach(row => {
      row.addEventListener('click', (e) => {
        if (!e.target.closest('.remove-wl-btn')) {
          navigateTo('stock-detail', { symbol: row.dataset.symbol });
        }
      });
    });
  }

  renderTable();
}
