import './orders.css';
import { store } from '../store.js';

export function renderOrders(container, navigateTo) {
  const { orders } = store.state;

  container.innerHTML = `
    <div class="dashboard-header">
      <div>
        <h1 class="view-title">Order History</h1>
        <p class="view-subtitle">Review all your past transactions</p>
      </div>
    </div>

    <div class="card orders-main-card">
      <div class="table-container">
        <table class="data-table interactive-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Asset</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="orders-tbody">
          </tbody>
        </table>
      </div>
    </div>
  `;

  const tbody = container.querySelector('#orders-tbody');

  function renderTable() {
    if (orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><span class="material-icons">receipt_long</span><h2>No Orders Yet</h2><p>Your trading history will appear here once you make your first trade.</p></div></td></tr>';
      return;
    }

    let html = '';
    orders.forEach(order => {
      const dateStr = new Date(order.date).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
      const totalNum = order.shares * order.price;
      const statusClass = order.status === 'Completed' ? 'status-completed' : 'status-pending';

      html += `
        <tr data-symbol="${order.symbol}">
          <td style="color: var(--text-secondary);">${dateStr}</td>
          <td>
            <strong>${order.symbol}</strong>
          </td>
          <td class="${order.type === 'Buy' ? 'profit-text' : 'loss-text'}">${order.type}</td>
          <td>${order.shares}</td>
          <td>$${order.price.toFixed(2)}</td>
          <td>$${totalNum.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
          <td><span class="badge ${statusClass}">${order.status}</span></td>
        </tr>
      `;
    });
    tbody.innerHTML = html;

    // Connect to stock detail on click
    container.querySelectorAll('tr[data-symbol]').forEach(row => {
      row.addEventListener('click', () => {
        navigateTo('stock-detail', { symbol: row.dataset.symbol });
      });
    });
  }

  renderTable();
}
