const PRODUCE_DB = {
  'Mango':       { cat:'Fruit', emoji:'🥭', temp:'13–15°C', humidity:'85–90%', freshDays:14, tips:'Store away from ethylene-sensitive produce. Ripen at room temperature.', harvestMonths:'May–July' },
  'Banana':      { cat:'Fruit', emoji:'🍌', temp:'13–15°C', humidity:'85–95%', freshDays:7,  tips:'Never refrigerate unripe bananas. Keep dry and ventilated.', harvestMonths:'Year-round' },
  'Litchi':      { cat:'Fruit', emoji:'🍒', temp:'2–5°C',   humidity:'90–95%', freshDays:5,  tips:'Refrigerate immediately after harvest to retain red color.', harvestMonths:'May–June' },
  'Pineapple':   { cat:'Fruit', emoji:'🍍', temp:'7–10°C',  humidity:'85–90%', freshDays:10, tips:'Store upright. Do not stack. Avoid ethylene exposure.', harvestMonths:'Apr–Aug' },
  'Guava':       { cat:'Fruit', emoji:'🍈', temp:'8–10°C',  humidity:'85–90%', freshDays:7,  tips:'Wrap individually in tissue paper for longer shelf life.', harvestMonths:'Year-round' },
  'Papaya':      { cat:'Fruit', emoji:'🍈', temp:'10–13°C', humidity:'85–90%', freshDays:7,  tips:'Harvest at 25% yellow for long-distance transport.', harvestMonths:'Year-round' },
  'Jackfruit':   { cat:'Fruit', emoji:'🟡', temp:'11–14°C', humidity:'85–90%', freshDays:5,  tips:'Cut jackfruit must be refrigerated and consumed within 3 days.', harvestMonths:'Jun–Aug' },
  'Watermelon':  { cat:'Fruit', emoji:'🍉', temp:'10–15°C', humidity:'85–90%', freshDays:14, tips:'Store away from other fruits. Do not refrigerate uncut.', harvestMonths:'Apr–Sep' },
  'Coconut':     { cat:'Fruit', emoji:'🥥', temp:'0–2°C',   humidity:'80–85%', freshDays:30, tips:'Remove husks for longer cold storage. Avoid moisture.', harvestMonths:'Year-round' },
  'Orange':      { cat:'Fruit', emoji:'🍊', temp:'3–9°C',   humidity:'85–90%', freshDays:21, tips:'Check regularly for mold. Do not wash before storage.', harvestMonths:'Nov–Feb' },
  'Strawberry':  { cat:'Fruit', emoji:'🍓', temp:'0–2°C',   humidity:'90–95%', freshDays:5,  tips:'Handle with extreme care. Never wash before storage.', harvestMonths:'Dec–Feb' },
  'Grape':       { cat:'Fruit', emoji:'🍇', temp:'0–2°C',   humidity:'90–95%', freshDays:21, tips:'Store in original clusters. Avoid temperature fluctuation.', harvestMonths:'Dec–Mar' },
    
  'Tomato':      { cat:'Vegetable', emoji:'🍅', temp:'10–13°C', humidity:'85–90%', freshDays:10, tips:'Store stem-up. Never refrigerate fully ripe tomatoes.', harvestMonths:'Oct–Mar' },
  'Potato':      { cat:'Vegetable', emoji:'🥔', temp:'4–7°C',  humidity:'85–90%', freshDays:60, tips:'Store in dark, dry, cool place. Avoid light to prevent greening.', harvestMonths:'Jan–Mar' },
  'Onion':       { cat:'Vegetable', emoji:'🧅', temp:'0–4°C',  humidity:'65–70%', freshDays:90, tips:'Store dry with good airflow. Low humidity is critical.', harvestMonths:'Jan–Apr' },
  'Eggplant':    { cat:'Vegetable', emoji:'🍆', temp:'10–12°C', humidity:'90–95%', freshDays:7, tips:'Very chilling-sensitive. Keep away from ethylene.', harvestMonths:'Year-round' },
  'Cucumber':    { cat:'Vegetable', emoji:'🥒', temp:'10–13°C', humidity:'90–95%', freshDays:7, tips:'Wrap individually. Ethylene sensitive; isolate from ripening fruits.', harvestMonths:'Year-round' },
  'Cauliflower': { cat:'Vegetable', emoji:'🥦', temp:'0–1°C',  humidity:'90–95%', freshDays:14, tips:'Store wrapped to prevent discoloration. Keep very cold.', harvestMonths:'Nov–Feb' },
  'Cabbage':     { cat:'Vegetable', emoji:'🥬', temp:'0–1°C',  humidity:'90–95%', freshDays:21, tips:'Remove outer damaged leaves before storage.', harvestMonths:'Nov–Feb' },
  'Carrot':      { cat:'Vegetable', emoji:'🥕', temp:'0–1°C',  humidity:'90–95%', freshDays:28, tips:'Remove tops before storage to retain moisture.', harvestMonths:'Nov–Feb' },
  'Spinach':     { cat:'Vegetable', emoji:'🥗', temp:'0–2°C',  humidity:'95–100%',freshDays:5,  tips:'Store in perforated plastic bags. Very perishable.', harvestMonths:'Nov–Feb' },
  'Green Bean':  { cat:'Vegetable', emoji:'🫘', temp:'4–8°C',  humidity:'90–95%', freshDays:7,  tips:'Blanch before freezing for longer storage.', harvestMonths:'Year-round' },
  'Bitter Gourd':{ cat:'Vegetable', emoji:'🫑', temp:'10–12°C', humidity:'85–90%', freshDays:7, tips:'Store in cool and shaded area. Avoid direct sunlight.', harvestMonths:'Year-round' },
  'Pumpkin':     { cat:'Vegetable', emoji:'🎃', temp:'10–13°C', humidity:'60–70%', freshDays:60, tips:'Keep stem intact. Store in dry area with good ventilation.', harvestMonths:'Year-round' },
};

const SEED_USERS = [
  { id:'admin1', name:'Admin User',     email:'admin@harvest.bd', password:'admin123', role:'admin',     joined:'2026-01-01' },
  { id:'farm1',  name:'Rahim Uddin',    email:'rahim@farm.bd',    password:'pass123',  role:'farmer',    location:'Rajshahi', joined:'2026-01-05' },
  { id:'farm2',  name:'Sufia Begum',    email:'sufia@farm.bd',    password:'pass123',  role:'farmer',    location:'Mymensingh', joined:'2026-01-08' },
  { id:'trans1', name:'Karim Transport',email:'karim@trans.bd',   password:'pass123',  role:'transport', vehicle:'Refrigerated Truck', joined:'2026-01-10' },
  { id:'deal1',  name:'Dhaka Fresh Ltd',email:'dhaka@fresh.bd',   password:'pass123',  role:'dealer',    location:'Dhaka', joined:'2026-01-12' },
  { id:'deal2',  name:'Chittagong Grocers',email:'chittagong@fresh.bd',   password:'pass123',  role:'dealer',    location:'Chittagong', joined:'2026-02-18' },
];

const SEED_PRODUCTS = [
  { id:'p1', farmerId:'farm1', farmerName:'Rahim Uddin', name:'Mango', category:'Fruit', quantity:500, unit:'kg', harvestDate:'2026-01-20', location:'Rajshahi', status:'Available', listed:'2026-01-21', ...PRODUCE_DB['Mango'] },
  { id:'p2', farmerId:'farm2', farmerName:'Sufia Begum', name:'Tomato', category:'Vegetable', quantity:300, unit:'kg', harvestDate:'2026-01-22', location:'Mymensingh', status:'Available', listed:'2026-01-22', ...PRODUCE_DB['Tomato'] },
  { id:'p3', farmerId:'farm1', farmerName:'Rahim Uddin', name:'Potato', category:'Vegetable', quantity:1000, unit:'kg', harvestDate:'2026-01-15', location:'Rajshahi', status:'Available', listed:'2026-01-16', ...PRODUCE_DB['Potato'] },
];

const SEED_TRANS = [
  { id:'t1', farmerId:'farm1', farmerName:'Rahim Uddin', product:'Mango', productId:'p1', pickup:'Rajshahi', destination:'Dhaka', date:'2026-02-01', quantity:'500 kg', notes:'Refrigerated vehicle required', status:'Open', created:'2026-01-25' },
];

const SEED_DEALS = [
  { id:'d1', dealerId:'deal1', dealerName:'Dhaka Fresh Ltd', farmerId:'farm1', farmerName:'Rahim Uddin', product:'Mango', productId:'p1', quantity:'200 kg', price:'80', status:'Pending', created:'2026-01-26' },
];

const DEMO_MODE = window.DEMO_MODE_ENABLED === true || localStorage.getItem('demo_mode') === 'true';
const API_BASE = window.API_BASE || 'http://localhost:5000/api';

function today() { return new Date().toISOString().slice(0,10); }
function toId(value) { return value === null || value === undefined ? '' : String(value); }
function isDemoAllowed(role) { return DEMO_MODE === true && role === 'admin'; }
function isDemo() { return DEMO_MODE === true && state.user && state.user.role === 'admin'; }

function normUser(u)    { return { ...u, id: toId(u.id), vehicle: u.vehicle_type || u.vehicle || '', joined: (u.created_at || u.joined || '').slice(0,10) }; }
function normProduce(p) {
  const db = PRODUCE_DB[p.name] || {};
  return { ...p, id: toId(p.id), farmerId: toId(p.farmer_id || p.farmerId), farmerName: p.farmer_name || p.farmerName,
    harvestDate: p.harvest_date, temp: p.storage_temp||db.temp||'',
    humidity: p.storage_humidity||db.humidity||'', freshDays: p.fresh_days||db.freshDays||7,
    tips: p.storage_tips||db.tips||'', listed: (p.listed_at||'').slice(0,10),
    emoji: p.emoji||db.emoji||'*', category: p.category||db.cat||'Other',
    expectedPrice: p.expected_price_per_kg };
}

function normTrans(t)   { return { 
    ...t, 
    id: toId(t.id),
    farmerId: toId(t.farmer_id || t.farmerId), 
    farmerName: t.farmer_name || '-',
    product: t.produce_name || '-', 
    productId: toId(t.product_id || t.productId), 
    pickup: t.pickup_location || '-',
    date: t.pickup_date, 
    assignedTo: toId(t.assigned_to || t.assignedTo), 
    transporterName: t.transporter_name || '-',
    created: (t.created_at||'').slice(0,10) 
}; }
    
function normDeal(d)    { return { ...d, id: toId(d.id), dealerId: toId(d.dealer_id || d.dealerId), dealerName: d.dealer_name || d.dealerName,
    farmerId: toId(d.farmer_id || d.farmerId), farmerName: d.farmer_name || d.farmerName, product: d.produce_name || d.product,
    productId: toId(d.product_id || d.productId), quantity: d.quantity_requested || d.quantity, 
    expectedPrice: d.expected_price_per_kg, price: d.offered_price_per_kg,
    msg: d.message, created: (d.created_at||'').slice(0,10) }; }

function normFail(f)    { 
  let alts = [];
  try {
    if (typeof f.alternatives === 'string') {
      alts = JSON.parse(f.alternatives || '[]');
    } else if (Array.isArray(f.alternatives)) {
      alts = f.alternatives;
    }
  } catch (e) { alts = []; }
  return { ...f, id: toId(f.id), transporterId: toId(f.transporter_id || f.transporterId), transporterName: f.transporter_name || f.transporterName,
    requestId: toId(f.transport_request_id || f.requestId), product: f.produce_name || f.product,
    alternatives: alts,
    reported: (f.reported_at||'').slice(0,10) }; }