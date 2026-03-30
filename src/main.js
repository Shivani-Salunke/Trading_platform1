import './styles/variables.css';
import './styles/layout.css';
import './styles/components.css';

// Import views
import { renderDashboard } from './views/dashboard.js';
import { renderMarkets } from './views/markets.js';
import { renderStockDetail } from './views/stock-detail.js';
import { renderPortfolio } from './views/portfolio.js';
import { renderWatchlist } from './views/watchlist.js';
import { renderOrders } from './views/orders.js';
import { renderSettings } from './views/settings.js';
import { renderLogin } from './views/login.js';
import { renderRegister } from './views/register.js';
import { store } from './store.js';

document.addEventListener('DOMContentLoaded', () => {
  store.startMarketSimulation();
  
  const navLinks = document.querySelectorAll('.nav-link');
  const viewContainer = document.getElementById('view-container');
  const breadcrumb = document.getElementById('breadcrumb');

  function navigateTo(viewName, params = {}) {
    // Auth Guards
    if (!store.currentUser && viewName !== 'login' && viewName !== 'register') {
      viewName = 'login';
    } else if (store.currentUser && (viewName === 'login' || viewName === 'register')) {
      viewName = 'dashboard';
    }

    if (viewName === 'login' || viewName === 'register') {
      document.body.classList.add('auth-mode');
    } else {
      document.body.classList.remove('auth-mode');
    }

    // Basic router logic for highlighting sidebar
    navLinks.forEach(link => {
      if (link.dataset.view === viewName) {
        link.classList.add('active');
        breadcrumb.textContent = link.querySelector('span:not(.material-icons)').textContent;
      } else {
        if(viewName !== 'stock-detail') link.classList.remove('active');
      }
    });

    if(viewName === 'stock-detail') {
      breadcrumb.textContent = 'Stock Analysis';
    }

    // Smooth transition between views
    viewContainer.style.opacity = 0;
    viewContainer.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
      viewContainer.innerHTML = '';
      
      if (viewName === 'dashboard') {
        renderDashboard(viewContainer, navigateTo);
      } else if (viewName === 'markets') {
        renderMarkets(viewContainer, navigateTo);
      } else if (viewName === 'stock-detail') {
        renderStockDetail(viewContainer, navigateTo, params);
      } else if (viewName === 'portfolio') {
        renderPortfolio(viewContainer, navigateTo);
      } else if (viewName === 'watchlist') {
        renderWatchlist(viewContainer, navigateTo);
      } else if (viewName === 'orders') {
        renderOrders(viewContainer, navigateTo);
      } else if (viewName === 'settings') {
        renderSettings(viewContainer, navigateTo);
      } else if (viewName === 'login') {
        renderLogin(viewContainer, navigateTo);
      } else if (viewName === 'register') {
        renderRegister(viewContainer, navigateTo);
      } else {
        viewContainer.innerHTML = `
          <div class="empty-state">
            <span class="material-icons">construction</span>
            <h2>${viewName.charAt(0).toUpperCase() + viewName.slice(1)} View</h2>
            <p>This module is currently under development.</p>
          </div>
        `;
      }
      
      requestAnimationFrame(() => {
        viewContainer.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        viewContainer.style.opacity = 1;
        viewContainer.style.transform = 'translateY(0)';
      });
    }, 200);
  }

  // Bind click events to nav links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.dataset.view;
      if (view) navigateTo(view);
    });
  });

  // Initial load
  navigateTo('dashboard');
});
