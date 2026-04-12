let state = { user:null, token:null, users:[], products:[], trans:[], deals:[], failures:[], activeNav:null, retryAction:null };

function setPageLoading(message = 'Loading data...') {
  const body = document.getElementById('page-body');
  if (!body) return;
  body.innerHTML = `
    <div class="card">
      <div class="empty-state">
        <div class="empty-icon">loading</div>
        <p>${message}</p>
      </div>
    </div>
  `;
}

function setPageError(message = 'Unable to load data.', actionLabel = 'Retry') {
  const body = document.getElementById('page-body');
  if (!body) return;
  body.innerHTML = `
    <div class="card">
      <div class="empty-state">
        <div class="empty-icon">error</div>
        <p>${message}</p>
        ${state.retryAction ? `<button class="btn btn-primary" onclick="retryLastAction()">${actionLabel}</button>` : ''}
      </div>
    </div>
  `;
}

function retryLastAction() {
  if (typeof state.retryAction === 'function') {
    const fn = state.retryAction;
    state.retryAction = null;
    fn();
  }
}

function logMissingFields(entity, items, fields) {
  const missing = items.filter(item => fields.some(f => item[f] === null || item[f] === undefined || item[f] === ''));
  if (missing.length) {
    console.warn(`[data] ${entity} missing fields`, { count: missing.length, fields });
  }
}

async function loadAll() {
  console.log('Fetching')
  const [products, trans, deals, failures] = await Promise.all([
    apiFetch('/produce').then(r => r.map(normProduce)),
    apiFetch('/transport').then(r => r.map(normTrans)),
    apiFetch('/deals').then(r => r.map(normDeal)),
    apiFetch('/failures').then(r => r.map(normFail)),
  ]);

  state.products = products;
  state.trans    = trans;
  state.deals    = deals;
  state.failures = failures;
  if (state.user.role === 'admin') {
    state.users = await apiFetch('/users').then(r => r.map(normUser));
  }

  logMissingFields('users', state.users, ['id', 'email', 'role']);
  logMissingFields('produce', state.products, ['id', 'farmerId', 'name']);
  logMissingFields('transport', state.trans, ['id', 'farmerId', 'status']);
  logMissingFields('deals', state.deals, ['id', 'dealerId', 'farmerId', 'status']);
}

async function refreshDataAndRender(navId) {
  if (document.getElementById('page-body')) setPageLoading('Refreshing data...');
  state.retryAction = () => refreshDataAndRender(navId);
  try {
    await loadAll();
    if (navId) {
      navigate(navId);
    } else if (state.activeNav) {
      navigate(state.activeNav);
    }
  } catch (err) {
    setPageError(err.message || 'Unable to load data. Please try again.');
  }
}

function loadDemoData() {
  state.users    = SEED_USERS.map(normUser);
  state.products = SEED_PRODUCTS.map(normProduce);
  state.trans     = SEED_TRANS.map(normTrans);
  state.deals     = SEED_DEALS.map(normDeal);
  state.failures  = [];
}