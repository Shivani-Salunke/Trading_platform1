import './register.css';
import { store } from '../store.js';

export function renderRegister(container, navigateTo) {
  container.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="brand-logo" style="margin: 0 auto 16px;">
             <span class="material-icons" style="font-size: 32px; color: var(--accent-brand);">trending_up</span>
          </div>
          <h1>Create an Account</h1>
          <p class="text-secondary">Join ApexTrade to start trading</p>
        </div>
        
        <form id="register-form" class="auth-form">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input type="text" id="name" required placeholder="John Doe" class="auth-input">
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" required placeholder="name@example.com" class="auth-input">
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" required placeholder="••••••••" minlength="6" class="auth-input">
          </div>
          <button type="submit" class="btn-primary auth-submit">Sign Up</button>
        </form>
        
        <div class="auth-footer">
          <p>Already have an account? <a href="#" id="go-to-login" class="text-accent">Log in</a></p>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#go-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('login');
  });

  container.querySelector('#register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (store.register(name, email, password)) {
      navigateTo('login');
    }
  });
}
