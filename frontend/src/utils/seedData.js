export const SEED_USERS = [
  { id: 1, name: 'Admin User', email: 'admin@harvest.bd', password: 'admin123', role: 'admin', location: 'Dhaka', created_at: '2025-01-01' },
  { id: 2, name: 'Rahim Khan', email: 'rahim@farmer.bd', password: 'pass123', role: 'farmer', location: 'Rajshahi', created_at: '2025-02-15' },
  { id: 3, name: 'Karim Transport', email: 'karim@transport.bd', password: 'pass123', role: 'transport', vehicle_type: 'Refrigerated Truck', created_at: '2025-03-01' },
  { id: 4, name: 'Bengal Dealers', email: 'dealer@bengal.bd', password: 'pass123', role: 'dealer', location: 'Chittagong', created_at: '2025-03-10' },
  { id: 5, name: 'Fatema Begum', email: 'fatema@farmer.bd', password: 'pass123', role: 'farmer', location: 'Sylhet', created_at: '2025-04-01' },
  { id: 6, name: 'Rapid Delivery', email: 'rapid@transport.bd', password: 'pass123', role: 'transport', vehicle_type: 'Pickup Van', created_at: '2025-04-15' },
];

export const SEED_PRODUCTS = [
  { id: 1, farmer_id: 2, name: 'Potato', quantity: 500, unit: 'kg', price: 25, status: 'available', category: 'Root Vegetable', created_at: '2025-05-01' },
  { id: 2, farmer_id: 2, name: 'Onion', quantity: 300, unit: 'kg', price: 45, status: 'available', category: 'Root Vegetable', created_at: '2025-05-02' },
  { id: 3, farmer_id: 2, name: 'Tomato', quantity: 200, unit: 'kg', price: 60, status: 'available', category: 'Vegetable', created_at: '2025-05-03' },
  { id: 4, farmer_id: 5, name: 'Mango', quantity: 1000, unit: 'kg', price: 80, status: 'available', category: 'Fruit', created_at: '2025-05-04' },
  { id: 5, farmer_id: 5, name: 'Banana', quantity: 500, unit: 'kg', price: 30, status: 'available', category: 'Fruit', created_at: '2025-05-05' },
];

export const SEED_TRANSPORT = [
  { id: 1, produce_id: 1, farmer_id: 2, transport_id: 3, from_location: 'Rajshahi', to_location: 'Dhaka', status: 'pending', created_at: '2025-05-06' },
  { id: 2, produce_id: 4, farmer_id: 5, transport_id: null, from_location: 'Sylhet', to_location: 'Chittagong', status: 'pending', created_at: '2025-05-07' },
  { id: 3, produce_id: 2, farmer_id: 2, transport_id: 3, from_location: 'Rajshahi', to_location: 'Chittagong', status: 'accepted', created_at: '2025-05-08' },
  { id: 4, produce_id: 5, farmer_id: 5, transport_id: 6, from_location: 'Sylhet', to_location: 'Dhaka', status: 'completed', created_at: '2025-05-09' },
];

export const SEED_DEALS = [
  { id: 1, produce_id: 1, dealer_id: 4, farmer_id: 2, quantity: 300, price: 28, message: 'Interested in bulk purchase', status: 'pending', created_at: '2025-05-10' },
  { id: 2, produce_id: 4, dealer_id: 4, farmer_id: 5, quantity: 800, price: 85, message: 'Can offer 85 per kg for full lot', status: 'accepted', created_at: '2025-05-11' },
  { id: 3, produce_id: 3, dealer_id: 4, farmer_id: 2, quantity: 150, price: 55, message: 'Need quick delivery', status: 'declined', created_at: '2025-05-12' },
];

export const SEED_FAILURES = [
  { id: 1, transport_id: 3, produce_id: 2, reason: 'Vehicle breakdown on highway', reported_at: '2025-05-13' },
];