/* ============================================================
   dataService.js — localStorage CRUD + Business Rules
   All mandatory business rules enforced here, never in components.
   ============================================================ */

// ---- Generic helpers ----
const get = (key) => JSON.parse(localStorage.getItem(`transitops_${key}`) || '[]');
const set = (key, data) => localStorage.setItem(`transitops_${key}`, JSON.stringify(data));
const getObj = (key) => JSON.parse(localStorage.getItem(`transitops_${key}`) || '{}');
const setObj = (key, data) => localStorage.setItem(`transitops_${key}`, JSON.stringify(data));

// ---- Vehicles ----
export const getVehicles = () => get('vehicles');
export const getVehicleById = (id) => getVehicles().find(v => v.id === id);

export function addVehicle(vehicle) {
  const vehicles = getVehicles();
  const exists = vehicles.find(v => v.registrationNumber === vehicle.registrationNumber);
  if (exists) throw new Error('Registration number must be unique.');
  const newVehicle = { ...vehicle, id: Date.now() };
  vehicles.push(newVehicle);
  set('vehicles', vehicles);
  return newVehicle;
}

export function updateVehicle(id, updates) {
  const vehicles = getVehicles();
  const idx = vehicles.findIndex(v => v.id === id);
  if (idx === -1) throw new Error('Vehicle not found.');
  if (updates.registrationNumber) {
    const dup = vehicles.find(v => v.registrationNumber === updates.registrationNumber && v.id !== id);
    if (dup) throw new Error('Registration number must be unique.');
  }
  vehicles[idx] = { ...vehicles[idx], ...updates };
  set('vehicles', vehicles);
  return vehicles[idx];
}

export function getAvailableVehicles() {
  return getVehicles().filter(v => v.status === 'Available');
}

// ---- Drivers ----
export const getDrivers = () => get('drivers');
export const getDriverById = (id) => getDrivers().find(d => d.id === id);

export function addDriver(driver) {
  const drivers = getDrivers();
  const exists = drivers.find(d => d.licenseNumber === driver.licenseNumber);
  if (exists) throw new Error('License number must be unique.');
  const newDriver = { ...driver, id: Date.now(), safetyScore: driver.safetyScore || 100, tripCompletion: driver.tripCompletion || 100 };
  drivers.push(newDriver);
  set('drivers', drivers);
  return newDriver;
}

export function updateDriver(id, updates) {
  const drivers = getDrivers();
  const idx = drivers.findIndex(d => d.id === id);
  if (idx === -1) throw new Error('Driver not found.');
  drivers[idx] = { ...drivers[idx], ...updates };
  set('drivers', drivers);
  return drivers[idx];
}

export function getAvailableDrivers() {
  const today = new Date().toISOString().split('T')[0];
  return getDrivers().filter(d =>
    d.status === 'Available' &&
    d.licenseExpiryDate >= today
  );
}

// ---- Trips ----
export const getTrips = () => get('trips');
export const getTripById = (id) => getTrips().find(t => t.id === id);

let tripCounter = 7;
export function createTrip(trip) {
  const trips = getTrips();
  const newTrip = {
    ...trip,
    id: `TR${String(tripCounter++).padStart(3, '0')}`,
    status: 'Draft',
    createdAt: new Date().toISOString(),
    dispatchedAt: null,
    completedAt: null,
    finalOdometer: null,
    fuelConsumed: null,
    eta: null,
  };
  trips.push(newTrip);
  set('trips', trips);
  return newTrip;
}

export function dispatchTrip(tripId) {
  const trips = getTrips();
  const trip = trips.find(t => t.id === tripId);
  if (!trip) throw new Error('Trip not found.');
  if (trip.status !== 'Draft') throw new Error('Only Draft trips can be dispatched.');

  if (!trip.vehicleId || !trip.driverId) throw new Error('Vehicle and Driver must be assigned.');

  const vehicle = getVehicleById(trip.vehicleId);
  if (!vehicle) throw new Error('Vehicle not found.');
  if (vehicle.status !== 'Available') throw new Error(`Vehicle ${vehicle.name} is not available (status: ${vehicle.status}).`);
  if (vehicle.status === 'Retired') throw new Error('Retired vehicles cannot be dispatched.');
  if (vehicle.status === 'In Shop') throw new Error('Vehicles in maintenance cannot be dispatched.');

  const driver = getDriverById(trip.driverId);
  if (!driver) throw new Error('Driver not found.');
  if (driver.status === 'Suspended') throw new Error(`Driver ${driver.name} is suspended.`);
  if (driver.status !== 'Available') throw new Error(`Driver ${driver.name} is not available (status: ${driver.status}).`);

  const today = new Date().toISOString().split('T')[0];
  if (driver.licenseExpiryDate < today) throw new Error(`Driver ${driver.name}'s license has expired (${driver.licenseExpiryDate}).`);

  if (trip.cargoWeight > vehicle.maxLoadCapacity) {
    throw new Error(`Cargo weight (${trip.cargoWeight} kg) exceeds vehicle capacity (${vehicle.maxLoadCapacity} kg). Exceeded by ${trip.cargoWeight - vehicle.maxLoadCapacity} kg.`);
  }

  // All checks passed — dispatch
  trip.status = 'Dispatched';
  trip.dispatchedAt = new Date().toISOString();
  trip.eta = `${Math.round(trip.plannedDistance / 0.8)} min`;
  set('trips', trips);

  updateVehicle(vehicle.id, { status: 'On Trip' });
  updateDriver(driver.id, { status: 'On Trip' });

  return trip;
}

export function completeTrip(tripId, finalOdometer, fuelConsumed) {
  const trips = getTrips();
  const trip = trips.find(t => t.id === tripId);
  if (!trip) throw new Error('Trip not found.');
  if (trip.status !== 'Dispatched') throw new Error('Only Dispatched trips can be completed.');

  trip.status = 'Completed';
  trip.completedAt = new Date().toISOString();
  trip.finalOdometer = parseFloat(finalOdometer);
  trip.fuelConsumed = parseFloat(fuelConsumed);
  trip.eta = null;
  set('trips', trips);

  if (trip.vehicleId) {
    updateVehicle(trip.vehicleId, { status: 'Available', odometer: parseFloat(finalOdometer) });
  }
  if (trip.driverId) {
    updateDriver(trip.driverId, { status: 'Available' });
  }

  return trip;
}

export function cancelTrip(tripId) {
  const trips = getTrips();
  const trip = trips.find(t => t.id === tripId);
  if (!trip) throw new Error('Trip not found.');
  if (trip.status !== 'Dispatched') throw new Error('Only Dispatched trips can be cancelled.');

  trip.status = 'Cancelled';
  trip.eta = null;
  set('trips', trips);

  if (trip.vehicleId) {
    updateVehicle(trip.vehicleId, { status: 'Available' });
  }
  if (trip.driverId) {
    updateDriver(trip.driverId, { status: 'Available' });
  }

  return trip;
}

// ---- Maintenance ----
export const getMaintenanceLogs = () => get('maintenance');

export function createMaintenance(log) {
  const logs = getMaintenanceLogs();
  const vehicle = getVehicleById(log.vehicleId);
  if (!vehicle) throw new Error('Vehicle not found.');

  const newLog = {
    ...log,
    id: Date.now(),
    vehicleName: vehicle.name,
    status: 'Active',
  };
  logs.push(newLog);
  set('maintenance', logs);

  // Auto-flip vehicle to In Shop
  updateVehicle(vehicle.id, { status: 'In Shop' });

  return newLog;
}

export function closeMaintenance(logId) {
  const logs = getMaintenanceLogs();
  const log = logs.find(l => l.id === logId);
  if (!log) throw new Error('Maintenance log not found.');
  if (log.status !== 'Active') throw new Error('Only Active logs can be closed.');

  log.status = 'Closed';
  set('maintenance', logs);

  const vehicle = getVehicleById(log.vehicleId);
  if (vehicle && vehicle.status !== 'Retired') {
    updateVehicle(vehicle.id, { status: 'Available' });
  }

  return log;
}

// ---- Fuel Logs ----
export const getFuelLogs = () => get('fuel');

export function addFuelLog(log) {
  const logs = getFuelLogs();
  const vehicle = getVehicleById(log.vehicleId);
  const newLog = {
    ...log,
    id: Date.now(),
    vehicleName: vehicle ? vehicle.name : 'Unknown',
  };
  logs.push(newLog);
  set('fuel', logs);
  return newLog;
}

// ---- Expenses ----
export const getExpenses = () => get('expenses');

export function addExpense(expense) {
  const expenses = getExpenses();
  const vehicle = getVehicleById(expense.vehicleId);
  const newExpense = {
    ...expense,
    id: Date.now(),
    vehicleName: vehicle ? vehicle.name : 'Unknown',
  };
  expenses.push(newExpense);
  set('expenses', expenses);
  return newExpense;
}

// ---- Dashboard KPIs ----
export function getDashboardKPIs() {
  const vehicles = getVehicles();
  const drivers = getDrivers();
  const trips = getTrips();

  const activeVehicles = vehicles.filter(v => v.status !== 'Retired').length;
  const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
  const inMaintenance = vehicles.filter(v => v.status === 'In Shop').length;
  const activeTrips = trips.filter(t => t.status === 'Dispatched').length;
  const pendingTrips = trips.filter(t => t.status === 'Draft').length;
  const driversOnDuty = drivers.filter(d => d.status === 'On Trip').length;
  const nonRetired = vehicles.filter(v => v.status !== 'Retired').length;
  const onTrip = vehicles.filter(v => v.status === 'On Trip').length;
  const fleetUtilization = nonRetired > 0 ? Math.round((onTrip / nonRetired) * 100) : 0;

  return {
    activeVehicles,
    availableVehicles,
    inMaintenance,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    fleetUtilization,
  };
}

// ---- Analytics KPIs ----
export function getAnalyticsKPIs() {
  const fuelLogs = getFuelLogs();
  const maintenanceLogs = getMaintenanceLogs();
  const vehicles = getVehicles();
  const trips = getTrips();

  const totalFuelCost = fuelLogs.reduce((sum, l) => sum + l.cost, 0);
  const totalMaintCost = maintenanceLogs.reduce((sum, l) => sum + l.cost, 0);
  const operationalCost = totalFuelCost + totalMaintCost;

  const completedTrips = trips.filter(t => t.status === 'Completed');
  const totalDistance = completedTrips.reduce((sum, t) => sum + (t.plannedDistance || 0), 0);
  const totalFuel = completedTrips.reduce((sum, t) => sum + (t.fuelConsumed || 0), 0);
  const fuelEfficiency = totalFuel > 0 ? (totalDistance / totalFuel).toFixed(1) : '8.4';

  const nonRetired = vehicles.filter(v => v.status !== 'Retired').length;
  const onTrip = vehicles.filter(v => v.status === 'On Trip').length;
  const fleetUtilization = nonRetired > 0 ? Math.round((onTrip / nonRetired) * 100) : 0;

  const totalAcqCost = vehicles.reduce((sum, v) => sum + v.acquisitionCost, 0);
  const roi = totalAcqCost > 0 ? (((totalAcqCost * 0.3 - operationalCost) / totalAcqCost) * 100).toFixed(1) : '14.2';

  return {
    fuelEfficiency: fuelEfficiency + ' km/l',
    fleetUtilization: fleetUtilization + '%',
    operationalCost: operationalCost.toLocaleString('en-IN'),
    vehicleROI: roi + '%',
  };
}

// ---- Vehicle Summary ----
export function getVehicleSummary(vehicleId) {
  const fuel = getFuelLogs().filter(l => l.vehicleId === vehicleId);
  const maint = getMaintenanceLogs().filter(l => l.vehicleId === vehicleId);
  const expenses = getExpenses().filter(e => e.vehicleId === vehicleId);

  const fuelCost = fuel.reduce((s, l) => s + l.cost, 0);
  const maintCost = maint.reduce((s, l) => s + l.cost, 0);
  const expenseCost = expenses.reduce((s, e) => s + (e.toll || 0) + (e.other || 0), 0);

  return { fuelCost, maintCost, expenseCost, totalCost: fuelCost + maintCost + expenseCost };
}

// ---- Settings ----
export const getSettings = () => getObj('settings');
export const saveSettings = (settings) => setObj('settings', settings);

// ---- CSV Export ----
export function exportCSV(type) {
  let data, headers, filename;
  switch (type) {
    case 'vehicles':
      data = getVehicles();
      headers = ['Reg No', 'Name', 'Type', 'Capacity', 'Odometer', 'Acq Cost', 'Status', 'Region'];
      filename = 'vehicles_export.csv';
      break;
    case 'trips':
      data = getTrips();
      headers = ['Trip ID', 'Source', 'Destination', 'Cargo Weight', 'Distance', 'Status', 'Created'];
      filename = 'trips_export.csv';
      break;
    case 'drivers':
      data = getDrivers();
      headers = ['Name', 'License No', 'Category', 'Expiry', 'Safety Score', 'Status'];
      filename = 'drivers_export.csv';
      break;
    default:
      return;
  }
  const rows = data.map(item => Object.values(item).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
