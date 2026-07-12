/* Seed data matching the Excalidraw mockups exactly */

export const seedUsers = [
  { id: 1, name: 'Raven K.', email: 'raven.k@transitops.in', password: 'admin123', role: 'Dispatcher', initials: 'RK' },
  { id: 2, name: 'Arjun S.', email: 'arjun@transitops.in', password: 'admin123', role: 'Fleet Manager', initials: 'AS' },
  { id: 3, name: 'Meera P.', email: 'meera@transitops.in', password: 'admin123', role: 'Safety Officer', initials: 'MP' },
  { id: 4, name: 'Kavya R.', email: 'kavya@transitops.in', password: 'admin123', role: 'Financial Analyst', initials: 'KR' },
];

export const seedVehicles = [
  { id: 1, registrationNumber: 'GJ01AB4521', name: 'VAN-05', type: 'Van', maxLoadCapacity: 500, odometer: 74000, acquisitionCost: 620000, status: 'Available', region: 'Gujarat' },
  { id: 2, registrationNumber: 'GJ01AB9981', name: 'TRUCK-11', type: 'Truck', maxLoadCapacity: 5000, odometer: 182000, acquisitionCost: 2450000, status: 'On Trip', region: 'Gujarat' },
  { id: 3, registrationNumber: 'GJ01AB1120', name: 'MINI-03', type: 'Mini', maxLoadCapacity: 1000, odometer: 66000, acquisitionCost: 410000, status: 'In Shop', region: 'Gujarat' },
  { id: 4, registrationNumber: 'GJ01AB0081', name: 'VAN-04', type: 'Van', maxLoadCapacity: 750, odometer: 241900, acquisitionCost: 590000, status: 'Retired', region: 'Gujarat' },
  { id: 5, registrationNumber: 'MH02CD3345', name: 'TRUCK-07', type: 'Truck', maxLoadCapacity: 8000, odometer: 310000, acquisitionCost: 3200000, status: 'Available', region: 'Maharashtra' },
  { id: 6, registrationNumber: 'RJ14EF7890', name: 'VAN-09', type: 'Van', maxLoadCapacity: 600, odometer: 98000, acquisitionCost: 680000, status: 'Available', region: 'Rajasthan' },
  { id: 7, registrationNumber: 'GJ05GH1234', name: 'BIKE-01', type: 'Bike', maxLoadCapacity: 50, odometer: 23000, acquisitionCost: 95000, status: 'Available', region: 'Gujarat' },
  { id: 8, registrationNumber: 'MH04IJ5678', name: 'TRUCK-14', type: 'Truck', maxLoadCapacity: 10000, odometer: 450000, acquisitionCost: 4100000, status: 'On Trip', region: 'Maharashtra' },
];

export const seedDrivers = [
  { id: 1, name: 'Alex', licenseNumber: 'DL-88213', licenseCategory: 'LMV', licenseExpiryDate: '2028-12-15', contactNumber: '98765xxxxx', safetyScore: 96, status: 'Available', tripCompletion: 96 },
  { id: 2, name: 'John', licenseNumber: 'DL-44120', licenseCategory: 'HMV', licenseExpiryDate: '2025-03-10', contactNumber: '98220xxxxx', safetyScore: 81, status: 'Suspended', tripCompletion: 81 },
  { id: 3, name: 'Priya', licenseNumber: 'DL-77031', licenseCategory: 'LMV', licenseExpiryDate: '2027-08-20', contactNumber: '99110xxxxx', safetyScore: 99, status: 'On Trip', tripCompletion: 99 },
  { id: 4, name: 'Suresh', licenseNumber: 'DL-90045', licenseCategory: 'HMV', licenseExpiryDate: '2027-01-05', contactNumber: '97440xxxxx', safetyScore: 88, status: 'Available', tripCompletion: 88 },
  { id: 5, name: 'Deepak', licenseNumber: 'DL-55201', licenseCategory: 'HMV', licenseExpiryDate: '2028-06-30', contactNumber: '93320xxxxx', safetyScore: 92, status: 'Off Duty', tripCompletion: 92 },
  { id: 6, name: 'Ramesh', licenseNumber: 'DL-33089', licenseCategory: 'LMV', licenseExpiryDate: '2026-11-20', contactNumber: '98810xxxxx', safetyScore: 85, status: 'Available', tripCompletion: 85 },
];

export const seedTrips = [
  { id: 'TR001', source: 'Gandhinagar Depot', destination: 'Ahmedabad Hub', vehicleId: 1, driverId: 1, cargoWeight: 450, plannedDistance: 35, finalOdometer: null, fuelConsumed: null, status: 'Dispatched', createdAt: '2026-07-05T08:00:00', dispatchedAt: '2026-07-05T08:15:00', completedAt: null, eta: '45 min' },
  { id: 'TR002', source: 'Surat Warehouse', destination: 'Vadodara Depot', vehicleId: 2, driverId: 3, cargoWeight: 3200, plannedDistance: 160, finalOdometer: 182160, fuelConsumed: 28, status: 'Completed', createdAt: '2026-07-04T06:00:00', dispatchedAt: '2026-07-04T06:30:00', completedAt: '2026-07-04T10:00:00', eta: null },
  { id: 'TR003', source: 'Rajkot Hub', destination: 'Jamnagar Port', vehicleId: 5, driverId: 4, cargoWeight: 4500, plannedDistance: 95, finalOdometer: null, fuelConsumed: null, status: 'Dispatched', createdAt: '2026-07-05T09:00:00', dispatchedAt: '2026-07-05T09:20:00', completedAt: null, eta: '1h 10m' },
  { id: 'TR004', source: 'Vatva Industrial Area', destination: 'Sanand Warehouse', vehicleId: null, driverId: null, cargoWeight: 800, plannedDistance: 25, finalOdometer: null, fuelConsumed: null, status: 'Draft', createdAt: '2026-07-05T10:00:00', dispatchedAt: null, completedAt: null, eta: null },
  { id: 'TR005', source: 'Ahmedabad Central', destination: 'Gandhinagar Tech Park', vehicleId: 8, driverId: 6, cargoWeight: 200, plannedDistance: 28, finalOdometer: null, fuelConsumed: null, status: 'Dispatched', createdAt: '2026-07-05T07:30:00', dispatchedAt: '2026-07-05T07:45:00', completedAt: null, eta: '30 min' },
  { id: 'TR006', source: 'Mansa', destination: 'Kalol Depot', vehicleId: null, driverId: null, cargoWeight: 300, plannedDistance: 40, finalOdometer: null, fuelConsumed: null, status: 'Cancelled', createdAt: '2026-07-04T14:00:00', dispatchedAt: '2026-07-04T14:20:00', completedAt: null, eta: null },
];

export const seedMaintenanceLogs = [
  { id: 1, vehicleId: 1, vehicleName: 'VAN-05', description: 'Oil Change', cost: 2500, date: '2026-07-07', status: 'Active' },
  { id: 2, vehicleId: 2, vehicleName: 'TRUCK-11', description: 'Engine Repair', cost: 18000, date: '2026-07-03', status: 'Closed' },
  { id: 3, vehicleId: 3, vehicleName: 'MINI-03', description: 'Tyre Replace', cost: 6200, date: '2026-07-06', status: 'Active' },
];

export const seedFuelLogs = [
  { id: 1, vehicleId: 1, vehicleName: 'VAN-05', liters: 42, cost: 3150, date: '2026-07-05' },
  { id: 2, vehicleId: 2, vehicleName: 'TRUCK-11', liters: 110, cost: 8400, date: '2026-07-06' },
  { id: 3, vehicleId: 3, vehicleName: 'MINI-03', liters: 28, cost: 2050, date: '2026-07-06' },
  { id: 4, vehicleId: 5, vehicleName: 'TRUCK-07', liters: 95, cost: 7125, date: '2026-07-05' },
];

export const seedExpenses = [
  { id: 1, tripId: 'TR001', vehicleId: 1, vehicleName: 'VAN-05', toll: 120, other: 0, date: '2026-07-05' },
  { id: 2, tripId: 'TR002', vehicleId: 2, vehicleName: 'TRUCK-11', toll: 340, other: 150, date: '2026-07-04' },
  { id: 3, tripId: 'TR003', vehicleId: 5, vehicleName: 'TRUCK-07', toll: 180, other: 75, date: '2026-07-05' },
];

export const seedSettings = {
  depotName: 'Gandhinagar Depot GJ4',
  currency: 'INR (₹)',
  distanceUnit: 'Kilometers',
};

export function initializeData() {
  if (!localStorage.getItem('transitops_initialized')) {
    localStorage.setItem('transitops_users', JSON.stringify(seedUsers));
    localStorage.setItem('transitops_vehicles', JSON.stringify(seedVehicles));
    localStorage.setItem('transitops_drivers', JSON.stringify(seedDrivers));
    localStorage.setItem('transitops_trips', JSON.stringify(seedTrips));
    localStorage.setItem('transitops_maintenance', JSON.stringify(seedMaintenanceLogs));
    localStorage.setItem('transitops_fuel', JSON.stringify(seedFuelLogs));
    localStorage.setItem('transitops_expenses', JSON.stringify(seedExpenses));
    localStorage.setItem('transitops_settings', JSON.stringify(seedSettings));
    localStorage.setItem('transitops_initialized', 'true');
  }
}
