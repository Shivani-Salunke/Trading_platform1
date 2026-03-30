import './toast.css';

class ToastManager {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  }

  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'info';
    if (type === 'success') icon = 'check_circle';
    if (type === 'error') icon = 'error';
    if (type === 'warning') icon = 'warning';

    toast.innerHTML = `
      <span class="material-icons">${icon}</span>
      <span class="toast-message">${message}</span>
    `;

    this.container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('toast-visible');
    });

    setTimeout(() => {
      toast.classList.remove('toast-visible');
      setTimeout(() => {
        if (this.container.contains(toast)) {
          this.container.removeChild(toast);
        }
      }, 300); // Wait for transition
    }, duration);
  }
}

export const toast = new ToastManager();
