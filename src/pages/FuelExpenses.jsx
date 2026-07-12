import { useState, useEffect } from 'react';
import Modal from '../components/Modal.jsx';
import { useToast } from '../components/Toast.jsx';
import {
  apiGetFuelLogs, apiCreateFuelLog,
  apiGetExpenses, apiCreateExpense,
  apiGetVehicles, apiGetMaintenance, apiExportCSV
} from '../api/api.js';

export default function FuelExpenses() {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [maintLogs, setMaintLogs] = useState([]);
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const { addToast, ToastContainer } = useToast();

  const today = new Date().toISOString().split('T')[0];
  const [fuelForm, setFuelForm] = useState({ vehicle_id: '', liters: '', cost: '', date: today });
  const [expenseForm, setExpenseForm] = useState({ trip_id: '', vehicle_id: '', toll: '', other: '', date: today });

  useEffect(() => { reload(); }, []);
  async function reload() {
    try {
      const [f, e, v, m] = await Promise.all([apiGetFuelLogs(), apiGetExpenses(), apiGetVehicles(), apiGetMaintenance()]);
      setFuelLogs(f); setExpenses(e); setVehicles(v); setMaintLogs(m);
    } catch (err) { addToast(err.message, 'error'); }
  }

  async function handleAddFuel(e) {
    e.preventDefault();
    try {
      await apiCreateFuelLog({ vehicle_id: parseInt(fuelForm.vehicle_id), liters: parseFloat(fuelForm.liters), cost: parseFloat(fuelForm.cost), date: fuelForm.date });
      addToast('Fuel log added');
      setShowFuelModal(false);
      setFuelForm({ vehicle_id: '', liters: '', cost: '', date: today });
      reload();
    } catch (err) { addToast(err.message, 'error'); }
  }

  async function handleAddExpense(e) {
    e.preventDefault();
    try {
      await apiCreateExpense({ trip_id: expenseForm.trip_id, vehicle_id: parseInt(expenseForm.vehicle_id), toll: parseFloat(expenseForm.toll) || 0, other: parseFloat(expenseForm.other) || 0, date: expenseForm.date });
      addToast('Expense added');
      setShowExpenseModal(false);
      setExpenseForm({ trip_id: '', vehicle_id: '', toll: '', other: '', date: today });
      reload();
    } catch (err) { addToast(err.message, 'error'); }
  }

  const totalFuelCost = fuelLogs.reduce((s, l) => s + l.cost, 0);
  const totalMaintCost = maintLogs.reduce((s, l) => s + l.cost, 0);
  const totalOpCost = totalFuelCost + totalMaintCost;

  function getMaintCostForVehicle(vehicleId) {
    return maintLogs.filter(m => m.vehicle_id === vehicleId).reduce((s, m) => s + m.cost, 0);
  }

  return (
    <div className="page-content">
      <ToastContainer />

      {/* Fuel Logs */}
      <div style={{ marginBottom: '32px' }}>
        <div className="page-header">
          <h3 className="panel-title" style={{ margin: 0 }}>Fuel Logs</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" onClick={() => setShowFuelModal(true)}>+ Log Fuel</button>
            <button className="btn btn-success" onClick={() => setShowExpenseModal(true)}>+ Add Expense</button>
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>Vehicle</th><th>Date</th><th>Liters</th><th>Fuel Cost</th></tr></thead>
            <tbody>
              {fuelLogs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 500 }}>{log.vehicle_name}</td>
                  <td>{log.date}</td>
                  <td>{log.liters} L</td>
                  <td>₹{Number(log.cost).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Other Expenses */}
      <div style={{ marginBottom: '32px' }}>
        <h3 className="panel-title">Other Expenses (Toll / Misc)</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>Trip</th><th>Vehicle</th><th>Toll</th><th>Other</th><th>Maint. (Linked)</th></tr></thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp.id}>
                  <td style={{ fontWeight: 500 }}>{exp.trip_id}</td>
                  <td>{exp.vehicle_name}</td>
                  <td>₹{Number(exp.toll || 0).toLocaleString('en-IN')}</td>
                  <td>₹{Number(exp.other || 0).toLocaleString('en-IN')}</td>
                  <td>₹{getMaintCostForVehicle(exp.vehicle_id).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total Operational Cost */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)' }}>
        <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Total Operational Cost (Fuel + Maintenance)</span>
        <span style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--success)' }}>₹{totalOpCost.toLocaleString('en-IN')}</span>
      </div>

      {/* Fuel Modal */}
      {showFuelModal && (
        <Modal title="Log Fuel" onClose={() => setShowFuelModal(false)}>
          <form onSubmit={handleAddFuel}>
            <div className="form-group"><label className="form-label">Vehicle</label>
              <select value={fuelForm.vehicle_id} onChange={e => setFuelForm({ ...fuelForm, vehicle_id: e.target.value })} required>
                <option value="">Select vehicle...</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select></div>
            <div className="form-group"><label className="form-label">Liters</label>
              <input type="number" value={fuelForm.liters} onChange={e => setFuelForm({ ...fuelForm, liters: e.target.value })} required /></div>
            <div className="form-group"><label className="form-label">Cost (₹)</label>
              <input type="number" value={fuelForm.cost} onChange={e => setFuelForm({ ...fuelForm, cost: e.target.value })} required /></div>
            <div className="form-group"><label className="form-label">Date</label>
              <input type="date" value={fuelForm.date} onChange={e => setFuelForm({ ...fuelForm, date: e.target.value })} required /></div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Fuel Log</button>
          </form>
        </Modal>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <Modal title="Add Expense" onClose={() => setShowExpenseModal(false)}>
          <form onSubmit={handleAddExpense}>
            <div className="form-group"><label className="form-label">Trip ID</label>
              <input value={expenseForm.trip_id} onChange={e => setExpenseForm({ ...expenseForm, trip_id: e.target.value })} placeholder="TR001" /></div>
            <div className="form-group"><label className="form-label">Vehicle</label>
              <select value={expenseForm.vehicle_id} onChange={e => setExpenseForm({ ...expenseForm, vehicle_id: e.target.value })} required>
                <option value="">Select vehicle...</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select></div>
            <div className="form-group"><label className="form-label">Toll (₹)</label>
              <input type="number" value={expenseForm.toll} onChange={e => setExpenseForm({ ...expenseForm, toll: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Other (₹)</label>
              <input type="number" value={expenseForm.other} onChange={e => setExpenseForm({ ...expenseForm, other: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Date</label>
              <input type="date" value={expenseForm.date} onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })} required /></div>
            <button type="submit" className="btn btn-success" style={{ width: '100%' }}>Add Expense</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
