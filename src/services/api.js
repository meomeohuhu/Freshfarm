const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

async function apiRequest(endpoint, method = 'GET', data = null) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('freshfarm_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`Không thể phản hồi định dạng dữ liệu (HTTP ${response.status})`);
    }

    if (!response.ok) {
      throw new Error(json.error || json.message || 'Lỗi khi gọi API');
    }
    return json;
  } catch (err) {
    console.warn(`[API Call] Endpoint ${endpoint} warning:`, err.message);
    throw err;
  }
}

export const apiService = {
  // Auth & RBAC
  getUsers: () => apiRequest('/users'),
  toggleUserStatus: (userId, status) => apiRequest('/users/status', 'POST', { userId, status }),
  assignUserRole: (userId, role) => apiRequest('/users/role', 'POST', { userId, role }),
  login: (email, password) => apiRequest('/auth/login', 'POST', { email, password }),
  register: (userData) => apiRequest('/auth/register', 'POST', userData),
  getMe: () => apiRequest('/me'),

  // Products
  getProducts: () => apiRequest('/products'),
  createProduct: (product) => apiRequest('/products', 'POST', product),

  // Batches & Traceability
  getBatches: () => apiRequest('/batches'),
  createBatch: (batch) => apiRequest('/batches', 'POST', batch),
  approveBatch: (id) => apiRequest(`/batches/${id}/approve`, 'PUT'),
  getTraceability: (batchId) => apiRequest(`/traceability/${batchId}`),

  // Orders
  getOrders: () => apiRequest('/orders'),
  createOrder: (order) => apiRequest('/orders', 'POST', order),
  updateOrderStatus: (id, orderStatus, statusText) => apiRequest(`/orders/${id}/status`, 'PUT', { orderStatus, statusText }),
  cancelOrder: (id) => apiRequest(`/orders/${id}/status`, 'PUT', { orderStatus: 'Cancelled', statusText: 'Đơn hàng đã bị hủy bởi Khách hàng' }),

  // Shipping
  getShippingBills: () => apiRequest('/shipping'),
  createShippingBill: (bill) => apiRequest('/shipping', 'POST', bill),
  updateShippingStatus: (id, status) => apiRequest(`/shipping/${id}/status`, 'PUT', { status }),

  // Promotions & Vouchers
  getPromotions: () => apiRequest('/promotions'),
  validatePromotion: (code, orderAmount) => apiRequest('/promotions/validate', 'POST', { code, orderAmount }),

  // SQL Console (Read-Only Enforced)
  executeSqlQuery: (sql) => apiRequest('/db/query', 'POST', { sql }),
};
