import { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge.jsx';
import { useToast } from '../components/Toast.jsx';
import { apiGetMaintenance, apiCreateMaintenance, apiCloseMaintenance, apiGetVehicles } from '../api/api.js';

export default function Maintenance() {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const { addToast, ToastContainer } = useToast();
  const [form, setForm] = useState({ vehicle_id: '', description: '', cost: '', date: new Date().toISOString().split('T')[0] });

  useEffect(() => { reload(); }, []);
  async function reload() {
    try {
      const [m, v] = await Promise.all([apiGetMaintenance(), apiGetVehicles()]);
      setLogs(m); setVehicles(v);
    } catch (err) { addToast(err.message, 'error'); }
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      await apiCreateMaintenance({ vehicle_id: parseInt(form.vehicle_id), description: form.description, cost: parseFloat(form.cost), date: form.date });
      addToast('Maintenance record created. Vehicle moved to In Shop.');
      setForm({ vehicle_id: '', description: '', cost: '', date: new Date().toISOString().split('T')[0] });
      reload();
    } catch (err) { addToast(err.message, 'error'); }
  }

  async function handleClose(logId) {
    try {
      await apiCloseMaintenance(logId);
      addToast('Maintenance closed. Vehicle restored to Available.');
      reload();
    } catch (err) { addToast(err.message, 'error'); }
  }

  return (
    <div className="page-content">
      <ToastContainer />
      <div className="split-layout">
        <div>
          <div className="panel">
            <div className="panel-title">Log Service Record</div>
            <form onSubmit={handleSave}>
              <div className="form-group"><label className="form-label">Vehicle</label>
                <select value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })} required>
                  <option value="">Select vehicle...</option>
                  {vehicles.filter(v => v.status !== 'Retired').map(v => <option key={v.id} value={v.id}>{v.name} ({v.status})</option>)}
                </select></div>
              <div className="form-group"><label className="form-label">Service Type</label>
                <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Oil Change" required /></div>
              <div className="form-group"><label className="form-label">Cost (₹)</label>
                <input type="number" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} placeholder="2500" required /></div>
              <div className="form-group"><label className="form-label">Date</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required /></div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save</button>
            </form>


          </div>
        </div>
        <div>
          <div className="panel-title">Service Log</div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead><tr><th>Vehicle</th><th>Service</th><th>Cost</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 500 }}>{log.vehicle_name}</td>
                    <td>{log.description}</td>
                    <td>₹{Number(log.cost).toLocaleString('en-IN')}</td>
                    <td><StatusBadge status={log.status === 'Active' ? 'In Shop' : 'Completed'} /></td>
                    <td>{log.status === 'Active' && <button className="btn btn-success btn-sm" onClick={() => handleClose(log.id)}>Close</button>}</td>
                  </tr>
                ))}
                {logs.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>No maintenance records.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
