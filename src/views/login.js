import './login.css';
import { store } from '../store.js';

export function renderLogin(container, navigateTo) {
  container.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="brand-logo" style="margin: 0 auto 16px;">
             <span class="material-icons" style="font-size: 32px; color: var(--accent-brand);">trending_up</span>
          </div>
          <h1>Welcome Back</h1>
          <p class="text-secondary">Sign in to your ApexTrade account</p>
        </div>
        
        <form id="login-form" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" required placeholder="name@example.com" class="auth-input">
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" required placeholder="••••••••" class="auth-input">
          </div>
          <button type="submit" class="btn-primary auth-submit">Sign In</button>
        </form>
        
        <div class="auth-footer">
          <p>Don't have an account? <a href="#" id="go-to-register" class="text-accent">Sign up</a></p>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#go-to-register').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('register');
  });

  container.querySelector('#login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (store.login(email, password)) {
      navigateTo('dashboard');
    }
  });
}
