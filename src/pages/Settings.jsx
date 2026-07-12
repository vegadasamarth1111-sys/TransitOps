import { useState, useEffect } from 'react';
import { useToast } from '../components/Toast.jsx';
import { apiGetSettings, apiUpdateSettings } from '../api/api.js';

export default function Settings() {
  const [settings, setSettings] = useState({ depot_name: '', currency: '', distance_unit: '' });
  const { addToast, ToastContainer } = useToast();

  useEffect(() => {
    apiGetSettings().then(s => setSettings(s)).catch(err => addToast(err.message, 'error'));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    try {
      await apiUpdateSettings(settings);
      addToast('Settings saved successfully');
    } catch (err) { addToast(err.message, 'error'); }
  }

  const rbacData = [
    { role: 'Fleet Manager',     fleet: '✓', drivers: '✓',    trips: '—',    fuelExp: '—', analytics: '✓' },
    { role: 'Dispatcher',        fleet: 'view', drivers: '—', trips: '✓',    fuelExp: '—', analytics: '—' },
    { role: 'Safety Officer',    fleet: '—', drivers: '✓',    trips: 'view', fuelExp: '—', analytics: '—' },
    { role: 'Financial Analyst', fleet: 'view', drivers: '—', trips: '—',    fuelExp: '✓', analytics: '✓' },
  ];

  function cell(v) {
    if (v === '✓')    return <span className="rbac-check">✓</span>;
    if (v === 'view') return <span className="rbac-view">view</span>;
    return <span className="rbac-none">—</span>;
  }

  return (
    <div className="page-content">
      <ToastContainer />
      <div className="split-layout">
        <div>
          <div className="panel">
            <div className="panel-title">General</div>
            <form onSubmit={handleSave}>
              <div className="form-group"><label className="form-label">Depot Name</label>
                <input value={settings.depot_name} onChange={e => setSettings({ ...settings, depot_name: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Currency</label>
                <input value={settings.currency} onChange={e => setSettings({ ...settings, currency: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Distance Unit</label>
                <input value={settings.distance_unit} onChange={e => setSettings({ ...settings, distance_unit: e.target.value })} /></div>
              <button type="submit" className="btn btn-info" style={{ marginTop: '8px' }}>Save changes</button>
            </form>
          </div>
        </div>
        <div>
          <div className="panel-title">Role-Based Access (RBAC)</div>
          <div className="data-table-wrapper">
            <table className="rbac-table">
              <thead><tr><th>Role</th><th>Fleet</th><th>Drivers</th><th>Trips</th><th>Fuel/Exp.</th><th>Analytics</th></tr></thead>
              <tbody>
                {rbacData.map(row => (
                  <tr key={row.role}>
                    <td style={{ fontWeight: 600 }}>{row.role}</td>
                    <td>{cell(row.fleet)}</td><td>{cell(row.drivers)}</td>
                    <td>{cell(row.trips)}</td><td>{cell(row.fuelExp)}</td>
                    <td>{cell(row.analytics)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
