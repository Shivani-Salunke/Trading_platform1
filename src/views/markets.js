import './markets.css';
import { MARKET_DATA } from '../store.js';

export function renderMarkets(container, navigateTo) {
  container.innerHTML = `
    <div class="dashboard-header">
      <div>
        <h1 class="view-title">Markets</h1>
        <p class="view-subtitle">Live market data and trends</p>
      </div>
    </div>

    <div class="markets-controls">
      <div class="tabs">
        <button class="tab active" data-filter="Top Gainers">Top Gainers</button>
        <button class="tab" data-filter="Top Losers">Top Losers</button>
        <button class="tab" data-filter="All">All Assets</button>
      </div>
      
      <div class="markets-search">
        <span class="material-icons search-icon">search</span>
        <input type="text" id="market-search" placeholder="Filter assets...">
      </div>
    </div>

    <div class="card markets-list">
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
          <tbody id="markets-tbody">
            <!-- Populated via JS -->
          </tbody>
        </table>
      </div>
    </div>
  `;

  const tbody = container.querySelector('#markets-tbody');
  const searchInput = container.querySelector('#market-search');
  const tabs = container.querySelectorAll('.tab');

  let currentFilter = 'Top Gainers';
  let searchQuery = '';

  function renderTable() {
    let filtered = [...MARKET_DATA];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q));
    }

    if (currentFilter === 'Top Gainers') {
      filtered = filtered.filter(a => a.up).sort((a,b) => parseFloat(b.change) - parseFloat(a.change));
    } else if (currentFilter === 'Top Losers') {
      filtered = filtered.filter(a => !a.up).sort((a,b) => parseFloat(a.change) - parseFloat(b.change));
    }

    let html = '';
    if (filtered.length === 0) {
      html = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 32px 0;">No matching assets found.</td></tr>';
    } else {
      filtered.forEach(asset => {
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
                <button class="btn-primary buy-btn" data-symbol="${asset.symbol}">Buy</button>
              </div>
            </td>
          </tr>
        `;
      });
    }
    tbody.innerHTML = html;

    // Rebind events
    container.querySelectorAll('tr[data-symbol]').forEach(row => {
      row.addEventListener('click', (e) => {
        if(e.target.closest('.buy-btn')) {
          const symbol = e.target.closest('.buy-btn').dataset.symbol;
          navigateTo('stock-detail', { symbol });
          return;
        }
        const symbol = row.dataset.symbol;
        navigateTo('stock-detail', { symbol });
      });
    });
  }

  // Bind Events
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTable();
  });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      renderTable();
    });
  });

  // Initial render
  renderTable();
}
