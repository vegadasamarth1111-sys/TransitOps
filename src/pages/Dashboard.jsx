import { useState, useEffect } from 'react';
import KPICard from '../components/KPICard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { apiGetDashboard, apiGetTrips, apiGetVehicles } from '../api/api.js';

export default function Dashboard() {
  const [kpis, setKpis] = useState({});
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterRegion, setFilterRegion] = useState('All');

  useEffect(() => {
    Promise.all([apiGetDashboard(), apiGetTrips(), apiGetVehicles()])
      .then(([dash, tr, vh]) => {
        setKpis(dash);
        setTrips(tr);
        setVehicles(vh);
      })
      .finally(() => setLoading(false));
  }, []);

  const recentTrips = trips.slice(0, 5);
  const vehicleStatuses = {
    Available: vehicles.filter(v => v.status === 'Available').length,
    'On Trip': vehicles.filter(v => v.status === 'On Trip').length,
    'In Shop': vehicles.filter(v => v.status === 'In Shop').length,
    Retired:   vehicles.filter(v => v.status === 'Retired').length,
  };
  const maxStatus = Math.max(...Object.values(vehicleStatuses), 1);
  const statusColors = {
    Available: 'var(--success)', 'On Trip': 'var(--info)',
    'In Shop': 'var(--warning)', Retired: 'var(--danger)',
  };

  if (loading) return <div className="page-content" style={{ color: 'var(--text-muted)', padding: '40px' }}>Loading dashboard...</div>;

  return (
    <div className="page-content">
      {/* Filters */}
      <div className="filters-row">
        <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Filters</span>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option>All</option><option>Truck</option><option>Van</option><option>Mini</option><option>Bike</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option>All</option><option>Available</option><option>On Trip</option><option>In Shop</option><option>Retired</option>
        </select>
        <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)}>
          <option>All</option><option>Gujarat</option><option>Maharashtra</option><option>Rajasthan</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard label="Active Vehicles"         value={String(kpis.active_vehicles    ?? 0).padStart(2,'0')} accentColor="var(--info)"    />
        <KPICard label="Available Vehicles"      value={String(kpis.available_vehicles ?? 0).padStart(2,'0')} accentColor="var(--success)"  />
        <KPICard label="Vehicles in Maintenance" value={String(kpis.in_maintenance     ?? 0).padStart(2,'0')} accentColor="var(--warning)"  />
        <KPICard label="Active Trips"            value={String(kpis.active_trips       ?? 0).padStart(2,'0')} accentColor="var(--info)"    />
        <KPICard label="Pending Trips"           value={String(kpis.pending_trips      ?? 0).padStart(2,'0')} accentColor="var(--accent)"   />
        <KPICard label="Drivers on Duty"         value={String(kpis.drivers_on_duty    ?? 0).padStart(2,'0')} accentColor="var(--completed)"/>
        <KPICard label="Fleet Utilization"       value={`${kpis.fleet_utilization ?? 0}%`}                    accentColor="var(--success)"  />
      </div>

      <div className="dashboard-grid">
        {/* Recent Trips */}
        <div>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--text-heading)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Recent Trips</h3>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Trip</th><th>Vehicle</th><th>Driver</th><th>Status</th><th>ETA</th></tr>
              </thead>
              <tbody>
                {recentTrips.map(trip => (
                  <tr key={trip.id}>
                    <td style={{ fontWeight: 600 }}>{trip.trip_id}</td>
                    <td>{trip.vehicle_name || '—'}</td>
                    <td>{trip.driver_name  || '—'}</td>
                    <td><StatusBadge status={trip.status} /></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{trip.eta || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle Status */}
        <div>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--text-heading)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Vehicle Status</h3>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            {Object.entries(vehicleStatuses).map(([status, count]) => (
              <div className="status-bar" key={status}>
                <span className="status-bar-label">{status}</span>
                <div className="status-bar-track">
                  <div className="status-bar-fill" style={{ width: `${(count / maxStatus) * 100}%`, background: statusColors[status] }} />
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '20px', textAlign: 'right' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
