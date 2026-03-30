import './dashboard.css';
import { store, getAsset } from '../store.js';
import Chart from 'chart.js/auto';

export function renderDashboard(container, navigateTo) {
  const { balance, portfolio, watchlist, orders } = store.state;

  let invested = 0;
  let currentPortfolioValue = 0;
  portfolio.forEach(p => {
    invested += p.shares * p.avgPrice;
    const asset = getAsset(p.symbol);
    currentPortfolioValue += p.shares * asset.price;
  });

  const totalBalance = balance + currentPortfolioValue;
  const totalProfit = currentPortfolioValue - invested;
  const profitPercentage = invested > 0 ? (totalProfit / invested) * 100 : 0;
  const isProfit = totalProfit >= 0;

  const profitString = `${isProfit ? '+' : '-'} $${Math.abs(totalProfit).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${profitPercentage.toFixed(2)}%) Total`;

  container.innerHTML = `
    <div class="dashboard-header">
      <div>
        <h1 class="view-title">Portfolio Overview</h1>
        <p class="view-subtitle" id="current-date">Fetching data...</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary"><span class="material-icons">download</span> Export</button>
        <button class="btn-primary" id="deposit-btn">Deposit Funds</button>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- Main Portfolio Value -->
      <div class="card col-span-2">
        <div class="portfolio-main">
          <div class="portfolio-value">
            <span class="label">Total Balance (Cash + Equity)</span>
            <h2 class="amount">$${totalBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
            <div class="${isProfit ? 'profit-bg' : 'loss-bg'}">${profitString}</div>
          </div>
          <div class="chart-controls">
            <button class="interval-btn">1D</button>
            <button class="interval-btn active">1W</button>
            <button class="interval-btn">1M</button>
            <button class="interval-btn">1Y</button>
            <button class="interval-btn">ALL</button>
          </div>
        </div>
        <!-- Mock Chart Area -->
        <div class="mock-chart-container skeleton" style="height: 250px; margin-top: 24px;"></div>
      </div>

      <!-- Quick Stats -->
      <div class="card stat-card">
        <div class="stat-icon"><span class="material-icons">account_balance</span></div>
        <div class="stat-content">
          <div class="stat-title">Available Cash</div>
          <div class="stat-value">$${balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        </div>
      </div>
      
      <div class="card stat-card">
        <div class="stat-icon"><span class="material-icons">pie_chart</span></div>
        <div class="stat-content">
          <div class="stat-title">Invested (Cost Basis)</div>
          <div class="stat-value">$${invested.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        </div>
      </div>

      <!-- Watchlist -->
      <div class="card col-span-1 row-span-2 watchlist-section">
        <div class="card-header">
          <h3>Your Watchlist</h3>
          <button class="icon-btn" id="db-add-watchlist"><span class="material-icons">add</span></button>
        </div>
        <div class="watchlist-items">
          <!-- Populated by JS -->
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="card col-span-3 recent-orders-section">
        <div class="card-header">
          <h3>Recent Activity</h3>
          <a href="#" class="view-all" id="view-all-orders">View All</a>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Type</th>
                <th>Price</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <!-- Populated by JS -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Set current date
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', dateOptions);

  // Populate Watchlist
  const watchlistContainer = container.querySelector('.watchlist-items');
  let watchlistHTML = '';
  
  if (watchlist.length === 0) {
    watchlistHTML = '<div style="padding: 16px; color: var(--text-secondary);">No items in watchlist.</div>';
  } else {
    watchlist.forEach(symbol => {
      const item = getAsset(symbol);
      watchlistHTML += `
        <div class="watchlist-item" data-symbol="${item.symbol}">
          <div class="item-info">
            <div class="symbol">${item.symbol}</div>
            <div class="name">${item.name}</div>
          </div>
          <div class="item-price ${item.up ? 'profit' : 'loss'}">
            <div>$${item.price.toFixed(2)}</div>
            <div class="change">${item.change}</div>
          </div>
        </div>
      `;
    });
  }
  watchlistContainer.innerHTML = watchlistHTML;

  // Watchlist click logic
  container.querySelectorAll('.watchlist-item').forEach(item => {
    item.addEventListener('click', () => {
      const symbol = item.dataset.symbol;
      navigateTo('stock-detail', { symbol });
    });
  });
  
  container.querySelector('#db-add-watchlist').addEventListener('click', () => {
    navigateTo('markets');
  });

  // Populate Recent Orders
  const topOrders = orders.slice(0, 5);
  const tbody = container.querySelector('tbody');
  let ordersHTML = '';
  
  if (topOrders.length === 0) {
    ordersHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">No recent activity</td></tr>';
  } else {
    topOrders.forEach(order => {
      const statusClass = order.status === 'Completed' ? 'status-completed' : 'status-pending';
      ordersHTML += `
        <tr>
          <td><strong>${order.symbol}</strong></td>
          <td class="${order.type === 'Buy' ? 'profit-text' : 'loss-text'}">${order.type}</td>
          <td>$${order.price.toFixed(2)}</td>
          <td>${order.shares} Shares</td>
          <td><span class="badge ${statusClass}">${order.status}</span></td>
        </tr>
      `;
    });
  }
  tbody.innerHTML = ordersHTML;
  
  container.querySelector('#view-all-orders').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('orders');
  });

  // Simulate chart load
  setTimeout(() => {
    const ctxCanvas = document.getElementById('dashboard-chart');
    if(ctxCanvas) {
      // Remove placeholder skeleton styles
      const container = ctxCanvas.parentElement;
      container.classList.remove('skeleton');
      
      new Chart(ctxCanvas, {
        type: 'line',
        data: {
          labels: Array.from({length: store.state.portfolioHistory.length}, (_, i) => i),
          datasets: [{
            label: 'Portfolio Value',
            data: store.state.portfolioHistory,
            borderColor: '#2962FF',
            backgroundColor: 'rgba(41, 98, 255, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 0 },
          interaction: {
            intersect: false,
            mode: 'index',
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                  }
                  return label;
                }
              }
            }
          },
          scales: {
            x: { display: false },
            y: {
              display: true,
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: {
                color: 'rgba(255,255,255,0.5)',
                callback: function(value) {
                  return '$' + (value / 1000).toFixed(0) + 'k';
                }
              }
            }
          }
        }
      });
    }
  }, 100);
}
