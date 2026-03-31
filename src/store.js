import { toast } from './toast.js';

export const MARKET_DATA = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.25, change: '-4.2%', up: false, volume: '80.1M', cap: '$2.6T' },
  { symbol: 'NVDA', name: 'NVIDIA Corp', price: 850.30, change: '+5.1%', up: true, volume: '45.2M', cap: '$2.1T' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 198.50, change: '-3.1%', up: false, volume: '95.4M', cap: '$630B' },
  { symbol: 'MSFT', name: 'Microsoft', price: 405.12, change: '+0.8%', up: true, volume: '22.1M', cap: '$3.0T' },
  { symbol: 'AMZN', name: 'Amazon.com', price: 175.00, change: '-0.3%', up: false, volume: '30.5M', cap: '$1.8T' },
  { symbol: 'META', name: 'Meta Platforms', price: 485.12, change: '+3.2%', up: true, volume: '18.5M', cap: '$1.2T' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 152.45, change: '+1.2%', up: true, volume: '25.3M', cap: '$1.9T' },
  { symbol: 'ADBE', name: 'Adobe Inc.', price: 585.10, change: '-0.5%', up: false, volume: '4.8M', cap: '$265B' },
  { symbol: 'CRM', name: 'Salesforce', price: 298.30, change: '+2.1%', up: true, volume: '8.2M', cap: '$290B' },
  { symbol: 'BTC', name: 'Bitcoin', price: 68420.50, change: '+4.5%', up: true, volume: '35.1B', cap: '$1.3T' },
  { symbol: 'ETH', name: 'Ethereum', price: 3450.20, change: '+2.8%', up: true, volume: '15.4B', cap: '$415B' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', price: 178.40, change: '+2.8%', up: true, volume: '55.1M', cap: '$285B' },
  { symbol: 'NFLX', name: 'Netflix Inc', price: 605.20, change: '+1.5%', up: true, volume: '6.2M', cap: '$260B' },
  { symbol: 'LVMH', name: 'LVMH', price: 820.50, change: '+1.1%', up: true, volume: '1.2M', cap: '$410B' }
];

// Initialize mock historical data for charts
MARKET_DATA.forEach(asset => {
  asset.history = [];
  let currentPrice = asset.price;
  for (let i = 0; i < 60; i++) {
    const diff = currentPrice * (Math.random() * 0.04 - 0.02); // 2% variation
    currentPrice -= diff;
    asset.history.unshift(currentPrice);
  }
});

export function getAsset(symbol) {
  return MARKET_DATA.find(a => a.symbol === symbol) || MARKET_DATA[0];
}

const DEFAULT_STATE = {
  balance: 25000,
  portfolio: [], // { symbol, shares, avgPrice }
  watchlist: ['AAPL', 'NVDA', 'TSLA'],
  orders: [], // { id, type, symbol, shares, price, status, date }
  portfolioHistory: [] // To keep track of overall port value
};

class Store {
  constructor() {
    this.users = this.loadUsers();
    this.currentUser = this.loadCurrentUser();
    
    if (this.currentUser) {
      this.state = this.currentUser.state;
    } else {
      this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }

    this.listeners = [];
    this.simulationInterval = null;
    
    this.ensurePortfolioHistory();
  }

  ensurePortfolioHistory() {
    if (!this.state.portfolioHistory || this.state.portfolioHistory.length === 0) {
      this.state.portfolioHistory = Array(60).fill(this.calculateTotalPortfolioValue());
    }
  }

  loadUsers() {
    const saved = localStorage.getItem('apex_users');
    return saved ? JSON.parse(saved) : [];
  }

  loadCurrentUser() {
    const savedId = localStorage.getItem('apex_current_user_id');
    if (savedId) {
      return this.users.find(u => u.id === savedId) || null;
    }
    return null;
  }

  saveGlobal() {
    localStorage.setItem('apex_users', JSON.stringify(this.users));
    if (this.currentUser) {
      localStorage.setItem('apex_current_user_id', this.currentUser.id);
    } else {
      localStorage.removeItem('apex_current_user_id');
    }
  }

  saveState() {
    if (this.currentUser) {
      this.currentUser.state = this.state;
      this.saveGlobal();
    }
    this.notify();
  }

  register(name, email, password) {
    if (this.users.find(u => u.email === email)) {
      toast.show("Email is already registered", "error");
      return false;
    }
    
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // In a real app never store plaintext passwords
      state: JSON.parse(JSON.stringify(DEFAULT_STATE))
    };
    
    newUser.state.portfolioHistory = Array(60).fill(newUser.state.balance);

    this.users.push(newUser);
    this.saveGlobal();
    toast.show("Account created successfully. Please log in.", "success");
    return true;
  }

  login(email, password) {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) {
      toast.show("Invalid email or password", "error");
      return false;
    }

    this.currentUser = user;
    this.state = this.currentUser.state;
    this.ensurePortfolioHistory();
    this.saveGlobal();
    this.notify();
    toast.show(`Welcome back, ${user.name}!`, "success");
    return true;
  }

  logout() {
    this.currentUser = null;
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.saveGlobal();
    this.notify();
  }

  calculateTotalPortfolioValue() {
    let value = this.state.balance;
    this.state.portfolio.forEach(p => {
      value += p.shares * getAsset(p.symbol).price;
    });
    return value;
  }

  startMarketSimulation() {
    if (this.simulationInterval) return;
    
    this.simulationInterval = setInterval(() => {
      // Fluctuate prices
      MARKET_DATA.forEach(asset => {
        const volatility = 0.005; // 0.5% max swing per tick
        const diff = asset.price * (Math.random() * volatility * 2 - volatility);
        asset.price += diff;
        
        // Update change strings just for visuals
        const isUp = diff >= 0;
        const changePct = ((Math.abs(diff) / asset.price) * 100).toFixed(2);
        asset.up = isUp;
        asset.change = `${isUp ? '+' : '-'}${changePct}%`;
        
        // Push to history
        asset.history.push(asset.price);
        if (asset.history.length > 60) asset.history.shift();
      });

      // Track portfolio history if logged in
      if (this.currentUser) {
         this.state.portfolioHistory.push(this.calculateTotalPortfolioValue());
         if (this.state.portfolioHistory.length > 60) this.state.portfolioHistory.shift();
      }

      this.notify(); // Re-render views
    }, 3000); // Update every 3 seconds
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(l => l(this.state));
  }

  reset() {
    if (!this.currentUser) return;
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.state.portfolioHistory = Array(60).fill(this.state.balance);
    this.saveState();
  }

  buy(symbol, shares, price) {
    if (!this.currentUser) return false;
    const cost = shares * price;
    if (this.state.balance < cost) {
      toast.show(`Insufficient funds to buy ${shares} shares of ${symbol}.`, 'error');
      return false;
    }

    this.state.balance -= cost;

    // Update Portfolio
    const existingIdx = this.state.portfolio.findIndex(p => p.symbol === symbol);
    if (existingIdx >= 0) {
      const p = this.state.portfolio[existingIdx];
      const totalCost = (p.shares * p.avgPrice) + cost;
      const newShares = p.shares + shares;
      p.shares = newShares;
      p.avgPrice = totalCost / newShares;
    } else {
      this.state.portfolio.push({ symbol, shares, avgPrice: price });
    }

    // Add Order
    this.state.orders.unshift({
      id: Date.now().toString(),
      type: 'Buy',
      symbol,
      shares,
      price,
      status: 'Completed',
      date: new Date().toISOString()
    });

    this.saveState();
    toast.show(`Successfully bought ${shares} shares of ${symbol}`, 'success');
    return true;
  }

  sell(symbol, shares, price) {
    if (!this.currentUser) return false;
    const existingIdx = this.state.portfolio.findIndex(p => p.symbol === symbol);
    if (existingIdx === -1 || this.state.portfolio[existingIdx].shares < shares) {
      toast.show(`You don't own enough shares of ${symbol} to sell.`, 'error');
      return false;
    }

    const revenue = shares * price;
    this.state.balance += revenue;

    // Update Portfolio
    const p = this.state.portfolio[existingIdx];
    p.shares -= shares;
    if (p.shares === 0) {
      this.state.portfolio.splice(existingIdx, 1);
    }

    // Add Order
    this.state.orders.unshift({
      id: Date.now().toString(),
      type: 'Sell',
      symbol,
      shares,
      price,
      status: 'Completed',
      date: new Date().toISOString()
    });

    this.saveState();
    toast.show(`Successfully sold ${shares} shares of ${symbol}`, 'success');
    return true;
  }

  toggleWatchlist(symbol) {
    if (!this.currentUser) return;
    const idx = this.state.watchlist.indexOf(symbol);
    if (idx >= 0) {
      this.state.watchlist.splice(idx, 1);
      toast.show(`Removed ${symbol} from watchlist`, 'info');
    } else {
      this.state.watchlist.push(symbol);
      toast.show(`Added ${symbol} to watchlist`, 'success');
    }
    this.saveState();
  }

  isInWatchlist(symbol) {
    return this.state.watchlist.includes(symbol);
  }
}

export const store = new Store();

