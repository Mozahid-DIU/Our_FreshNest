function showAlert(id, msg, type='info') {
  const el = document.getElementById(id);
  if(el) el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
  setTimeout(()=>{ if(el) el.innerHTML=''; }, 4000);
}

let sidebarOpen = false;
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  sidebarOpen = !sidebarOpen;
  sidebar.classList.toggle('open', sidebarOpen);
}

function openModal(html) {
  document.getElementById('modal-container').innerHTML = `<div class="modal-overlay" onclick="if(event.target===this)closeModal()">${html}</div>`;
}
function closeModal() { document.getElementById('modal-container').innerHTML=''; }

function badge(status) {
  const map = { 'Open':'badge-blue','Available':'badge-green','Accepted':'badge-sage','Completed':'badge-green','Cancelled':'badge-gray','Pending':'badge-gold','Declined':'badge-red','Failed':'badge-red' };
  return `<span class="badge ${map[status]||'badge-gray'}">${status}</span>`;
}

function produceEmoji(name) { return PRODUCE_DB[name]?.emoji || '🌿'; }

function produceCard(name, info) {
  return `<div class="produce-card">
    <div class="produce-card-header" style="background:${info.cat==='Fruit'?'linear-gradient(135deg,#FEF9E7,#FDEBD0)':'linear-gradient(135deg,#E9F7EF,#D5F5E3)'}">
      <span class="produce-emoji">${info.emoji}</span>
      <div class="produce-name">${name}</div>
      <div class="produce-meta">${info.cat} · ${info.harvestMonths}</div>
    </div>
    <div class="produce-card-body">
      <div class="produce-info-row"><span class="produce-info-label">Temperature</span><span class="produce-info-val">${info.temp}</span></div>
      <div class="produce-info-row"><span class="produce-info-label">Humidity</span><span class="produce-info-val">${info.humidity}</span></div>
      <div class="produce-info-row"><span class="produce-info-label">Fresh Duration</span><span class="produce-info-val">${info.freshDays} days</span></div>
      <div class="storage-tip" style="margin-top:8px;margin-bottom:0">${info.tips}</div>
    </div>
  </div>`;
}

function renderNav(cfg) {
  document.getElementById('sidebar-nav').innerHTML = cfg.navItems.map(item=>`
    <div class="nav-item" id="nav-${item.id}" onclick="navigate('${item.id}')">
      <span class="nav-icon">${item.icon}</span>${item.label}
    </div>
  `).join('');
}

function renderSidebar() {
  const u = state.user;
  const cfg = ROLE_CFG[u.role];
  
  const avatar = u.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  document.getElementById('sidebar-user-info').innerHTML = `
    <div class="sidebar-user-avatar" style="background:${cfg.bg}">${avatar}</div>
    <div class="sidebar-user-name">${u.name}</div>
    <div class="sidebar-user-role" style="background:${cfg.color}22;color:${cfg.color};border:1px solid ${cfg.color}44">${cfg.icon} ${u.role.charAt(0).toUpperCase()+u.role.slice(1)}</div>
  `;
  renderNav(cfg);
}