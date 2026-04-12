export const normUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  role: user.role,
  location: user.location || null,
  vehicleType: user.vehicle_type || null,
  createdAt: user.created_at || user.createdAt,
});

function parseImageUrls(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 3);
  }

  const text = String(value).trim();
  if (!text) return [];

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 3);
    }
  } catch (_err) {
    // Fallback to a single string value.
  }

  return [text];
}

export const normProduce = (p) => ({
  id: p.id,
  farmerId: p.farmer_id,
  farmerName: p.farmer_name || null,
  farmerLocation: p.farmer_location || null,
  farmerPhone: p.farmer_phone || '',
  name: p.name,
  quantity: Number(p.quantity),
  soldQuantity: Number(p.sold_quantity || 0),
  availableQuantity: Number(p.available_quantity ?? Math.max(Number(p.quantity || 0) - Number(p.sold_quantity || 0), 0)),
  unit: p.unit,
  price: Number(p.expected_price_per_kg ?? p.price ?? 0),
  status: String(p.status || 'Available').toLowerCase(),
  category: p.category,
  imageUrl: p.image_url || parseImageUrls(p.image_urls)[0] || null,
  imageUrls: parseImageUrls(p.image_urls || p.image_url),
  harvestDate: p.harvest_date || null,
  location: p.location || null,
  storageTemp: p.storage_temp || null,
  storageHumidity: p.storage_humidity || null,
  freshDays: p.fresh_days ?? null,
  shortDescription: p.short_description || '',
  storageTips: p.storage_tips || null,
  listedAt: p.listed_at || null,
  createdAt: p.created_at || p.listed_at || p.createdAt,
});

export const normTrans = (t) => ({
  id: t.id,
  produceId: t.product_id,
  farmerId: t.farmer_id,
  farmerName: t.farmer_name || null,
  farmerLocation: t.farmer_location || null,
  farmerPhone: t.farmer_phone || '',
  transportId: t.assigned_to,
  transportName: t.transporter_name || null,
  transporterLocation: t.transporter_location || null,
  transporterPhone: t.transporter_phone || '',
  dealerId: t.dealer_id || null,
  dealerName: t.dealer_name || null,
  dealerPhone: t.dealer_phone || '',
  dealerLocation: t.dealer_location || null,
  contactPhone: t.contact_phone || '',
  fromLocation: t.pickup_location,
  toLocation: t.destination,
  produceName: t.produce_name || null,
  quantity: t.quantity || null,
  notes: t.notes || '',
  pickupDate: t.pickup_date || null,
  status: String(t.status || 'open').toLowerCase() === 'open' ? 'pending' : String(t.status || 'open').toLowerCase(),
  createdAt: t.created_at || t.createdAt,
});

export const normDeal = (d) => ({
  id: d.id,
  produceId: d.product_id,
  dealerId: d.dealer_id,
  dealerName: d.dealer_name || null,
  dealerLocation: d.dealer_location || null,
  dealerPhone: d.dealer_phone || '',
  farmerId: d.farmer_id,
  farmerName: d.farmer_name || null,
  farmerLocation: d.farmer_location || null,
  farmerPhone: d.farmer_phone || '',
  produceName: d.produce_name || null,
  quantity: d.quantity_requested || '',
  price: Number(d.offered_price_per_kg || 0),
  message: d.message,
  status: String(d.status || 'pending').toLowerCase(),
  respondedAt: d.responded_at || null,
  createdAt: d.created_at || d.createdAt,
});

export const normFail = (f) => ({
  id: f.id,
  transportId: f.transporter_id,
  transportRequestId: f.transport_request_id,
  produceName: f.produce_name || null,
  route: f.route || null,
  reason: f.reason,
  notes: f.notes || '',
  reportedAt: f.reported_at || f.created_at || f.reportedAt,
});

export const normAlternative = (a) => ({
  id: a.id,
  failureId: a.failure_id,
  sourceTransportRequestId: a.source_transport_request_id,
  generatedTransportRequestId: a.generated_transport_request_id || null,
  productId: a.product_id || null,
  produceName: a.produce_name || '',
  quantity: Number(a.quantity || 0),
  farmerId: a.farmer_id,
  farmerName: a.farmer_name || '',
  dealerId: a.dealer_id || null,
  dealerName: a.dealer_name || '',
  dealerPhone: a.dealer_phone || '',
  dealerLocation: a.dealer_location || '',
  transporterId: a.transporter_id,
  transporterName: a.transporter_name || '',
  currentLocation: a.current_location || '',
  fruitType: a.fruit_type || '',
  pickupDate: a.pickup_date || null,
  preferredDealerLocation: a.preferred_dealer_location || '',
  requestedPricePerKg: a.requested_price_per_kg === null || a.requested_price_per_kg === undefined ? null : Number(a.requested_price_per_kg),
  proposedPricePerKg: a.proposed_price_per_kg === null || a.proposed_price_per_kg === undefined ? null : Number(a.proposed_price_per_kg),
  finalPricePerKg: a.final_price_per_kg === null || a.final_price_per_kg === undefined ? null : Number(a.final_price_per_kg),
  decisionNotes: a.decision_notes || '',
  status: String(a.status || 'PendingFarmerDecision').toLowerCase(),
  createdAt: a.created_at || a.createdAt,
  updatedAt: a.updated_at || a.updatedAt,
});

export const normProposal = (p) => ({
  id: p.id,
  transportProviderId: p.transport_provider_id,
  transportProviderName: p.transport_provider_name || null,
  transportProviderLocation: p.transport_provider_location || null,
  transportProviderPhone: p.transport_provider_phone || '',
  currentLocation: p.current_location || null,
  fruitType: p.fruit_type || null,
  harvestDate: p.harvest_date || null,
  preferredDealerLocation: p.preferred_dealer_location || null,
  notes: p.notes || '',
  farmerId: p.farmer_id || null,
  farmerName: p.farmer_name || null,
  farmerLocation: p.farmer_location || null,
  farmerPhone: p.farmer_phone || '',
  farmerPrice: p.farmer_price === null || p.farmer_price === undefined ? null : Number(p.farmer_price),
  adminNotes: p.admin_notes || '',
  routeFrom: p.route_from || p.current_location || null,
  routeTo: p.route_to || p.preferred_dealer_location || null,
  status: String(p.status || 'pendingreview').toLowerCase(),
  publishedAt: p.published_at || null,
  expiresAt: p.expires_at || null,
  convertedAt: p.converted_at || null,
  convertedDealerId: p.converted_dealer_id || null,
  convertedDealerName: p.converted_dealer_name || null,
  convertedDealerLocation: p.converted_dealer_location || null,
  convertedDealerPhone: p.converted_dealer_phone || '',
  createdAt: p.created_at || p.createdAt,
  updatedAt: p.updated_at || p.updatedAt,
});