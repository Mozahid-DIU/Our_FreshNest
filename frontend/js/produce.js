function renderMyProducts() {
  const myP = state.products.filter(p => p.farmerId === state.user.id || p.farmer_id === state.user.id);
  document.getElementById('page-body').innerHTML = `
    <div class="section-header"><h2>My Produce</h2><button class="btn btn-primary" onclick="openAddProduct()">+ Add Produce</button></div>
    <div id="prod-alert"></div>
    ${myP.length === 0
      ? `<div class="card"><div class="empty-state"><div class="empty-icon">🌿</div><p>No produce listed yet. Add your first item!</p></div></div>`
      : `<div class="card"><div class="card-body table-wrap">
        <table class="data-table">
          <thead><tr><th>Produce</th><th>Category</th><th>Qty</th><th>Harvest Date</th><th>Location</th><th>Temp</th><th>Fresh Days</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>${myP.map(p => `<tr>
            <td>${p.emoji || '🌿'} <strong>${p.name}</strong></td>
            <td><span class="badge ${p.category === 'Fruit' ? 'badge-gold' : 'badge-green'}">${p.category}</span></td>
            <td>${p.quantity} ${p.unit}</td>
            <td>${p.harvestDate || p.harvest_date || ''}</td>
            <td>${p.location}</td>
            <td>${p.temp || ''}</td>
            <td>${p.freshDays || ''} days</td>
            <td>${badge(p.status)}</td>
            <td><button class="btn btn-sm" style="background:#C0392B;color:white" onclick="removeProduct('${p.id}')">Remove</button></td>
          </tr>`).join('')}
          </tbody>
        </table>
      </div></div>`}
  `;
}

function openAddProduct() {
  const myP = state.products.filter(p=>p.farmerId===state.user.id);
  
  openModal(`<div class="modal">
    <div class="modal-header"><span class="modal-title">Add New Produce</span><button class="modal-close" onclick="closeModal()">X</button></div>
    <div class="modal-body">
      <div id="add-prod-alert"></div>
      <div class="form-group">
        <label class="form-label">Produce Type</label>
        <select class="form-control" id="ap-name" onchange="updateStorageTip()">
          <optgroup label="Fruits">${Object.entries(PRODUCE_DB).filter(([,v])=>v.cat==='Fruit').map(([k,v])=>`<option>${k}</option>`).join('')}</optgroup>
          <optgroup label="Vegetables">${Object.entries(PRODUCE_DB).filter(([,v])=>v.cat==='Vegetable').map(([k,v])=>`<option>${k}</option>`).join('')}</optgroup>
        </select>
      </div>
      <div id="storage-tip-box" class="storage-tip">Recommended: 13-15C - 85-90% humidity - Fresh for 14 days.</div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Quantity</label><input class="form-control" id="ap-qty" type="number" placeholder="e.g. 500"></div>
        <div class="form-group"><label class="form-label">Unit</label>
        <select class="form-control" id="ap-unit"><option>kg</option><option>ton</option><option>pieces</option><option>crate</option></select>
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Harvest Date</label><input class="form-control" type="date" id="ap-date" value="${today()}"></div>
        <div class="form-group"><label class="form-label">Storage Location</label><input class="form-control" id="ap-loc" placeholder="e.g. Rajshahi" value="${state.user.location||''}"></div>
      </div>
      <div class="form-group">
        <label class="form-label">Asking Price (Taka/kg) <span style="color:var(--slate);font-weight:400">(Optional - visible to dealers)</span></label>
        <input class="form-control" id="ap-price" type="number" placeholder="e.g. 80">
      </div>
      <button class="btn btn-primary btn-full" onclick="submitAddProduct()">Add to Listing</button>
    </div>
  </div>`);
  
  updateStorageTip();
}

function updateStorageTip() {
  const name = document.getElementById('ap-name')?.value;
  const info = PRODUCE_DB[name];
  if(info && document.getElementById('storage-tip-box')) {
    document.getElementById('storage-tip-box').innerHTML = `<strong>${name}:</strong> Store at ${info.temp} - ${info.humidity} humidity - Fresh for <strong>${info.freshDays} days</strong>.<br><em>${info.tips}</em>`;
  }
}

async function submitAddProduct() {
  const name=document.getElementById('ap-name').value;
  const qty=document.getElementById('ap-qty').value;
  const unit=document.getElementById('ap-unit').value;
  const date=document.getElementById('ap-date').value;
  const loc=document.getElementById('ap-loc').value;
  const price=document.getElementById('ap-price').value;

  if(!qty||!date||!loc) return showAlert('add-prod-alert','All fields required.','danger');
  const info = PRODUCE_DB[name]||{};

  try {
    await apiFetch('/produce', { method:'POST', body: JSON.stringify({
      name, category: info.cat||'Other', quantity: Number(qty), unit,
      harvest_date: date, location: loc,
      storage_temp: info.temp||'', storage_humidity: info.humidity||'',
      fresh_days: info.freshDays||0, storage_tips: info.tips||'',
      expected_price_per_kg: price ? Number(price) : null
    })});

    closeModal();
    await refreshDataAndRender('products');
    showAlert('prod-alert','Produce added successfully!','success');
  } catch(e) {
    if (isDemo()) {
      const newProduct = {
        id:'prod'+Date.now(),
        farmerId: state.user.id,
        farmerName: state.user.name,
        name,
        category: info.cat||'Other',
        quantity: Number(qty),
        unit,
        harvestDate: date,
        location: loc,
        status:'Available',
        listed: today(),
        temp: info.temp||'',
        humidity: info.humidity||'',
        freshDays: info.freshDays||7,
        tips: info.tips||'',
        emoji: info.emoji||'*',
        expectedPrice: price ? Number(price) : null
      };
      state.products.push(newProduct);
      SEED_PRODUCTS.push(newProduct);
      closeModal();
      renderMyProducts();
      showAlert('prod-alert','Produce added locally!','success');
      return;
    }
    handleApiError(e, 'add-prod-alert', 'Failed to add produce.');
  }
}

async function removeProduct(id) {
  try {
    await apiFetch('/produce/'+id, { method:'DELETE' });
    await refreshDataAndRender('products');
    showAlert('prod-alert','Produce removed.','success');
  } 
  catch(e) {
    if (isDemo()) {
      state.products = state.products.filter(p=>String(p.id)!==String(id));
      renderMyProducts();
      showAlert('prod-alert','Produce removed locally!','success');
      return;
    }
    handleApiError(e, 'prod-alert', 'Failed to remove produce.');
  }
}