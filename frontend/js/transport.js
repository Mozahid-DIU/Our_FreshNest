function renderTransportReqs() {
  const myT = state.trans.filter(t=>t.farmerId===state.user.id);
  const myP = state.products.filter(p=>p.farmerId===state.user.id);
  document.getElementById('page-body').innerHTML = `
    <div class="section-header"><h2>Transport Requests</h2><button class="btn btn-gold" onclick="openAddTransport()">+ New Request</button></div>
    <div id="trans-alert"></div>
    ${myT.length===0?`<div class="card"><div class="empty-state"><div class="empty-icon">🚛</div><p>No transport requests yet.</p></div></div>`:`
    <div class="card"><div class="card-body table-wrap">
    <table class="data-table">
      <thead><tr><th>Produce</th><th>Pickup</th><th>Destination</th><th>Date</th><th>Quantity</th><th>Transporter</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>${myT.map(t=>`<tr>
        <td>${produceEmoji(t.product)} <strong>${t.product}</strong></td>
        <td>${t.pickup}</td><td>${t.destination}</td><td>${t.date}</td><td>${t.quantity}</td>
        <td>${t.transporterName||'<span style="color:#8FA8A0">Unassigned</span>'}</td>
        <td>${badge(t.status)}</td>
        <td>${t.status==='Open'?`<button class="btn btn-sm" style="background:#C0392B;color:white" onclick="cancelTransport('${t.id}')">Cancel</button>`:'—'}</td>
      </tr>`).join('')}</tbody>
    </table></div></div>`}
  `;
}  

function openAddTransport() {
  const myP = state.products.filter(p=>p.farmerId===state.user.id || p.farmer_id===state.user.id);
  
  if (myP.length === 0) {
    openModal(`<div class="modal">
      <div class="modal-header"><span class="modal-title">New Transport Request</span><button class="modal-close" onclick="closeModal()">X</button></div>
      <div class="modal-body">
        <div class="empty-state">
          <div class="empty-icon">🌿</div>
          <p>You need to add produce before creating a transport request.</p>
          <p style="margin-top:1rem"><button class="btn btn-primary" onclick="closeModal(); openAddProduct();">+ Add Produce First</button></p>
        </div>
      </div>
    </div>`);
    return;
  }

  openModal(`<div class="modal">
    <div class="modal-header"><span class="modal-title">New Transport Request</span><button class="modal-close" onclick="closeModal()">X</button></div>
    <div class="modal-body">
      <div id="at-alert"></div>
      <div class="form-group"><label class="form-label">Select Produce</label>
        <select class="form-control" id="at-prod">
          <option value="">-- Select Produce --</option>
          ${myP.map(p=>`<option value="${p.id}" data-loc="${p.location}">${p.emoji||'🌿'} ${p.name} (${p.quantity} ${p.unit})</option>`).join('')}
        </select>
      </div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Pickup Location</label><input class="form-control" id="at-pickup" placeholder="Auto from product"></div>
        <div class="form-group"><label class="form-label">Destination</label><input class="form-control" id="at-dest" placeholder="e.g. Dhaka Kawran Bazar"></div>
      </div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Pickup Date</label><input class="form-control" type="date" id="at-date" value="${today()}"></div>
        <div class="form-group"><label class="form-label">Quantity</label><input class="form-control" id="at-qty" placeholder="e.g. 500 kg"></div>
      </div>
      <div class="form-group"><label class="form-label">Special Instructions</label><textarea class="form-control" id="at-notes" placeholder="e.g. Refrigerated vehicle required..."></textarea></div>
      <button class="btn btn-primary btn-full" onclick="submitTransport()">Submit Request</button>
    </div>
  </div>`);
  
  document.getElementById('at-prod').addEventListener('change', function() {
    const opt = this.options[this.selectedIndex];
    const loc = opt.getAttribute('data-loc');
    if(loc) document.getElementById('at-pickup').value = loc;
  });
}

async function submitTransport() {
  const prodId=document.getElementById('at-prod').value;
  const dest=document.getElementById('at-dest').value;
  if(!prodId||!dest) return showAlert('at-alert','Select produce and enter destination.','danger');
  
  const prod = state.products.find(p=>String(p.id)===String(prodId));
 
  try {
    await apiFetch('/transport', { method:'POST', body: JSON.stringify({
      product_id: Number(prodId), produce_name: prod?.name,
      pickup_location: document.getElementById('at-pickup').value||prod?.location,
      destination: dest, pickup_date: document.getElementById('at-date').value,
      quantity: document.getElementById('at-qty').value,
      notes: document.getElementById('at-notes').value
    })});

    closeModal();
    await refreshDataAndRender('transport');
    showAlert('trans-alert','Transport request submitted.','success');
  } 
  catch(e) {
    if (isDemo()) {
      const newTrans = {
        id:'trans'+Date.now(),
        farmerId: state.user.id,
        farmerName: state.user.name,
        product: prod?.name,
        productId: prodId,
        pickup: document.getElementById('at-pickup').value||prod?.location||'',
        destination: dest,
        date: document.getElementById('at-date').value,
        quantity: document.getElementById('at-qty').value,
        notes: document.getElementById('at-notes').value,
        status: 'Open',
        created: today()
      };
      state.trans.push(newTrans);
      SEED_TRANS.push(newTrans);
      closeModal();
      renderTransportReqs();
      showAlert('trans-alert','Transport request added locally!','success');
      return;
    }
    handleApiError(e, 'at-alert', 'Failed to submit transport request.');
  }
}

async function cancelTransport(id) {
  try {
    await apiFetch('/transport/'+id, { method:'PATCH', body: JSON.stringify({ status:'Cancelled' }) });
    await refreshDataAndRender('transport');
    showAlert('trans-alert','Transport request cancelled.','success');
  } 
  catch(e) {
    if (isDemo()) {
      state.trans = state.trans.map(t=>String(t.id)===String(id)?{...t,status:'Cancelled'}:t);
      renderTransportReqs();
      showAlert('trans-alert','Transport cancelled locally!','success');
      return;
    }
    handleApiError(e, 'trans-alert', 'Failed to cancel transport request.');
  }
}

function renderBrowseRequests() {
  const open = state.trans.filter(t=>t.status==='Open');
  document.getElementById('page-body').innerHTML = `
    <div class="section-header"><h2>Browse Requests</h2></div>
    <div id="offer-alert"></div>
    ${open.length===0?`<div class="card"><div class="empty-state"><div class="empty-icon">📋</div><p>No open requests at the moment.</p></div></div>`:`
    <div class="card"><div class="card-body table-wrap">
    <table class="data-table">
      <thead><tr><th>Farmer</th><th>Produce</th><th>Pickup</th><th>Destination</th><th>Date</th><th>Qty</th><th>Notes</th><th>Action</th></tr></thead>
      <tbody>${open.map(t=>`<tr>
        <td><strong>${t.farmerName}</strong></td>
        <td>${produceEmoji(t.product)} ${t.product}</td>
        <td>${t.pickup}</td><td>${t.destination}</td>
        <td>${t.date}</td><td>${t.quantity}</td>
        <td style="max-width:150px;font-size:.8rem;color:var(--slate)">${t.notes||'—'}</td>
        <td><button class="btn btn-sm btn-primary" onclick="acceptJob('${t.id}')">Accept</button></td>
      </tr>`).join('')}</tbody>
    </table></div></div>`}
  `;
}

async function acceptJob(id) {
  try {
    await apiFetch('/transport/'+id, { method:'PATCH', body: JSON.stringify({ status:'Accepted' }) });
    await refreshDataAndRender(state.activeNav || 'offers');
    showAlert('offer-alert','Job accepted.','success');
  } catch(e) {
    if (isDemo()) {
      state.trans = state.trans.map(t=>String(t.id)===String(id)?{...t,status:'Accepted',assignedTo:state.user.id,transporterName:state.user.name}:t);
      renderBrowseRequests();
      showAlert('offer-alert','Job accepted locally!','success');
      return;
    }
    handleApiError(e, 'offer-alert', 'Failed to accept job.');
  }
}

function renderMyJobs() {
  const mine = state.trans.filter(t=>t.assignedTo===state.user.id);
  document.getElementById('page-body').innerHTML = `
    <div class="section-header"><h2>My Jobs</h2></div>
    <div id="job-alert"></div>
    ${mine.length===0?`<div class="card"><div class="empty-state"><div class="empty-icon">🗓️</div><p>No accepted jobs yet. Browse open requests.</p></div></div>`:`
    <div class="card"><div class="card-body table-wrap">
    <table class="data-table">
      <thead><tr><th>Produce</th><th>Route</th><th>Date</th><th>Qty</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>${mine.map(t=>`<tr>
        <td>${produceEmoji(t.product)} <strong>${t.product}</strong></td>
        <td>${t.pickup} → ${t.destination}</td>
        <td>${t.date}</td><td>${t.quantity}</td>
        <td>${badge(t.status)}</td>
        <td>${t.status==='Accepted'?`<button class="btn btn-sm btn-primary" onclick="completeJob('${t.id}')">Delivered</button>`:'—'}</td>
      </tr>`).join('')}</tbody>
    </table></div></div>`}
  `;
}

async function completeJob(id) {
  try {
    await apiFetch('/transport/'+id, { method:'PATCH', body: JSON.stringify({ status:'Completed' }) });
    await refreshDataAndRender(state.activeNav || 'myjobs');
    showAlert('job-alert','Job completed.','success');
  } catch(e) {
    if (isDemo()) {
      state.trans = state.trans.map(t=>String(t.id)===String(id)?{...t,status:'Completed'}:t);
      renderMyJobs();
      showAlert('job-alert','Job completed locally!','success');
      return;
    }
    handleApiError(e, 'job-alert', 'Failed to complete job.');
  }
}