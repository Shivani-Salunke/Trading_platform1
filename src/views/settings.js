import './settings.css';
import { store } from '../store.js';
import { toast } from '../toast.js';

export function renderSettings(container, navigateTo) {
  container.innerHTML = `
    <div class="dashboard-header">
      <div>
        <h1 class="view-title">Settings & Profile</h1>
        <p class="view-subtitle">Manage your account preferences</p>
      </div>
    </div>

    <div class="settings-grid">
      <div class="card profile-card">
        <div class="profile-header">
          <img src="https://ui-avatars.com/api/?name=Us&background=00C853&color=fff&size=128" alt="User Avatar" class="profile-avatar">
          <div class="profile-info">
            <h2>${store.currentUser ? store.currentUser.name : 'Unknown User'}</h2>
            <p class="text-secondary">${store.currentUser ? store.currentUser.email : 'Unknown Email'}</p>
            <div class="badge status-completed" style="margin-top: 8px; display: inline-block;">Pro Member</div>
          </div>
        </div>
        
        <div class="profile-stats">
          <div class="stat-box">
            <div class="label">Member Since</div>
            <div class="value">Jan 2026</div>
          </div>
          <div class="stat-box">
            <div class="label">Total Trades</div>
            <div class="value" id="total-trades-count">${store.state.orders.length}</div>
          </div>
        </div>
      </div>

      <div class="settings-options">
        <div class="card section-card">
          <h3>Preferences</h3>
          
          <div class="setting-item">
            <div class="setting-info">
              <h4>Dark Mode</h4>
              <p>Toggle the application dark theme</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" checked disabled>
              <span class="slider round"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h4>Notifications</h4>
              <p>Receive alerts for filled orders and price movements</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" checked>
              <span class="slider round"></span>
            </label>
          </div>
          
          <div class="setting-item" style="border-top: 1px solid var(--border-color); padding-top: var(--spacing-md); margin-top: var(--spacing-md);">
            <div class="setting-info">
              <h4>Account Access</h4>
              <p>Sign out of your current session</p>
            </div>
            <button class="btn-primary" id="logout-btn" style="background-color: transparent; color: var(--text-primary); border: 1px solid var(--border-color); box-shadow: none;">Log Out</button>
          </div>
        </div>

        <div class="card section-card danger-zone">
          <h3 style="color: var(--color-loss);">Danger Zone</h3>
          <p style="color: var(--text-secondary); margin-bottom: 16px; font-size: 14px;">
            Resetting your account will delete your portfolio, watchlist, and order history, restoring your balance to the initial $25,000.
          </p>
          <button class="btn-primary" id="reset-account-btn" style="background-color: var(--color-loss); box-shadow: 0 4px 12px rgba(227, 53, 53, 0.2);">Reset Account Data</button>
        </div>
      </div>
    </div>
  `;

  const resetBtn = container.querySelector('#reset-account-btn');
  resetBtn.addEventListener('click', () => {
    const confirmReset = window.confirm("Are you sure you want to reset all account data? This cannot be undone.");
    if (confirmReset) {
      store.reset();
      toast.show("Account reset successfully", "success");
      navigateTo('dashboard');
    }
  });

  const logoutBtn = container.querySelector('#logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      store.logout();
      toast.show("You have been logged out.", "info");
      navigateTo('login');
    });
  }
}
