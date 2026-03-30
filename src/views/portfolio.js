import './portfolio.css';
import { store, getAsset } from '../store.js';

export function renderPortfolio(container, navigateTo) {
  const { portfolio, balance } = store.state;
  
  let invested = 0;
  let currentPortfolioValue = 0;
  
  const enrichedPortfolio = portfolio.map(p => {
    const asset = getAsset(p.symbol);
    const currentValue = p.shares * asset.price;
    const costBasis = p.shares * p.avgPrice;
    const profit = currentValue - costBasis;
    const profitPercent = (profit / costBasis) * 100;
    
    invested += costBasis;
    currentPortfolioValue += currentValue;
    
    return {
      ...p,
      asset,
      currentValue,
      costBasis,
      profit,
      profitPercent,
      isProfit: profit >= 0
    };
  });

  const totalValue = balance + currentPortfolioValue;
  const totalProfit = currentPortfolioValue - invested;
  const profitPercentage = invested > 0 ? (totalProfit / invested) * 100 : 0;
  const isProfit = totalProfit >= 0;

  container.innerHTML = `
    <div class="dashboard-header">
      <div>
        <h1 class="view-title">My Portfolio</h1>
        <p class="view-subtitle">Monitor your asset performance</p>
      </div>
    </div>

    <div class="portfolio-summary-grid">
      <div class="card portfolio-main-card">
        <div class="label">Total Portfolio Value</div>
        <div class="amount h1">$${totalValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        <div class="${isProfit ? 'profit-bg' : 'loss-bg'}">
          ${isProfit ? '+' : '-'} $${Math.abs(totalProfit).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${profitPercentage.toFixed(2)}%) All Time
        </div>
      </div>
      
      <div class="card stat-card">
        <div class="stat-content">
          <div class="stat-title">Cash Balance</div>
          <div class="stat-value">$${balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        </div>
      </div>
      
      <div class="card stat-card">
        <div class="stat-content">
          <div class="stat-title">Cost Basis</div>
          <div class="stat-value">$${invested.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        </div>
      </div>
    </div>

    <!-- Allocation Bar -->
    <div class="card allocation-card">
      <h3>Asset Allocation</h3>
      <div class="allocation-bar" id="allocation-bar"></div>
      <div class="allocation-legend" id="allocation-legend"></div>
    </div>

    <div class="card portfolio-list-card">
      <div class="card-header">
        <h3>Your Assets</h3>
      </div>
      <div class="table-container">
        <table class="data-table interactive-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Shares</th>
              <th>Avg Price</th>
              <th>Current Price</th>
              <th>Total Value</th>
              <th>Return</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="portfolio-tbody">
          </tbody>
        </table>
      </div>
    </div>
  `;

  const tbody = container.querySelector('#portfolio-tbody');
  
  if (enrichedPortfolio.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><span class="material-icons">account_balance_wallet</span><h2>Empty Portfolio</h2><p>You haven\'t bought any assets yet. Head over to markets to start trading.</p><button class="btn-primary" style="margin-top: 16px;" id="goto-markets">View Markets</button></div></td></tr>';
    const btn = container.querySelector('#goto-markets');
    if (btn) {
      btn.addEventListener('click', () => navigateTo('markets'));
    }
  } else {
    let html = '';
    
    // For Allocation
    const colors = ['#2962FF', '#00C853', '#FFD600', '#FF3D00', '#AA00FF', '#00BFA5'];
    let allocHTML = '';
    let legendHTML = '';

    // Cash bar
    const cashPercent = (balance / totalValue) * 100;
    allocHTML += `<div class="alloc-segment tooltip" style="width: ${cashPercent}%; background-color: var(--text-tertiary);" title="Cash: ${cashPercent.toFixed(1)}%"></div>`;
    legendHTML += `<div class="legend-item"><div class="legend-dot" style="background-color: var(--text-tertiary);"></div>Cash (${cashPercent.toFixed(1)}%)</div>`;

    enrichedPortfolio.forEach((p, i) => {
      // Table Row
      html += `
        <tr data-symbol="${p.symbol}">
          <td>
            <div class="asset-cell">
              <div class="asset-icon">${p.symbol.charAt(0)}</div>
              <div>
                <div class="symbol">${p.symbol}</div>
                <div class="name">${p.asset.name}</div>
              </div>
            </div>
          </td>
          <td>${p.shares}</td>
          <td>$${p.avgPrice.toFixed(2)}</td>
          <td>$${p.asset.price.toFixed(2)}</td>
          <td><strong>$${p.currentValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
          <td>
            <div class="${p.isProfit ? 'profit-text' : 'loss-text'}">${p.isProfit ? '+' : '-'} $${Math.abs(p.profit).toFixed(2)} (${p.profitPercent.toFixed(2)}%)</div>
          </td>
          <td>
            <button class="btn-primary manage-btn">Manage</button>
          </td>
        </tr>
      `;
      
      // Allocation calculation
      const portPercent = (p.currentValue / totalValue) * 100;
      const color = colors[i % colors.length];
      allocHTML += `<div class="alloc-segment tooltip" style="width: ${portPercent}%; background-color: ${color};" title="${p.symbol}: ${portPercent.toFixed(1)}%"></div>`;
      legendHTML += `<div class="legend-item"><div class="legend-dot" style="background-color: ${color};"></div>${p.symbol} (${portPercent.toFixed(1)}%)</div>`;
    });
    
    tbody.innerHTML = html;
    container.querySelector('#allocation-bar').innerHTML = allocHTML;
    container.querySelector('#allocation-legend').innerHTML = legendHTML;

    // Events
    container.querySelectorAll('tr[data-symbol]').forEach(row => {
      row.addEventListener('click', () => {
        navigateTo('stock-detail', { symbol: row.dataset.symbol });
      });
    });
  }
}
