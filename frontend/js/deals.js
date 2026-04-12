function renderFarmerDeals() {
  const myD = state.deals.filter(d=>d.farmerId===state.user.id);
  
  document.getElementById('page-body').innerHTML = `
    <div class="section-header"><h2>My Deals</h2></div>
    <div id="deal-alert"></div>
    ${myD.length===0?`<div class="card"><div class="empty-state"><div class="empty-icon">🤝</div><p>No deal offers yet. List your produce so dealers can find you!</p></div></div>`:`
    <div class="card"><div class="card-body table-wrap">
    <table class="data-table">
      <thead><tr><th>Dealer</th><th>Produce</th><th>Quantity</th><th>Your Ask</th><th>Offered</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${myD.map(d=>`<tr>
        <td><strong>${d.dealerName}</strong></td>
        <td>${produceEmoji(d.product)} ${d.product}</td>
        <td>${d.quantity}</td>
        <td>${d.expectedPrice ? 'Taka'+d.expectedPrice+'/kg' : '—'}</td>
        <td style="font-weight:600;color:${d.expectedPrice && d.price < d.expectedPrice ? 'var(--amber)' : 'var(--forest)'}">${d.price}/kg</td>
        <td>${d.created}</td>
        <td>${badge(d.status)}</td>
        <td>${d.status==='Pending'?`
          <button class="btn btn-sm btn-primary" onclick="respondDeal('${d.id}','Accepted')">Accept</button>
          <button class="btn btn-sm btn-danger" style="margin-left:5px" onclick="respondDeal('${d.id}','Declined')">Decline</button>`:'—'}
        </td>
      </tr>`).join('')}</tbody>
    </table></div></div>`}
  `;
}

async function respondDeal(id, status) {
  try {
    await apiFetch('/deals/'+id, { method:'PATCH', body: JSON.stringify({ status }) });
    await refreshDataAndRender('deals');
  } 
  catch(e) {
    if (isDemo()) {
      state.deals = state.deals.map(d=>String(d.id)===String(id)?{...d,status}:d);
      renderFarmerDeals();
      showAlert('deal-alert','Deal response saved locally!','success');
      return;
    }
    handleApiError(e, 'deal-alert', 'Failed to respond to deal.');
  }
}

function renderMyDeals() {
  const myD = state.deals.filter(d=>d.dealerId===state.user.id);

  document.getElementById('page-body').innerHTML = `
    <div class="section-header"><h2>My Deals</h2></div>
    ${myD.length===0?`<div class="card"><div class="empty-state"><div class="empty-icon">🤝</div><p>No deals yet. Browse produce and send offers!</p></div></div>`:`
    <div class="card"><div class="card-body table-wrap">
    <table class="data-table">
      <thead><tr><th>Produce</th><th>Farmer</th><th>Qty Requested</th><th>Farmer Ask</th><th>Your Offer</th><th>Date</th><th>Status</th></tr></thead>
      <tbody>${myD.map(d=>`<tr>
        <td>${produceEmoji(d.product)} <strong>${d.product}</strong></td>
        <td>${d.farmerName}</td><td>${d.quantity}</td>
        <td>${d.expectedPrice ? 'Taka'+d.expectedPrice+'/kg' : '—'}</td>
        <td style="font-weight:600">Taka${d.price}/kg</td>
        <td>${d.created}</td><td>${badge(d.status)}</td>
      </tr>`).join('')}</tbody>
    </table></div></div>`}
  `;
}

function renderBrowseProduce() {
  const avail = state.products.filter(p=>p.status==='Available');
 
  document.getElementById('page-body').innerHTML = `
    <div class="section-header"><h2>Browse Produce</h2>
    <div style="display:flex;gap:8px">
      <select class="form-control" id="filter-cat" onchange="filterProduce()" style="width:auto;padding:8px 14px">
        <option value="">All Categories</option><option>Fruit</option><option>Vegetable</option>
      </select>
    </div>
    <div id="deal-alert"></div>
    <div id="produce-grid" class="produce-grid">
    ${avail.map(p=>produceCardDealer(p)).join('')}
    </div>
    ${avail.length===0?`<div class="card"><div class="empty-state"><div class="empty-icon">🛒</div><p>No produce available right now.</p></div></div>`:''}
  `;
}

function filterProduce() {
  const cat = document.getElementById('filter-cat')?.value;
  const avail = state.products.filter(p=>p.status==='Available' && (!cat||p.category===cat));
  const grid = document.getElementById('produce-grid');
 
  if(grid) grid.innerHTML = avail.map(p=>produceCardDealer(p)).join('');
}

function produceCardDealer(p) {
  const priceDisplay = p.expectedPrice ? `<div class="produce-info-row" style="background:var(--ivory);padding:6px 8px;border-radius:4px;margin-top:4px"><span class="produce-info-label" style="color:var(--forest)">Farmer's Ask</span><span class="produce-info-val" style="color:var(--forest);font-weight:600">Taka${p.expectedPrice}/kg</span></div>` : '';

  return `<div class="produce-card">
    <div class="produce-card-header" style="background:${p.category==='Fruit'?'linear-gradient(135deg,#FEF9E7,#FDEBD0)':'linear-gradient(135deg,#E9F7EF,#D5F5E3)'}">
      <span class="badge ${p.category==='Fruit'?'badge-gold':'badge-green'}" style="position:absolute;top:10px;left:12px">${p.category}</span>
      <span class="produce-emoji">${p.emoji||'🌿'}</span>
      <div class="produce-name">${p.name}</div>
      <div class="produce-meta">by ${p.farmerName} - ${p.location}</div>
    </div>
    <div class="produce-card-body">
      <div class="produce-info-row"><span class="produce-info-label">Available</span><span class="produce-info-val">${p.quantity} ${p.unit}</span></div>
      ${priceDisplay}
      <div class="produce-info-row"><span class="produce-info-label">Storage</span><span class="produce-info-val">${p.temp}</span></div>
      <div class="produce-info-row"><span class="produce-info-label">Fresh for</span><span class="produce-info-val">${p.freshDays} days</span></div>
      <div class="produce-info-row"><span class="produce-info-label">Harvested</span><span class="produce-info-val">${p.harvestDate}</span></div>
      <div style="margin-top:12px"><button class="btn btn-gold btn-full" onclick="openDealModal('${p.id}')">Make Offer</button></div>
    </div>
  </div>`;
}

function openDealModal(productId) {
  const p = state.products.find(pr=>pr.id===productId);
 
  if(!p) return;
 
  openModal(`<div class="modal">
    <div class="modal-header"><span class="modal-title">Make Deal Offer</span><button class="modal-close" onclick="closeModal()">X</button></div>
    <div class="modal-body">
      <div style="background:var(--foam);border-radius:4px;padding:1rem;margin-bottom:1rem;border:1.5px solid var(--mint)">
        <div style="font-size:2rem">${p.emoji||'🌿'}</div>
        <div style="font-weight:700;font-size:1.1rem;color:var(--forest)">${p.name}</div>
        <div style="font-size:.85rem;color:var(--slate);margin-top:3px">by ${p.farmerName} - ${p.location} - ${p.quantity} ${p.unit} available</div>
        <div style="margin-top:8px;font-size:.82rem;color:var(--green)">${p.tips}</div>
      </div>
      <div id="dm-alert"></div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Quantity Wanted</label><input class="form-control" id="dm-qty" type="number" placeholder="kg / units"></div>
        <div class="form-group"><label class="form-label">Offered Price (Taka/kg)</label><input class="form-control" id="dm-price" type="number" placeholder="e.g. 75"></div>
      </div>
      <div class="form-group"><label class="form-label">Message to Farmer (optional)</label><textarea class="form-control" id="dm-msg" placeholder="Any special requirements..."></textarea></div>
      <button class="btn btn-gold btn-full" onclick="submitDeal('${productId}')">Send Offer to Farmer</button>
    </div>
  </div>`);
}

async function submitDeal(productId) {
  const qty=document.getElementById('dm-qty').value;
  const price=document.getElementById('dm-price').value;
  
  if(!qty||!price) return showAlert('dm-alert','Enter quantity and price.','danger');
  
  const p = state.products.find(pr=>String(pr.id)===String(productId));

  try {
    await apiFetch('/deals', { method:'POST', body: JSON.stringify({
      farmer_id: p.farmerId, farmer_name: p.farmerName,
      product_id: productId, produce_name: p.name,
      quantity_requested: qty+' '+p.unit,
      offered_price_per_kg: Number(price),
      message: document.getElementById('dm-msg').value
    })});

    closeModal();
    await refreshDataAndRender(state.activeNav || 'browse');
    showAlert('deal-alert','Offer sent successfully to the farmer!','success');
  }
  catch(e) {
    if (isDemo()) {
      const newDeal = {
        id:'deal'+Date.now(),
        dealerId: state.user.id,
        dealerName: state.user.name,
        farmerId: p.farmerId,
        farmerName: p.farmerName,
        product: p.name,
        productId: productId,
        quantity: qty+' '+p.unit,
        price: Number(price),
        msg: document.getElementById('dm-msg').value,
        status: 'Pending',
        created: today()
      };
      state.deals.push(newDeal);
      SEED_DEALS.push(newDeal);
      closeModal();
      showAlert('deal-alert','Offer saved locally!','success');
      return;
    }
    handleApiError(e, 'dm-alert', 'Failed to send offer.');
  }
}