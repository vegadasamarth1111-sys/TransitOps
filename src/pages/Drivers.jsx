import { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge.jsx';
import Modal from '../components/Modal.jsx';
import { useToast } from '../components/Toast.jsx';
import { apiGetDrivers, apiCreateDriver, apiUpdateDriver } from '../api/api.js';

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDriver, setEditDriver] = useState(null);
  const { addToast, ToastContainer } = useToast();

  const [form, setForm] = useState({
    name: '', license_number: '', license_category: 'LMV',
    license_expiry_date: '', contact_number: '', status: 'Available'
  });

  useEffect(() => { reload(); }, []);
  async function reload() {
    setLoading(true);
    try { setDrivers(await apiGetDrivers()); }
    catch (err) { addToast(err.message, 'error'); }
    finally { setLoading(false); }
  }

  function openAdd() {
    setEditDriver(null);
    setForm({ name: '', license_number: '', license_category: 'LMV', license_expiry_date: '', contact_number: '', status: 'Available' });
    setShowModal(true);
  }
  function openEdit(d) {
    setEditDriver(d);
    setForm({ name: d.name, license_number: d.license_number, license_category: d.license_category, license_expiry_date: d.license_expiry_date, contact_number: d.contact_number, status: d.status });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      if (editDriver) {
        await apiUpdateDriver(editDriver.id, form);
        addToast('Driver updated successfully');
      } else {
        await apiCreateDriver(form);
        addToast('Driver added successfully');
      }
      setShowModal(false);
      reload();
    } catch (err) { addToast(err.message, 'error'); }
  }

  async function handleStatusToggle(driver, newStatus) {
    try {
      await apiUpdateDriver(driver.id, { status: newStatus });
      addToast(`${driver.name} status → ${newStatus}`);
      reload();
    } catch (err) { addToast(err.message, 'error'); }
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page-content">
      <ToastContainer />
      <div className="page-header">
        <div />
        <button className="btn btn-success" onClick={openAdd}>+ Add Driver</button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', padding: '40px', textAlign: 'center' }}>Loading drivers...</div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Driver</th><th>License No.</th><th>Category</th>
                <th>Expiry</th><th>Contact</th><th>Trip Compl.</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map(d => {
                const expired = d.license_expiry_date < today;
                const maskedContact = d.contact_number ? d.contact_number.slice(0, 5) + 'xxxxx' : '';
                return (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 500 }}>{d.name}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{d.license_number}</td>
                    <td>{d.license_category}</td>
                    <td style={{ color: expired ? 'var(--danger)' : 'var(--text-primary)' }}>
                      {d.license_expiry_date?.split('-').reverse().join('/')}{expired ? ' ⚠️ EXPIRED' : ''}
                    </td>
                    <td>{maskedContact}</td>
                    <td>{d.trip_completion}%</td>
                    <td><StatusBadge status={d.status} /></td>
                    <td style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(d)}>Edit</button>
                      {d.status === 'Suspended'
                        ? <button className="btn btn-sm" style={{ background: 'var(--success)', color: '#fff', border: 'none' }} onClick={() => handleStatusToggle(d, 'Available')}>Reinstate</button>
                        : <button className="btn btn-sm" style={{ background: 'var(--danger)', color: '#fff', border: 'none' }} onClick={() => handleStatusToggle(d, 'Suspended')}>Suspend</button>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}



      {showModal && (
        <Modal title={editDriver ? 'Edit Driver' : 'Add Driver'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave}>
            <div className="form-group"><label className="form-label">Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="form-group"><label className="form-label">License Number</label>
              <input value={form.license_number} onChange={e => setForm({ ...form, license_number: e.target.value })} required /></div>
            <div className="form-group"><label className="form-label">License Category</label>
              <select value={form.license_category} onChange={e => setForm({ ...form, license_category: e.target.value })}>
                <option>LMV</option><option>HMV</option>
              </select></div>
            <div className="form-group"><label className="form-label">License Expiry Date</label>
              <input type="date" value={form.license_expiry_date} onChange={e => setForm({ ...form, license_expiry_date: e.target.value })} required /></div>
            <div className="form-group"><label className="form-label">Contact Number</label>
              <input value={form.contact_number} onChange={e => setForm({ ...form, contact_number: e.target.value })} required /></div>
            <div className="form-group"><label className="form-label">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option>Available</option><option>On Trip</option><option>Off Duty</option><option>Suspended</option>
              </select></div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              {editDriver ? 'Update Driver' : 'Add Driver'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
