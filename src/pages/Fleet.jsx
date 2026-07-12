import { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge.jsx';
import Modal from '../components/Modal.jsx';
import { useToast } from '../components/Toast.jsx';
import { apiGetVehicles, apiCreateVehicle, apiUpdateVehicle } from '../api/api.js';

export default function Fleet() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchReg, setSearchReg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const { addToast, ToastContainer } = useToast();

  const [form, setForm] = useState({
    registration_number: '', name: '', type: 'Van',
    max_load_capacity: '', odometer: '', acquisition_cost: '',
    status: 'Available', region: 'Gujarat'
  });

  useEffect(() => { reload(); }, []);

  async function reload() {
    setLoading(true);
    try { setVehicles(await apiGetVehicles()); }
    catch (err) { addToast(err.message, 'error'); }
    finally { setLoading(false); }
  }

  let filtered = vehicles;
  if (filterType !== 'All') filtered = filtered.filter(v => v.type === filterType);
  if (filterStatus !== 'All') filtered = filtered.filter(v => v.status === filterStatus);
  if (searchReg) filtered = filtered.filter(v =>
    v.registration_number.toLowerCase().includes(searchReg.toLowerCase()) ||
    v.name.toLowerCase().includes(searchReg.toLowerCase())
  );

  function openAdd() {
    setEditVehicle(null);
    setForm({ registration_number: '', name: '', type: 'Van', max_load_capacity: '', odometer: '', acquisition_cost: '', status: 'Available', region: 'Gujarat' });
    setShowModal(true);
  }
  function openEdit(v) {
    setEditVehicle(v);
    setForm({ ...v, max_load_capacity: String(v.max_load_capacity), odometer: String(v.odometer), acquisition_cost: String(v.acquisition_cost) });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    const plateRegex = /^[A-Z]{2}[ -]?[0-9]{1,2}[ -]?[A-Z]{1,2}[ -]?[0-9]{3,4}$/i;
    if (!plateRegex.test(form.registration_number)) {
      addToast('Invalid Registration Number format. Expected e.g. MH 12 AB 1234', 'error');
      return;
    }
    try {
      const data = { ...form, max_load_capacity: parseFloat(form.max_load_capacity), odometer: parseFloat(form.odometer), acquisition_cost: parseFloat(form.acquisition_cost) };
      if (editVehicle) {
        await apiUpdateVehicle(editVehicle.id, data);
        addToast('Vehicle updated successfully');
      } else {
        await apiCreateVehicle(data);
        addToast('Vehicle added successfully');
      }
      setShowModal(false);
      reload();
    } catch (err) { addToast(err.message, 'error'); }
  }

  return (
    <div className="page-content">
      <ToastContainer />
      <div className="page-header">
        <div className="filters-row" style={{ marginBottom: 0 }}>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="All">Type: All</option>
            <option>Truck</option><option>Van</option><option>Mini</option><option>Bike</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">Status: All</option>
            <option>Available</option><option>On Trip</option><option>In Shop</option><option>Retired</option>
          </select>
          <input type="text" placeholder="Search reg. no..." value={searchReg} onChange={e => setSearchReg(e.target.value)} style={{ minWidth: '180px' }} />
        </div>
        <button className="btn btn-success" id="add-vehicle-btn" onClick={openAdd}>+ Add Vehicle</button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', padding: '40px', textAlign: 'center' }}>Loading vehicles...</div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reg. No. (Unique)</th><th>Name/Model</th><th>Type</th><th>Capacity</th>
                <th>Odometer</th><th>Acq. Cost</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{v.registration_number}</td>
                  <td style={{ fontWeight: 500 }}>{v.name}</td>
                  <td>{v.type}</td>
                  <td>{v.type === 'Truck' ? `${(v.max_load_capacity/1000).toFixed(0)} Ton` : `${v.max_load_capacity} kg`}</td>
                  <td>{Number(v.odometer).toLocaleString('en-IN')}</td>
                  <td>₹{Number(v.acquisition_cost).toLocaleString('en-IN')}</td>
                  <td><StatusBadge status={v.status} /></td>
                  <td><button className="btn btn-outline btn-sm" onClick={() => openEdit(v)}>Edit</button></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>No vehicles found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}


      {showModal && (
        <Modal title={editVehicle ? 'Edit Vehicle' : 'Add Vehicle'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave}>
            {[
              ['registration_number', 'Registration Number', 'text'],
              ['name', 'Name / Model', 'text'],
              ['max_load_capacity', 'Max Load Capacity (kg)', 'number'],
              ['odometer', 'Odometer (km)', 'number'],
              ['acquisition_cost', 'Acquisition Cost (₹)', 'number'],
            ].map(([key, label, type]) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option>Truck</option><option>Van</option><option>Mini</option><option>Bike</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Region</label>
              <select value={form.region} onChange={e => setForm({ ...form, region: e.target.value })}>
                <option>Andhra Pradesh</option><option>Arunachal Pradesh</option><option>Assam</option><option>Bihar</option><option>Chhattisgarh</option><option>Goa</option><option>Gujarat</option><option>Haryana</option><option>Himachal Pradesh</option><option>Jharkhand</option><option>Karnataka</option><option>Kerala</option><option>Madhya Pradesh</option><option>Maharashtra</option><option>Manipur</option><option>Meghalaya</option><option>Mizoram</option><option>Nagaland</option><option>Odisha</option><option>Punjab</option><option>Rajasthan</option><option>Sikkim</option><option>Tamil Nadu</option><option>Telangana</option><option>Tripura</option><option>Uttar Pradesh</option><option>Uttarakhand</option><option>West Bengal</option><option>Andaman and Nicobar</option><option>Chandigarh</option><option>Dadra and Nagar Haveli</option><option>Lakshadweep</option><option>Delhi</option><option>Puducherry</option><option>Ladakh</option><option>Jammu and Kashmir</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option>Available</option><option>On Trip</option><option>In Shop</option><option>Retired</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              {editVehicle ? 'Update Vehicle' : 'Add Vehicle'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
