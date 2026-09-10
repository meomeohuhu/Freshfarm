const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function apiRequest(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (data) {
      options.body = JSON.stringify(data);
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.error || 'Lỗi khi gọi API');
    }
    return json;
  } catch (err) {
    console.warn(`[API Fallback] Endpoint ${endpoint} warning:`, err.message);
    throw err;
  }
}

export const apiService = {
  // Auth & RBAC
  getUsers: () => apiRequest('/users'),
  toggleUserStatus: (userId, status) => apiRequest('/users/status', 'POST', { userId, status }),
  login: (email, password) => apiRequest('/auth/login', 'POST', { email, password }),
  register: (userData) => apiRequest('/auth/register', 'POST', userData),

  // Products
  getProducts: () => apiRequest('/products'),
  createProduct: (product) => apiRequest('/products', 'POST', product),

  // Batches
  getBatches: () => apiRequest('/batches'),
  createBatch: (batch) => apiRequest('/batches', 'POST', batch),

  // Orders
  getOrders: () => apiRequest('/orders'),
  createOrder: (order) => apiRequest('/orders', 'POST', order),
  updateOrderStatus: (id, orderStatus, statusText) => apiRequest(`/orders/${id}/status`, 'PUT', { orderStatus, statusText }),

  // Shipping
  getShippingBills: () => apiRequest('/shipping'),
  createShippingBill: (bill) => apiRequest('/shipping', 'POST', bill),

  // Promotions
  getPromotions: () => apiRequest('/promotions'),
  validatePromotion: (code, orderAmount) => apiRequest('/promotions/validate', 'POST', { code, orderAmount }),

  // SQL Console
  executeSqlQuery: (sql) => apiRequest('/db/query', 'POST', { sql }),
};
