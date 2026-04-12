function renderAdminPanel() {
  renderAdminDashboard();
}

async function renderAdminUsers() {
  try {
    if (state.token && state.token !== 'demo-token') {
      const users = await apiFetch('/users');
      state.users = users.map(normUser);
    }
  } catch (err) {
    console.warn('Could not refresh users list:', err);
  }

  document.getElementById('page-body').innerHTML = `
    <div class="section-header"><h2>All Users (${state.users.length})</h2></div>
    <div class="card"><div class="card-body table-wrap">
    <table class="data-table">
      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Location/Vehicle</th><th>Joined</th></tr></thead>
      <tbody>${state.users.map(u=>`<tr>
        <td><strong>${u.name}</strong></td><td>${u.email}</td>
        <td><span class="badge ${{admin:'badge-gray',farmer:'badge-green',transport:'badge-gold',dealer:'badge-blue'}[u.role]||'badge-gray'}">${{admin:'',farmer:'',transport:'',dealer:''}[u.role]||''} ${u.role}</span></td>
        <td>${u.location||u.vehicle||'—'}</td><td>${u.joined}</td>
      </tr>`).join('')}</tbody>
    </table></div></div>
  `;
}

function renderAdminProducts() {
  document.getElementById('page-body').innerHTML = `
    <div class="section-header"><h2>All Produce (${state.products.length})</h2></div>
    <div class="card"><div class="card-body table-wrap">
    <table class="data-table">
      <thead><tr><th>Produce</th><th>Category</th><th>Farmer</th><th>Qty</th><th>Location</th><th>Storage Temp</th><th>Fresh Days</th><th>Status</th></tr></thead>
      <tbody>${state.products.map(p=>`<tr>
        <td>${p.emoji||'🌿'} <strong>${p.name}</strong></td>
        <td><span class="badge ${p.category==='Fruit'?'badge-gold':'badge-green'}">${p.category}</span></td>
        <td>${p.farmerName}</td><td>${p.quantity} ${p.unit}</td>
        <td>${p.location}</td><td>${p.temp}</td><td>${p.freshDays}d</td>
        <td>${badge(p.status)}</td>
      </tr>`).join('')}</tbody>
    </table></div></div>
  `;
}

function renderAdminTransport() {
  document.getElementById('page-body').innerHTML = `
    <div class="section-header"><h2>All Transport Requests (${state.trans.length})</h2></div>
    <div class="card"><div class="card-body table-wrap">
    <table class="data-table">
      <thead><tr><th>Farmer</th><th>Produce</th><th>Route</th><th>Date</th><th>Qty</th><th>Transporter</th><th>Status</th></tr></thead>
      <tbody>${state.trans.map(t=>`<tr>
        <td>${t.farmerName}</td>
        <td>${produceEmoji(t.product)} ${t.product}</td>
        <td>${t.pickup} → ${t.destination}</td>
        <td>${t.date}</td><td>${t.quantity}</td>
        <td>${t.transporterName||'<span style="color:var(--mist)">Unassigned</span>'}</td>
        <td>${badge(t.status)}</td>
      </tr>`).join('')}</tbody>
    </table></div></div>
  `;
}

function renderAdminDeals() {
  document.getElementById('page-body').innerHTML = `
    <div class="section-header"><h2>All Deals (${state.deals.length})</h2></div>
    <div class="card"><div class="card-body table-wrap">
    <table class="data-table">
      <thead><tr><th>Produce</th><th>Farmer</th><th>Dealer</th><th>Qty</th><th>Price</th><th>Date</th><th>Status</th></tr></thead>
      <tbody>${state.deals.map(d=>`<tr>
        <td>${produceEmoji(d.product)} ${d.product}</td>
        <td>${d.farmerName}</td><td>${d.dealerName}</td>
        <td>${d.quantity}</td><td>Taka${d.price}/kg</td>
        <td>${d.created}</td><td>${badge(d.status)}</td>
      </tr>`).join('')}</tbody>
    </table></div></div>
  `;
}

function renderAdminFailures() {
  document.getElementById('page-body').innerHTML = `
    <div class="section-header"><h2>Delivery Failures (${state.failures.length})</h2></div>
    ${state.failures.length===0?`<div class="card"><div class="empty-state"><div class="empty-icon">✅</div><p>No delivery failures reported.</p></div></div>`:''}
    ${state.failures.map(f=>`
      <div class="failure-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">
          <div>
            <div style="font-weight:700;color:var(--amber);font-size:1.05rem">${produceEmoji(f.product)} ${f.product}</div>
            <div style="font-size:.85rem;color:var(--slate);margin-top:3px">${f.transporterName} - Route: ${f.route}</div>
            <div style="font-size:.85rem;margin-top:5px"><strong>Reason:</strong> ${f.reason} - <strong>Date:</strong> ${f.reported}</div>
            ${f.notes?`<div style="font-size:.82rem;color:var(--slate);margin-top:3px;font-style:italic">"${f.notes}"</div>`:''}
          </div>
          <span class="badge badge-gold">Failure</span>
        </div>
        <div class="alternatives-box">
          <h4>Alternatives Suggested</h4>
          ${f.alternatives.map(a=>`<div class="alt-item">${a}</div>`).join('')}
        </div>
      </div>
    `).join('')}
  `;
}