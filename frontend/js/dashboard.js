function renderFarmerDashboard() {
  const u = state.user;
  const myP = state.products.filter(p=>p.farmerId===u.id || p.farmer_id===u.id);
  const myT = state.trans.filter(t=>t.farmerId===u.id || t.farmer_id===u.id);
  const myD = state.deals.filter(d=>d.farmerId===u.id || d.farmer_id===u.id);
  const pending = myD.filter(d=>d.status==='Pending').length;
  document.getElementById('page-body').innerHTML = `
    <div class="hero-banner">
      <div class="inner">
        <h2>Good day, ${u.name}! ${ROLE_CFG.farmer.icon}</h2>
        <p>Track your harvest, manage storage conditions, and connect with logistics partners — all from one place.</p>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card green" data-icon="🌿"><div class="stat-value">${myP.length}</div><div class="stat-label">Listed Produce</div><div class="stat-sub">Items in market</div></div>
      <div class="stat-card gold" data-icon="🚛"><div class="stat-value">${myT.length}</div><div class="stat-label">Transport Requests</div><div class="stat-sub">${myT.filter(t=>t.status==='Open').length} open</div></div>
      <div class="stat-card forest" data-icon="🤝"><div class="stat-value">${myD.length}</div><div class="stat-label">Total Deals</div><div class="stat-sub">${myD.filter(d=>d.status==='Accepted').length} accepted</div></div>
      <div class="stat-card sage" data-icon="🔔"><div class="stat-value">${pending}</div><div class="stat-label">Pending Offers</div><div class="stat-sub">Awaiting response</div></div>
    </div>
    ${pending>0?`<div class="alert alert-warning">You have <strong>${pending} pending deal offer(s)</strong> from dealers waiting for your response.</div>`:''}
    <div class="info-grid">
      <div class="card">
        <div class="card-header"><div class="card-title">Recent Produce</div></div>
        <div style="overflow-x:auto">
        <table class="data-table">
          <thead><tr><th>Produce</th><th>Qty</th><th>Status</th><th>Fresh Days</th></tr></thead>
          <tbody>${myP.length?myP.slice(-4).reverse().map(p=>`<tr><td>${p.emoji||'🌿'} <strong>${p.name}</strong></td><td>${p.quantity} ${p.unit}</td><td>${badge(p.status)}</td><td>${p.freshDays} days</td></tr>`).join(''):'<tr><td colspan="4" style="text-align:center;color:#8FA8A0;padding:20px">No produce listed yet</td></tr>'}</tbody>
        </table></div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Recent Transport</div></div>
        <div style="overflow-x:auto">
        <table class="data-table">
          <thead><tr><th>Product</th><th>Route</th><th>Status</th></tr></thead>
          <tbody>${myT.length?myT.slice(-4).reverse().map(t=>`<tr><td>${t.product}</td><td>${t.pickup}→${t.destination}</td><td>${badge(t.status)}</td></tr>`).join(''):'<tr><td colspan="3" style="text-align:center;color:#8FA8A0;padding:20px">No requests yet</td></tr>'}</tbody>
        </table></div>
      </div>
    </div>
  `;
}

function renderTransportDashboard() {
  const u = state.user;
  const myJobs = state.trans.filter(t=>t.assignedTo===u.id);
  const myFail = state.failures.filter(f=>f.transporterId===u.id);

  document.getElementById('page-body').innerHTML = `
    <div class="hero-banner" style="background:linear-gradient(135deg,#7E5109,#CA6F1E,#E67E22)">
      <div class="inner"><h2>Welcome, ${u.name}!</h2><p>Browse open transport requests, accept jobs, and manage your deliveries efficiently.</p></div>
    </div>
    <div class="stats-grid">
      <div class="stat-card green" data-icon="📋"><div class="stat-value">${state.trans.filter(t=>t.status==='Open').length}</div><div class="stat-label">Open Requests</div><div class="stat-sub">Available to accept</div></div>
      <div class="stat-card gold" data-icon="🗓️"><div class="stat-value">${myJobs.filter(j=>j.status==='Accepted').length}</div><div class="stat-label">Active Jobs</div><div class="stat-sub">In progress</div></div>
      <div class="stat-card forest" data-icon="✅"><div class="stat-value">${myJobs.filter(j=>j.status==='Completed').length}</div><div class="stat-label">Completed</div><div class="stat-sub">Delivered</div></div>
      <div class="stat-card sage" data-icon="⚠️"><div class="stat-value">${myFail.length}</div><div class="stat-label">Failures Reported</div><div class="stat-sub">Incidents</div></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Open Requests Nearby</div><button class="btn btn-sm btn-primary" onclick="navigate('offers')">View All</button></div>
      <div class="card-body table-wrap">
      <table class="data-table">
        <thead><tr><th>Farmer</th><th>Produce</th><th>Route</th><th>Date</th><th>Action</th></tr></thead>
        <tbody>${state.trans.filter(t=>t.status==='Open').slice(0,5).map(t=>`<tr>
          <td>${t.farmerName}</td><td>${produceEmoji(t.product)} ${t.product}</td>
          <td>${t.pickup} → ${t.destination}</td><td>${t.date}</td>
          <td><button class="btn btn-sm btn-primary" onclick="acceptJob('${t.id}')">Accept</button></td>
        </tr>`).join('')||'<tr><td colspan="5" style="text-align:center;color:#8FA8A0;padding:20px">No open requests</td></tr>'}</tbody>
      </table></div>
    </div>
  `;
}

function renderDealerDashboard() {
  const u = state.user;
  const myD = state.deals.filter(d=>d.dealerId===u.id);
  const avail = state.products.filter(p=>p.status==='Available');
  const avgPrice = myD.length > 0 ? (myD.reduce((sum, d) => sum + (d.price || 0), 0) / myD.length).toFixed(1) : 0;

  document.getElementById('page-body').innerHTML = `
    <div class="hero-banner" style="background:linear-gradient(135deg,#1A5276,#2471A3,#2980B9)">
      <div class="inner"><h2>Welcome, ${u.name}!</h2><p>Discover fresh produce from farmers across Bangladesh. Make deals and build direct supply chains.</p></div>
    </div>
    <div class="stats-grid">
      <div class="stat-card green" data-icon="🛒"><div class="stat-value">${avail.length}</div><div class="stat-label">Available Items</div><div class="stat-sub">Ready to buy</div></div>
      <div class="stat-card gold" data-icon="🤝"><div class="stat-value">${myD.length}</div><div class="stat-label">Total Deals</div><div class="stat-sub">All time</div></div>
      <div class="stat-card forest" data-icon="✅"><div class="stat-value">${myD.filter(d=>d.status==='Accepted').length}</div><div class="stat-label">Accepted Deals</div><div class="stat-sub">Confirmed</div></div>
      <div class="stat-card sage" data-icon="💰"><div class="stat-value">${avgPrice}</div><div class="stat-label">Avg Offered</div><div class="stat-sub">Per kg average</div></div>
    </div>
    ${myD.filter(d=>d.status==='Pending').length > 0 ? `<div class="alert alert-info">You have <strong>${myD.filter(d=>d.status==='Pending').length} pending offer(s)</strong> awaiting farmer response.</div>` : ''}
    <div class="card">
      <div class="card-header"><div class="card-title">Featured Produce</div><button class="btn btn-sm btn-primary" onclick="navigate('browse')">Browse All</button></div>
      <div class="produce-grid" style="padding:1.5rem;gap:1rem;">
      ${avail.slice(0,6).map(p=>`
          <div class="produce-card" onclick="openDealModal('${p.id}')" style="cursor:pointer">
            <div class="produce-card-header" style="background:${p.category==='Fruit'?'linear-gradient(135deg,#FEF9E7,#FDEBD0)':'linear-gradient(135deg,#E9F7EF,#D5F5E3)'}">
              <span class="badge ${p.category==='Fruit'?'badge-gold':'badge-green'}" style="position:absolute;top:10px;left:12px">${p.category}</span>
              <span class="produce-emoji">${p.emoji||'🌿'}</span>
              <div class="produce-name">${p.name}</div>
              <div class="produce-meta">by ${p.farmerName} · ${p.location}</div>
            </div>
            <div class="produce-card-body">
              <div class="produce-info-row"><span class="produce-info-label">Stock</span><span class="produce-info-val">${p.quantity} ${p.unit}</span></div>
              ${p.expectedPrice ? `<div class="produce-info-row" style="background:var(--foam);padding:4px 6px;border-radius:4px"><span class="produce-info-label">Ask</span><span class="produce-info-val" style="font-weight:600">${p.expectedPrice}/kg</span></div>` : ''}
              <div class="produce-info-row"><span class="produce-info-label">Fresh for</span><span class="produce-info-val">${p.freshDays} days</span></div>
              <div style="margin-top:10px"><button class="btn btn-gold btn-full">Make Offer</button></div>
            </div>
          </div>
          `).join('')||'<p style="color:var(--mist);padding:1rem">No produce available.</p>'}
      </div>
    </div>
  `;
}

function renderAdminDashboard() {
  const total = { users:state.users.length, products:state.products.length, trans:state.trans.length, deals:state.deals.length, failures:state.failures.length };
  const byRole = r => state.users.filter(u=>u.role===r).length;
  document.getElementById('page-body').innerHTML = `
    <div class="hero-banner" style="background:linear-gradient(135deg,#4A235A,#6C3483,#8E44AD)">
      <div class="inner"><h2>Admin Overview</h2><p>System-wide monitoring across all users, produce listings, logistics, and deals.</p></div>
    </div>
    <div class="stats-grid">
      <div class="stat-card green" data-icon="👥"><div class="stat-value">${total.users}</div><div class="stat-label">Total Users</div></div>
      <div class="stat-card gold" data-icon="🌿"><div class="stat-value">${total.products}</div><div class="stat-label">Produce Listed</div></div>
      <div class="stat-card forest" data-icon="🚛"><div class="stat-value">${total.trans}</div><div class="stat-label">Transport Requests</div></div>
      <div class="stat-card sage" data-icon="🤝"><div class="stat-value">${total.deals}</div><div class="stat-label">Deals</div></div>
    </div>
    <div class="info-grid">
      <div class="card">
        <div class="card-header"><div class="card-title">Users by Role</div></div>
        <div class="card-body">
          ${[['Farmers','farmer','green'],['Transport','transport','gold'],['Dealers','dealer','blue'],['Admins','admin','gray']].map(([label,role,color])=>`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--ivory)">
              <span style="font-weight:600">${label}</span>
              <span class="badge badge-${color}">${byRole(role)}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Activity Summary</div></div>
        <div class="card-body">
          ${[['Open Transport Requests', state.trans.filter(t=>t.status==='Open').length,'blue'],
            ['Active Deliveries', state.trans.filter(t=>t.status==='Accepted').length,'green'],
            ['Pending Deals', state.deals.filter(d=>d.status==='Pending').length,'gold'],
            ['Delivery Failures', state.failures.length,'red']].map(([label,val,color])=>`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--ivory)">
              <span style="font-weight:600">${label}</span>
              <span class="badge badge-${color}">${val}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    ${state.failures.length>0?`<div class="alert alert-warning">${state.failures.length} delivery failure(s) reported. Review in the Failures section.</div>`:''}
  `;
}

function renderStorageGuide() {
  const fruits = Object.entries(PRODUCE_DB).filter(([,v])=>v.cat==='Fruit');
  const vegs   = Object.entries(PRODUCE_DB).filter(([,v])=>v.cat==='Vegetable');
  
  document.getElementById('page-body').innerHTML = `
    <div class="section-header"><h2>Storage Guide</h2></div>
    <div class="hero-banner"><div class="inner"><h2>Storage Condition Reference</h2><p>Optimal conditions to minimize post-harvest losses for ${Object.keys(PRODUCE_DB).length} crops.</p></div></div>
    <h3 style="color:var(--forest);margin-bottom:1rem;font-family:'Lora',serif;">Fruits</h3>
    <div class="produce-grid" style="margin-bottom:2rem">${fruits.map(([name,info])=>produceCard(name,info)).join('')}</div>
    <h3 style="color:var(--forest);margin-bottom:1rem;font-family:'Lora',serif;">Vegetables</h3>
    <div class="produce-grid">${vegs.map(([name,info])=>produceCard(name,info)).join('')}</div>
  `;
}