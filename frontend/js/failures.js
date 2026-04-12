const FAIL_REASONS = ['Vehicle breakdown','Road flooded / blocked','Driver unavailable','Fuel shortage','Accident','Extreme weather','Customs/checkpoint delay','Other'];
const ALTERNATIVES = [
  'Redirect to nearest government cold storage facility',
  'Contact alternate registered transport provider in the area',
  'Sell to local market or wholesaler to avoid total loss',
  'Split consignment — partial delivery via alternate route',
  'Refrigerated holding at origin until transport resumes',
  'Coordinate with district agricultural officer for emergency logistics',
  'Use rail freight as alternative if available on route',
];

function renderFailures() {
  const myFail = state.failures.filter(f=>f.transporterId===state.user.id);
  const myJobs = state.trans.filter(t=>t.assignedTo===state.user.id && t.status==='Accepted');

  document.getElementById('page-body').innerHTML = `
    <div class="section-header"><h2>Delivery Failures</h2><button class="btn btn-gold" onclick="openReportFailure()">Report Failure</button></div>
    <div id="fail-alert"></div>
    ${myFail.length===0?`<div class="card"><div class="empty-state"><div class="empty-icon">✅</div><p>No failures reported. Keep up the good work!</p></div></div>`:''}
    ${myFail.map(f=>`
      <div class="failure-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div style="font-weight:700;color:var(--amber);font-size:1.05rem">${produceEmoji(f.product)} ${f.product}</div>
            <div style="font-size:.85rem;color:var(--slate);margin-top:3px">Route: ${f.route} - ${f.reported}</div>
            <div style="font-size:.85rem;margin-top:5px"><strong>Reason:</strong> ${f.reason}</div>
            ${f.notes?`<div style="font-size:.82rem;color:var(--slate);margin-top:3px;font-style:italic">"${f.notes}"</div>`:''}
          </div>
          <span class="badge badge-gold">Failure Reported</span>
        </div>
        <div class="alternatives-box">
          <h4>Suggested Alternative Actions</h4>
          ${f.alternatives.map(a=>`<div class="alt-item">${a}</div>`).join('')}
        </div>
      </div>
    `).join('')}
  `;
}

function openReportFailure() {
  const jobs = state.trans.filter(t=>String(t.assignedTo)===String(state.user.id) && t.status==='Accepted');
  
  if (jobs.length === 0) {
    openModal(`<div class="modal">
      <div class="modal-header"><span class="modal-title">Report Delivery Failure</span><button class="modal-close" onclick="closeModal()">X</button></div>
      <div class="modal-body">
        <div class="empty-state">
          <div class="empty-icon">🚛</div>
          <p>You need to have an accepted job before reporting a failure.</p>
          <p style="margin-top:1rem"><button class="btn btn-primary" onclick="closeModal(); navigate('offers');">Browse Requests</button></p>
        </div>
      </div>
    </div>`);
    return;
  }
  
  openModal(`<div class="modal">
    <div class="modal-header"><span class="modal-title">Report Delivery Failure</span><button class="modal-close" onclick="closeModal()">X</button></div>
    <div class="modal-body">
      <div id="rf-alert"></div>
      <div class="form-group"><label class="form-label">Select Job</label>
        <select class="form-control" id="rf-job">
          <option value="">-- Select Active Job --</option>
          ${jobs.map(j=>`<option value="${j.id}">${j.product} — ${j.pickup} → ${j.destination}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label class="form-label">Failure Reason</label>
        <select class="form-control" id="rf-reason">
          <option value="">-- Select Reason --</option>
          ${FAIL_REASONS.map(r=>`<option>${r}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label class="form-label">Additional Details</label><textarea class="form-control" id="rf-notes" placeholder="Describe what happened and your current situation..."></textarea></div>
      <button class="btn btn-gold btn-full" onclick="submitFailure()">Submit Failure Report</button>
    </div>
  </div>`);
}

async function submitFailure() {
  const jobId = document.getElementById('rf-job').value;
  const reason = document.getElementById('rf-reason').value;
  if(!jobId||!reason) return showAlert('rf-alert','Please select a job and reason.','danger');
  const job = state.trans.find(t=>String(t.id)===String(jobId));
  const alts = ALTERNATIVES.filter(()=>Math.random()>.3).slice(0,4);

  try {
    await apiFetch('/failures', { method:'POST', body: JSON.stringify({
      transport_request_id: jobId, produce_name: job?.product,
      route: `${job?.pickup} -> ${job?.destination}`,
      reason, notes: document.getElementById('rf-notes').value, alternatives: alts
    })});

    closeModal();
    await refreshDataAndRender('failures');
    showAlert('fail-alert','Failure report submitted.','success');
  }
  catch(e) {
    if (isDemo()) {
      const newFail = {
        id:'fail'+Date.now(),
        transporterId: state.user.id,
        transporterName: state.user.name,
        requestId: jobId,
        product: job?.product,
        route: `${job?.pickup} -> ${job?.destination}`,
        reason: reason,
        notes: document.getElementById('rf-notes').value,
        alternatives: alts,
        reported: today()
      };
      state.failures.push(newFail);
      state.trans = state.trans.map(t=>String(t.id)===String(jobId)?{...t,status:'Failed'}:t);
      closeModal();
      renderFailures();
      showAlert('fail-alert','Failure report saved locally!','success');
      return;
    }
    handleApiError(e, 'rf-alert', 'Failed to report failure.');
  }
}