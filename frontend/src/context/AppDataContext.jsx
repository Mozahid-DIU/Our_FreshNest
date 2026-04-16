import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { normUser, normProduce, normTrans, normDeal, normFail, normAlternative, normProposal } from '../utils/normalizers';
import { getUsers } from '../api/users';
import { getProduce, addProduce, deleteProduce as apiDeleteProduce, updateProduceStatus } from '../api/produce';
import { getTransport, createTransport, updateTransportStatus } from '../api/transport';
import { getDeals, createDeal, respondDeal } from '../api/deals';
import { getFailures, reportFailure, getFailureAlternatives, createFailureAlternative, decideFailureAlternative, acceptFailureAlternative } from '../api/failures';
import { getProposals, createProposal as apiCreateProposal, updateProposal as apiUpdateProposal } from '../api/proposals';

const AppDataContext = createContext(null);

const initialState = {
  users: [],
  products: [],
  transport: [],
  deals: [],
  failures: [],
  alternatives: [],
  proposals: [],
  loading: false,
  error: null,
};

function dataReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_DATA':
      return { ...state, ...action.payload, loading: false };
    case 'MERGE_DATA':
      return { ...state, ...action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'UPDATE_PRODUCTS':
      return { ...state, products: action.payload };
    case 'UPDATE_TRANSPORT':
      return { ...state, transport: action.payload };
    case 'UPDATE_DEALS':
      return { ...state, deals: action.payload };
    case 'UPDATE_FAILURES':
      return { ...state, failures: action.payload };
    case 'UPDATE_ALTERNATIVES':
      return { ...state, alternatives: action.payload };
    case 'UPDATE_PROPOSALS':
      return { ...state, proposals: action.payload };
    default:
      return state;
  }
}

export function AppDataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const { token, user } = useAuth();

  const transportStatusToApi = {
    pending: 'Open',
    open: 'Open',
    accepted: 'Accepted',
    completed: 'Completed',
    cancelled: 'Cancelled',
    failed: 'Failed',
  };

  const dealStatusToApi = {
    accepted: 'Accepted',
    declined: 'Declined',
  };

  const produceStatusToApi = {
    available: 'Available',
    reserved: 'Reserved',
    sold: 'Sold',
    expired: 'Expired',
  };

  const normalizeProduceCategory = (category) => {
    const value = String(category || '').trim().toLowerCase();
    if (value === 'fruit' || value === 'fruits') return 'Fruit';
    if (value.includes('vegetable') || value === 'legume') return 'Vegetable';
    return 'Other';
  };

  const loadAllData = useCallback(async () => {
    if (!token || !user) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const usersRequest = user.role === 'admin' ? getUsers() : Promise.resolve({ data: { data: [] } });
      const [usersRes, produceRes, transportRes, dealsRes, failuresRes, alternativesRes, proposalsRes] = await Promise.allSettled([
        usersRequest,
        getProduce(),
        getTransport(),
        getDeals(),
        getFailures(),
        getFailureAlternatives(),
        getProposals(),
      ]);

      const readData = (result) => {
        if (!result || result.status !== 'fulfilled') return [];
        return result.value?.data?.data || [];
      };

      const rejected = [usersRes, produceRes, transportRes, dealsRes, failuresRes, alternativesRes, proposalsRes]
        .filter((result) => result.status === 'rejected')
        .map((result) => result.reason?.response?.data?.error || result.reason?.message || 'Unknown load error');

      const payload = {
        error: rejected.length ? `Some data failed to load: ${rejected[0]}` : null,
      };

      if (usersRes.status === 'fulfilled') payload.users = readData(usersRes).map(normUser);
      if (produceRes.status === 'fulfilled') payload.products = readData(produceRes).map(normProduce);
      if (transportRes.status === 'fulfilled') payload.transport = readData(transportRes).map(normTrans);
      if (dealsRes.status === 'fulfilled') payload.deals = readData(dealsRes).map(normDeal);
      if (failuresRes.status === 'fulfilled') payload.failures = readData(failuresRes).map(normFail);
      if (alternativesRes.status === 'fulfilled') payload.alternatives = readData(alternativesRes).map(normAlternative);
      if (proposalsRes.status === 'fulfilled') payload.proposals = readData(proposalsRes).map(normProposal);

      dispatch({
        type: 'MERGE_DATA',
        payload,
      });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e?.response?.data?.error || e.message || 'Failed to load app data.' });
    }
  }, [token, user]);

  const addProduct = async (product) => {
    const imageUrls = Array.isArray(product.imageUrls)
      ? product.imageUrls.filter(Boolean)
      : product.imageUrl
        ? [product.imageUrl]
        : [];

    const payload = {
      name: product.name,
      category: normalizeProduceCategory(product.category),
      quantity: Number(product.quantity),
      unit: product.unit || 'kg',
      harvest_date: product.harvestDate || new Date().toISOString().split('T')[0],
      location: product.location || user?.location || 'Unknown',
      storage_temp: product.storageTemp || '',
      storage_humidity: product.storageHumidity || '',
      fresh_days: Number(product.freshDays || 0),
      storage_tips: product.storageTips || '',
      short_description: product.shortDescription || '',
      expected_price_per_kg: Number(product.price || 0),
      image_url: imageUrls[0] || null,
      image_urls: imageUrls,
    };
    await addProduce(payload);
    await loadAllData();
  };

  const updateProduct = async (id, updates) => {
    if (updates?.status) {
      const status = produceStatusToApi[String(updates.status).toLowerCase()] || updates.status;
      await updateProduceStatus(id, status);
      await loadAllData();
      return;
    }

    dispatch({
      type: 'UPDATE_PRODUCTS',
      payload: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  };

  const deleteProduct = async (id) => {
    await apiDeleteProduce(id);
    await loadAllData();
  };

  const addTransport = async (trans) => {
    const payload = {
      product_id: trans.produceId,
      produce_name: trans.produceName,
      contact_phone: trans.contactPhone || user?.phone || '',
      dealer_id: trans.dealerId || null,
      dealer_name: trans.dealerName || '',
      dealer_phone: trans.dealerPhone || '',
      dealer_location: trans.dealerLocation || '',
      pickup_location: trans.fromLocation,
      destination: trans.toLocation,
      pickup_date: trans.pickupDate || null,
      quantity: trans.quantity ? String(trans.quantity) : '',
      notes: trans.notes || trans.description || '',
    };
    await createTransport(payload);
    await loadAllData();
  };

  const updateTransport = async (id, updates) => {
    if (!updates?.status) return;
    const status = transportStatusToApi[String(updates.status).toLowerCase()] || updates.status;
    await updateTransportStatus(id, status);
    await loadAllData();
  };

  const addDeal = async (deal) => {
    const payload = {
      farmer_id: deal.farmerId,
      farmer_name: deal.farmerName,
      product_id: deal.produceId,
      produce_name: deal.produceName,
      quantity_requested: deal.quantity ? `${deal.quantity}` : '',
      offered_price_per_kg: Number(deal.price),
      message: deal.message || '',
    };
    await createDeal(payload);
    await loadAllData();
  };

  const updateDeal = async (id, updates) => {
    if (!updates?.status) return;
    const status = dealStatusToApi[String(updates.status).toLowerCase()] || updates.status;
    await respondDeal(id, status);
    await loadAllData();
  };

  const addFailure = async (failure) => {
    const payload = {
      transport_request_id: failure.transportRequestId || failure.transportId,
      produce_name: failure.produceName || '',
      route: failure.route || '',
      reason: failure.reason,
      notes: failure.notes || '',
      alternatives: failure.alternatives || [],
    };
    const response = await reportFailure(payload);
    await loadAllData();
    return response?.data?.data || null;
  };

  const addAlternativeRequest = async (failureId, alternative) => {
    const payload = {
      quantity: alternative.quantity,
      current_location: alternative.currentLocation,
      fruit_type: alternative.fruitType,
      pickup_date: alternative.pickupDate,
      preferred_dealer_location: alternative.preferredDealerLocation,
      notes: alternative.notes || '',
    };
    await createFailureAlternative(failureId, payload);
    await loadAllData();
  };

  const decideAlternativeRequest = async (alternativeId, decision) => {
    const payload = {
      action: decision.action,
      new_price_per_kg: decision.newPricePerKg || null,
      notes: decision.notes || '',
    };
    await decideFailureAlternative(alternativeId, payload);
    await loadAllData();
  };

  const acceptAlternativeRequest = async (alternativeId) => {
    await acceptFailureAlternative(alternativeId);
    await loadAllData();
  };

  const addProposal = async (proposal) => {
    const payload = {
      current_location: proposal.currentLocation,
      fruit_type: proposal.fruitType,
      harvest_date: proposal.harvestDate,
      preferred_dealer_location: proposal.preferredDealerLocation,
      notes: proposal.notes || '',
    };
    await apiCreateProposal(payload);
    await loadAllData();
  };

  const updateProposal = async (id, updates) => {
    await apiUpdateProposal(id, updates);
    await loadAllData();
  };

  const logout = () => {
    dispatch({ type: 'SET_DATA', payload: { users: [], products: [], transport: [], deals: [], failures: [], alternatives: [], proposals: [] } });
  };

  useEffect(() => {
    if (token && user) {
      loadAllData();
      return;
    }
    logout();
  }, [token, user, loadAllData]);

  return (
    <AppDataContext.Provider value={{
      ...state,
      loadAllData,
      logout,
      addProduct,
      updateProduct,
      deleteProduct,
      addTransport,
      updateTransport,
      addDeal,
      updateDeal,
      addFailure,
      addAlternativeRequest,
      decideAlternativeRequest,
      acceptAlternativeRequest,
      addProposal,
      updateProposal,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used within AppDataProvider');
  return context;
};