/* ============================================================
   api.js — Frontend API client for TransitOps FastAPI backend
   ============================================================ */

const API_BASE = 'http://127.0.0.1:8000'; // Target the uvicorn backend directly

function getToken() {
  return localStorage.getItem('transitops_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('transitops_token');
    localStorage.removeItem('transitops_currentUser');
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || 'Request failed');
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('text/csv') || ct.includes('application/octet-stream')) {
    return res.blob();
  }
  return res.json();
}

// ---- Auth ----
export async function apiLogin(email, password) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem('transitops_token', data.access_token);
  return data; // { access_token, user }
}

export async function apiSignup(name, email, password, role) {
  const data = await request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role }),
  });
  localStorage.setItem('transitops_token', data.access_token);
  return data;
}

export async function apiGetMe() {
  return request('/api/auth/me');
}

export function apiLogout() {
  localStorage.removeItem('transitops_token');
  localStorage.removeItem('transitops_currentUser');
}

// ---- Vehicles ----
export async function apiGetVehicles(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/api/vehicles${query ? '?' + query : ''}`);
}

export async function apiGetAvailableVehicles() {
  return request('/api/vehicles/available');
}

export async function apiCreateVehicle(data) {
  return request('/api/vehicles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateVehicle(id, data) {
  return request(`/api/vehicles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function apiGetVehicleSummary(id) {
  return request(`/api/vehicles/${id}/summary`);
}

// ---- Drivers ----
export async function apiGetDrivers() {
  return request('/api/drivers');
}

export async function apiGetAvailableDrivers() {
  return request('/api/drivers/available');
}

export async function apiCreateDriver(data) {
  return request('/api/drivers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateDriver(id, data) {
  return request(`/api/drivers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ---- Trips ----
export async function apiGetTrips() {
  return request('/api/trips');
}

export async function apiCreateTrip(data) {
  return request('/api/trips', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiDispatchTrip(tripId, payload) {
  return request(`/api/trips/${tripId}/dispatch`, { 
    method: 'POST',
    ...(payload && { body: JSON.stringify(payload) })
  });
}

export async function apiCompleteTrip(tripId, data) {
  return request(`/api/trips/${tripId}/complete`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiCancelTrip(tripId) {
  return request(`/api/trips/${tripId}/cancel`, { method: 'POST' });
}

// ---- Maintenance ----
export async function apiGetMaintenance() {
  return request('/api/maintenance');
}

export async function apiCreateMaintenance(data) {
  return request('/api/maintenance', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiCloseMaintenance(logId) {
  return request(`/api/maintenance/${logId}/close`, { method: 'POST' });
}

// ---- Fuel Logs ----
export async function apiGetFuelLogs() {
  return request('/api/fuel-logs');
}

export async function apiCreateFuelLog(data) {
  return request('/api/fuel-logs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ---- Expenses ----
export async function apiGetExpenses() {
  return request('/api/expenses');
}

export async function apiCreateExpense(data) {
  return request('/api/expenses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ---- Dashboard ----
export async function apiGetDashboard() {
  return request('/api/dashboard');
}

// ---- Analytics ----
export async function apiGetAnalytics() {
  return request('/api/analytics');
}

export async function apiExportCSV() {
  return request('/api/analytics/export', { headers: { Accept: 'text/csv' } });
}

// ---- Settings ----
export async function apiGetSettings() {
  return request('/api/settings');
}

export async function apiUpdateSettings(data) {
  return request('/api/settings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}