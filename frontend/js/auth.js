const ROLE_CFG = {
  farmer:    { color:'#27AE60', bg:'#1E8449', icon:'🌾', navItems: [
    { id:'dashboard', label:'Dashboard',          icon:'📊' },
    { id:'products',  label:'My Produce',         icon:'🌿' },
    { id:'transport', label:'Transport Requests',  icon:'🚛' },
    { id:'deals',     label:'My Deals',            icon:'🤝' },
    { id:'storage',   label:'Storage Guide',       icon:'📦' },
  ]},

  transport: { color:'#E67E22', bg:'#CA6F1E', icon:'🚛', navItems: [
    { id:'dashboard', label:'Dashboard',           icon:'📊' },
    { id:'offers',    label:'Browse Requests',     icon:'📋' },
    { id:'myjobs',    label:'My Jobs',             icon:'🗓️' },
    { id:'failures',  label:'Report Failure',      icon:'⚠️' },
  ]},

  dealer:    { color:'#2471A3', bg:'#1A5276', icon:'🏪', navItems: [
    { id:'dashboard', label:'Dashboard',           icon:'📊' },
    { id:'browse',    label:'Browse Produce',      icon:'🛒' },
    { id:'mydeals',   label:'My Deals',            icon:'🤝' },
  ]},

  admin:     { color:'#8E44AD', bg:'#6C3483', icon:'⚙️', navItems: [
    { id:'dashboard', label:'Overview',            icon:'📊' },
    { id:'users',     label:'All Users',           icon:'👥' },
    { id:'products',  label:'All Produce',         icon:'🌿' },
    { id:'transport', label:'Transport',           icon:'🚛' },
    { id:'deals',     label:'Deals',               icon:'🤝' },
    { id:'failures',  label:'Failures',            icon:'⚠️' },
  ]},
};

function initApp() {
  document.getElementById('auth-page').style.display='none';
  document.getElementById('app').style.display='flex';
  const u = state.user;
  const cfg = ROLE_CFG[u.role];
  
  const avatar = u.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  document.getElementById('sidebar-user-info').innerHTML = `
    <div class="sidebar-user-avatar" style="background:${cfg.bg}">${avatar}</div>
    <div class="sidebar-user-name">${u.name}</div>
    <div class="sidebar-user-role" style="background:${cfg.color}22;color:${cfg.color};border:1px solid ${cfg.color}44">${cfg.icon} ${u.role.charAt(0).toUpperCase()+u.role.slice(1)}</div>
  `;

  document.getElementById('sidebar-nav').innerHTML = cfg.navItems.map(item=>`
    <div class="nav-item" id="nav-${item.id}" onclick="navigate('${item.id}')">
      <span class="nav-icon">${item.icon}</span>${item.label}
    </div>
  `).join('');

  document.getElementById('topbar-date').textContent = new Date().toLocaleDateString('en-BD',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  navigate(cfg.navItems[0].id);
}

function navigate(id) {
  state.activeNav = id;
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.remove('active'));
  const el = document.getElementById('nav-'+id);
  if(el) el.classList.add('active');
  const cfg = ROLE_CFG[state.user.role];
  const navItem = cfg.navItems.find(n=>n.id===id);
  document.getElementById('topbar-title').textContent = navItem?.label||'';
  const body = document.getElementById('page-body');
  body.innerHTML = '';

  const renders = {
    farmer: { dashboard:renderFarmerDashboard, products:renderMyProducts, transport:renderTransportReqs, deals:renderFarmerDeals, storage:renderStorageGuide },
    transport: { dashboard:renderTransportDashboard, offers:renderBrowseRequests, myjobs:renderMyJobs, failures:renderFailures },
    dealer: { dashboard:renderDealerDashboard, browse:renderBrowseProduce, mydeals:renderMyDeals },
    admin: { dashboard:renderAdminDashboard, users:renderAdminUsers, products:renderAdminProducts, transport:renderAdminTransport, deals:renderAdminDeals, failures:renderAdminFailures },
  };

  const fn = renders[state.user.role]?.[id];
  if(fn) fn();
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((t,i)=>t.classList.toggle('active',i===(tab==='login'?0:1)));
  document.getElementById('login-form').style.display    = tab==='login'?'block':'none';
  document.getElementById('register-form').style.display = tab==='register'?'block':'none';
  document.getElementById('auth-alert').innerHTML='';
  
  const hint = document.getElementById('auth-toggle-hint');
  if (hint) {
    if (tab === 'login') {
      hint.innerHTML = 'Don\'t have an account? <a href="javascript:void(0)" onclick="switchAuthTab(\'register\')" style="color:var(--green);font-weight:600;text-decoration:underline">Register</a>';
    } else {
      hint.innerHTML = 'Already have an account? <a href="javascript:void(0)" onclick="switchAuthTab(\'login\')" style="color:var(--green);font-weight:600;text-decoration:underline">Sign In</a>';
    }
  }
}

function quickLogin(email, pass) {
  if (!isDemoAllowed('admin')) {
    showAlert('auth-alert','Demo mode is disabled. Please sign in with a real account.','danger');
    return;
  }
  document.getElementById('login-email').value = email;
  document.getElementById('login-pass').value = pass;
  const demoUser = SEED_USERS.find(u => u.email === email && u.password === pass);
  
  if (demoUser && demoUser.role === 'admin') {
    state.user  = normUser(demoUser);
    state.token = 'demo-token';
    localStorage.setItem('hl_token', state.token);
    localStorage.setItem('hl_user', JSON.stringify(state.user));
    loadDemoData();
    initApp();
    return;
  }

 doLogin();
}

function setAuthBtnState(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    btn.dataset.origText = btn.textContent;
    btn.textContent = 'Please wait...';
  } else {
    btn.disabled = false;
    btn.textContent = btn.dataset.origText || btn.textContent;
  }
}

function toggleRoleFields() {
  const r = document.getElementById('reg-role').value;
  document.getElementById('field-location').style.display = r!=='transport'?'block':'none';
  document.getElementById('field-vehicle').style.display  = r==='transport'?'block':'none';
}

async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  if (!email || !pass) return showAlert('auth-alert','Email and password required.','danger');
  
  setAuthBtnState('login-btn', true);
  
  if (DEMO_MODE) {
    const user = SEED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
    if (user && user.role === 'admin') {
      state.user  = normUser(user);
      state.token = 'demo-token';
      localStorage.setItem('hl_token', state.token);
      localStorage.setItem('hl_user', JSON.stringify(state.user));
      loadDemoData();
      initApp();
      setAuthBtnState('login-btn', false);
      return;
    }
  }
  
  try {
    showAlert('auth-alert','Signing in...','info');
    const data = await apiFetch('/auth/login', { method:'POST', body: JSON.stringify({ email, password: pass }) });
    state.token = data.token;
    state.user  = normUser(data.user);
    
    try { localStorage.setItem('hl_token', state.token); localStorage.setItem('hl_user', JSON.stringify(state.user)); } catch(_){}
    await loadAll();
    initApp();
  } 
  catch(e) {
    showAlert('auth-alert', e.message || 'Invalid email or password.', 'danger');
  }
  setAuthBtnState('login-btn', false);
}

async function doRegister() {
  const name=document.getElementById('reg-name').value.trim();
  const email=document.getElementById('reg-email').value.trim();
  const pass=document.getElementById('reg-pass').value;
  const role=document.getElementById('reg-role').value;
  
  if(!name||!email||!pass) return showAlert('auth-alert','All fields are required.','danger');
  
  if(pass.length < 6) return showAlert('auth-alert','Password must be at least 6 characters.','danger');
  
  const location = document.getElementById('reg-location')?.value||'';
  const vehicle  = document.getElementById('reg-vehicle')?.value||'';
  
  setAuthBtnState('reg-btn', true);
  
  try {
    showAlert('auth-alert','Registering...','info');
    const newUserData = await apiFetch('/auth/register', { method:'POST', body: JSON.stringify({ name, email, password: pass, role, location, vehicle }) });
    showAlert('auth-alert','Registration successful! You can now sign in.','success');
    switchAuthTab('login');
    document.getElementById('login-email').value = email;
    setAuthBtnState('reg-btn', false);
  } 
  catch(e) {
    setAuthBtnState('reg-btn', false);
    showAlert('auth-alert', e.message || 'Registration failed. Try different email.', 'danger');
    switchAuthTab('login');
    document.getElementById('login-email').value = email;
  }
}

function doLogout() {
  state.user = null;
  state.token = null;
  state.users = []; state.products = []; state.trans = []; state.deals = []; state.failures = [];
  state.activeNav = null;
  state.retryAction = null;
  try { localStorage.removeItem('hl_token'); localStorage.removeItem('hl_user'); } catch(_){}
  document.getElementById('app').style.display='none';
  document.getElementById('auth-page').style.display='flex';
}