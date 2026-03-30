import './stock-detail.css';
import { store, getAsset } from '../store.js';
import Chart from 'chart.js/auto';

export function renderStockDetail(container, navigateTo, params) {
  const symbol = params.symbol || 'AAPL';
  const ctx = getAsset(symbol);
  
  const trendClass = ctx.up ? 'profit' : 'loss';
  const trendBg = ctx.up ? 'profit-bg' : 'loss-bg';
  
  let isWatchlisted = store.isInWatchlist(symbol);
  
  // Get current owned shares
  const portfolioItem = store.state.portfolio.find(p => p.symbol === symbol);
  const ownedShares = portfolioItem ? portfolioItem.shares : 0;

  function render() {
    container.innerHTML = `
      <div class="breadcrumb-nav">
        <a href="#" class="back-link" id="back-to-markets">
          <span class="material-icons">arrow_back</span> Back to Markets
        </a>
      </div>
      
      <div class="stock-header card">
        <div class="stock-info">
          <div class="stock-logo">${symbol.charAt(0)}</div>
          <div class="stock-titles">
            <div class="ticker-badge">${symbol}</div>
            <h1 class="stock-name">${ctx.name}</h1>
          </div>
        </div>
        
        <div class="stock-price-info">
          <div class="current-price">$${ctx.price.toFixed(2)}</div>
          <div class="${trendBg} change-badge">${ctx.change} Today</div>
        </div>
        
        <div class="stock-actions">
          <button class="icon-btn btn-glass tooltip" id="toggle-watchlist">
            <span class="material-icons" style="color: ${isWatchlisted ? '#FFD700' : 'inherit'}">${isWatchlisted ? 'star' : 'star_border'}</span>
          </button>
          <button class="icon-btn btn-glass tooltip"><span class="material-icons">share</span></button>
        </div>
      </div>

      <div class="stock-content">
        <!-- Left Column: Chart & Details -->
        <div class="chart-column">
          <!-- Tabs -->
          <div class="stock-tabs">
            <button class="tab active">Overview</button>
            <button class="tab">Financials</button>
            <button class="tab">News</button>
            <button class="tab">Analysis</button>
          </div>
          
          <div class="card chart-card">
            <div class="chart-toolbar">
              <div class="chart-types">
                <button class="icon-btn active"><span class="material-icons">candlestick_chart</span></button>
                <button class="icon-btn"><span class="material-icons">show_chart</span></button>
              </div>
              <div class="chart-controls">
                <button class="interval-btn">1D</button>
                <button class="interval-btn">1W</button>
                <button class="interval-btn active">1M</button>
                <button class="interval-btn">3M</button>
                <button class="interval-btn">1Y</button>
              </div>
            </div>
            <div class="premium-chart-container skeleton" style="height: 400px; margin-top: 16px;">
              <canvas id="stock-chart" style="width: 100%; height: 100%;"></canvas>
            </div>
          </div>

          <div class="card stats-grid">
            <div class="stat-item">
              <div class="label">Open</div>
              <div class="value">$${(ctx.price * 0.99).toFixed(2)}</div>
            </div>
            <div class="stat-item">
              <div class="label">High</div>
              <div class="value">$${(ctx.price * 1.02).toFixed(2)}</div>
            </div>
            <div class="stat-item">
              <div class="label">Low</div>
              <div class="value">$${(ctx.price * 0.98).toFixed(2)}</div>
            </div>
            <div class="stat-item">
              <div class="label">Vol</div>
              <div class="value">${ctx.volume}</div>
            </div>
            <div class="stat-item">
              <div class="label">Mkt Cap</div>
              <div class="value">${ctx.cap}</div>
            </div>
            <div class="stat-item">
              <div class="label">Owned</div>
              <div class="value">${ownedShares} Shares</div>
            </div>
          </div>
        </div>

        <!-- Right Column: Order Panel -->
        <div class="order-column">
          <div class="card order-panel">
            <div class="order-tabs">
              <button class="order-tab active" data-type="buy">Buy</button>
              <button class="order-tab" data-type="sell">Sell</button>
            </div>
            
            <div class="order-types">
              <button class="type-btn active">Market</button>
              <button class="type-btn">Limit</button>
              <button class="type-btn">Stop</button>
            </div>
            
            <div class="order-form">
              <div class="input-group">
                <label>Amount (Shares)</label>
                <div class="input-wrapper">
                  <input type="number" value="1" min="1" step="1" id="order-shares" />
                  <span class="suffix">Shares</span>
                </div>
              </div>
              
              <div class="input-group">
                <label>Market Price</label>
                <div class="input-wrapper disabled">
                  <input type="text" value="$${ctx.price.toFixed(2)}" disabled />
                  <span class="suffix">USD</span>
                </div>
              </div>
              
              <div class="order-summary">
                <div class="summary-line">
                  <span>Estimated Total</span>
                  <span class="total-value" id="est-total">$${ctx.price.toFixed(2)}</span>
                </div>
                <div class="summary-line">
                  <span>Available Cash</span>
                  <span>$${store.state.balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              </div>
              
              <button class="btn-primary execute-btn execution-buy">Place Buy Order</button>
            </div>
          </div>
          
          <!-- About Company -->
          <div class="card about-card">
            <h3>About ${ctx.name}</h3>
            <p class="about-text">${ctx.name} is a leading global company. This data is part of the local simulated application for the ApexTrade demo. Prices are fixed to ensure stable calculations, and purchases utilize mocked funds.</p>
            <button class="btn-secondary read-more-btn">Read More</button>
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  let orderType = 'buy';

  function bindEvents() {
    container.querySelector('#back-to-markets').addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('markets');
    });

    // Chart Load
    setTimeout(() => {
      const ctxCanvas = container.querySelector('#stock-chart');
      if(ctxCanvas) {
        ctxCanvas.parentElement.classList.remove('skeleton');
        
        new Chart(ctxCanvas, {
          type: 'line',
          data: {
            labels: Array.from({length: ctx.history.length}, (_, i) => i),
            datasets: [{
              label: ctx.symbol,
              data: ctx.history,
              borderColor: ctx.up ? '#00C853' : '#E33535',
              backgroundColor: ctx.up ? 'rgba(0, 200, 83, 0.1)' : 'rgba(227, 53, 53, 0.1)',
              borderWidth: 2,
              tension: 0.1,
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
                    if (context.parsed.y !== null) {
                      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                    }
                    return '';
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
                    return '$' + value.toFixed(2);
                  }
                }
              }
            }
          }
        });
      }
    }, 100);

    // Watchlist
    container.querySelector('#toggle-watchlist').addEventListener('click', () => {
      store.toggleWatchlist(symbol);
      isWatchlisted = store.isInWatchlist(symbol);
      render(); // Re-render to update UI
    });

    // Order Panel Logic
    const orderTabs = container.querySelectorAll('.order-tab');
    const executeBtn = container.querySelector('.execute-btn');
    const sharesInput = container.querySelector('#order-shares');
    const estTotal = container.querySelector('#est-total');

    function updateEstTotal() {
      const shares = parseInt(sharesInput.value) || 0;
      estTotal.textContent = '$' + (shares * ctx.price).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }

    sharesInput.addEventListener('input', updateEstTotal);

    orderTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        orderTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        orderType = tab.dataset.type;
        if(orderType === 'buy') {
          executeBtn.classList.remove('execution-sell');
          executeBtn.classList.add('execution-buy');
          executeBtn.textContent = 'Place Buy Order';
        } else {
          executeBtn.classList.remove('execution-buy');
          executeBtn.classList.add('execution-sell');
          executeBtn.textContent = 'Place Sell Order';
        }
      });
    });

    executeBtn.addEventListener('click', () => {
      const shares = parseInt(sharesInput.value) || 0;
      if (shares <= 0) return;

      if (orderType === 'buy') {
        if (store.buy(symbol, shares, ctx.price)) {
          render(); // Re-render to update balance and owned shares
        }
      } else {
        if (store.sell(symbol, shares, ctx.price)) {
          render();
        }
      }
    });

    // Initialize tabs matching current state
    if (orderType === 'sell') {
      const sellTab = Array.from(orderTabs).find(t => t.dataset.type === 'sell');
      if(sellTab) sellTab.click();
    }
  }

  // Initial
  render();
}
