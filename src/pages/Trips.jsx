import { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge.jsx';
import Modal from '../components/Modal.jsx';
import { useToast } from '../components/Toast.jsx';
import {
  apiGetTrips, apiCreateTrip, apiDispatchTrip,
  apiCompleteTrip, apiCancelTrip, apiGetAvailableVehicles, apiGetAvailableDrivers
} from '../api/api.js';

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [availVehicles, setAvailVehicles] = useState([]);
  const [availDrivers, setAvailDrivers] = useState([]);
  const [error, setError] = useState('');
  const [showComplete, setShowComplete] = useState(null);
  const [completeForm, setCompleteForm] = useState({ final_odometer: '', fuel_consumed: '' });
  const [showDispatch, setShowDispatch] = useState(null);
  const [dispatchForm, setDispatchForm] = useState({ vehicle_id: '', driver_id: '' });
  const [submitting, setSubmitting] = useState(false);
  const { addToast, ToastContainer } = useToast();

  const [form, setForm] = useState({
    source: '', destination: '', vehicle_id: '', driver_id: '', cargo_weight: '', planned_distance: ''
  });

  useEffect(() => { reload(); }, []);

  async function reload() {
    try {
      const [tr, vh, dr] = await Promise.all([apiGetTrips(), apiGetAvailableVehicles(), apiGetAvailableDrivers()]);
      setTrips(tr);
      setAvailVehicles(vh);
      setAvailDrivers(dr);
      setError('');
    } catch (err) { addToast(err.message, 'error'); }
  }

  const selectedVehicle = availVehicles.find(v => v.id === parseInt(form.vehicle_id));
  const cargoExceeded = selectedVehicle && form.cargo_weight && parseFloat(form.cargo_weight) > selectedVehicle.max_load_capacity;

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        source: form.source,
        destination: form.destination,
        vehicle_id: form.vehicle_id ? parseInt(form.vehicle_id) : null,
        driver_id: form.driver_id ? parseInt(form.driver_id) : null,
        cargo_weight: parseFloat(form.cargo_weight) || 0,
        planned_distance: parseFloat(form.planned_distance) || 0,
      };
      const trip = await apiCreateTrip(payload);
      if (payload.vehicle_id && payload.driver_id && !cargoExceeded) {
        try {
          await apiDispatchTrip(trip.trip_id);
          addToast(`Trip ${trip.trip_id} created & dispatched!`);
        } catch (err) {
          setError(err.message);
          addToast(err.message, 'error');
        }
      } else {
        addToast(`Trip ${trip.trip_id} created as Draft`);
      }
      setForm({ source: '', destination: '', vehicle_id: '', driver_id: '', cargo_weight: '', planned_distance: '' });
      reload();
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally { setSubmitting(false); }
  }

  async function handleDispatch(tripId, payload = null) {
    try {
      await apiDispatchTrip(tripId, payload);
      addToast(`Trip ${tripId} dispatched!`);
      if (showDispatch) setShowDispatch(null);
      reload();
    } catch (err) { addToast(err.message, 'error'); }
  }

  function openDispatch(trip) {
    if (!trip.vehicle_id || !trip.driver_id) {
      setShowDispatch(trip.trip_id);
      setDispatchForm({ vehicle_id: trip.vehicle_id || '', driver_id: trip.driver_id || '' });
    } else {
      handleDispatch(trip.trip_id);
    }
  }

  async function handleComplete(tripId) {
    try {
      await apiCompleteTrip(tripId, { final_odometer: parseFloat(completeForm.final_odometer), fuel_consumed: parseFloat(completeForm.fuel_consumed) });
      addToast(`Trip ${tripId} completed!`);
      setShowComplete(null);
      setCompleteForm({ final_odometer: '', fuel_consumed: '' });
      reload();
    } catch (err) { addToast(err.message, 'error'); }
  }

  async function handleCancel(tripId) {
    try {
      await apiCancelTrip(tripId);
      addToast(`Trip ${tripId} cancelled.`);
      reload();
    } catch (err) { addToast(err.message, 'error'); }
  }

  const stepOrder = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];

  return (
    <div className="page-content">
      <ToastContainer />
      <div className="split-layout">
        {/* Left: Create + Stepper */}
        <div>
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Trip Lifecycle</span>
            <div className="trip-stepper" style={{ marginTop: '12px' }}>
              {stepOrder.map((step, i) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className={`trip-step ${i <= 1 ? (i === 0 ? 'completed' : 'active') : ''}`}>
                    <div className="trip-step-dot" />
                    <span>{step}</span>
                  </div>
                  {i < stepOrder.length - 1 && <div className="trip-step-line" />}
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-title">Create Trip</div>
            <form onSubmit={handleCreate}>
              <div className="form-group"><label className="form-label">Source</label>
                <input value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="Gandhinagar Depot" required /></div>
              <div className="form-group"><label className="form-label">Destination</label>
                <input value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} placeholder="Ahmedabad Hub" required /></div>
              <div className="form-group"><label className="form-label">Vehicle (Available Only)</label>
                <select value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })}>
                  <option value="">Select vehicle...</option>
                  {availVehicles.map(v => <option key={v.id} value={v.id}>{v.name} – {v.max_load_capacity} kg</option>)}
                </select></div>
              <div className="form-group"><label className="form-label">Driver (Available Only)</label>
                <select value={form.driver_id} onChange={e => setForm({ ...form, driver_id: e.target.value })}>
                  <option value="">Select driver...</option>
                  {availDrivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select></div>
              <div className="form-group"><label className="form-label">Cargo Weight (kg)</label>
                <input type="number" value={form.cargo_weight} onChange={e => setForm({ ...form, cargo_weight: e.target.value })} placeholder="450" required /></div>
              <div className="form-group"><label className="form-label">Planned Distance (km)</label>
                <input type="number" value={form.planned_distance} onChange={e => setForm({ ...form, planned_distance: e.target.value })} placeholder="35" required /></div>

              {cargoExceeded && (
                <div className="validation-error">
                  <strong>Capacity: {selectedVehicle.max_load_capacity} kg</strong>
                  Cargo: {form.cargo_weight} kg — ✕ Exceeded by {parseFloat(form.cargo_weight) - selectedVehicle.max_load_capacity} kg
                </div>
              )}
              {error && !cargoExceeded && <div className="validation-error"><strong>Error</strong>{error}</div>}

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={cargoExceeded || submitting}>
                  {submitting ? 'Dispatching...' : cargoExceeded ? 'Dispatch (blocked)' : 'Dispatch'}
                </button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setForm({ source: '', destination: '', vehicle_id: '', driver_id: '', cargo_weight: '', planned_distance: '' })}>Clear</button>
              </div>
            </form>
          </div>

        </div>

        {/* Right: Live Board */}
        <div>
          <div className="panel-title">Live Board</div>
          <div className="live-board">
            {trips.map(trip => (
              <div className="trip-card" key={trip.id}>
                <div className="trip-card-header">
                  <span className="trip-card-id">{trip.trip_id}</span>
                  <span className="trip-card-meta">{trip.vehicle_name || '—'} / {trip.driver_name || '—'}</span>
                </div>
                <div className="trip-card-route">{trip.source} → {trip.destination}</div>
                <div className="trip-card-footer">
                  <StatusBadge status={trip.status} />
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    {trip.status === 'Draft' && !trip.driver_id ? 'Awaiting driver' : trip.eta || ''}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  {trip.status === 'Draft' && (
                    <button className="btn btn-info btn-sm" onClick={() => openDispatch(trip)}>Dispatch</button>
                  )}
                  {trip.status === 'Dispatched' && (
                    <>
                      <button className="btn btn-success btn-sm" onClick={() => { setShowComplete(trip.trip_id); setCompleteForm({ final_odometer: '', fuel_consumed: '' }); }}>Complete</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleCancel(trip.trip_id)}>Cancel</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showComplete && (
        <Modal title={`Complete Trip ${showComplete}`} onClose={() => setShowComplete(null)}>
          <div className="form-group"><label className="form-label">Final Odometer (km)</label>
            <input type="number" value={completeForm.final_odometer} onChange={e => setCompleteForm({ ...completeForm, final_odometer: e.target.value })} required /></div>
          <div className="form-group"><label className="form-label">Fuel Consumed (liters)</label>
            <input type="number" value={completeForm.fuel_consumed} onChange={e => setCompleteForm({ ...completeForm, fuel_consumed: e.target.value })} required /></div>
          <button className="btn btn-success" style={{ width: '100%' }} onClick={() => handleComplete(showComplete)}>Mark as Completed</button>
        </Modal>
      )}

      {showDispatch && (
        <Modal title={`Dispatch Trip ${showDispatch}`} onClose={() => setShowDispatch(null)}>
          <div className="form-group"><label className="form-label">Vehicle (Available Only)</label>
            <select value={dispatchForm.vehicle_id} onChange={e => setDispatchForm({ ...dispatchForm, vehicle_id: e.target.value })}>
              <option value="">Select vehicle...</option>
              {availVehicles.map(v => <option key={v.id} value={v.id}>{v.name} – {v.max_load_capacity} kg</option>)}
            </select></div>
          <div className="form-group"><label className="form-label">Driver (Available Only)</label>
            <select value={dispatchForm.driver_id} onChange={e => setDispatchForm({ ...dispatchForm, driver_id: e.target.value })}>
              <option value="">Select driver...</option>
              {availDrivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select></div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={!dispatchForm.vehicle_id || !dispatchForm.driver_id} onClick={() => handleDispatch(showDispatch, { vehicle_id: parseInt(dispatchForm.vehicle_id), driver_id: parseInt(dispatchForm.driver_id) })}>Dispatch Now</button>
        </Modal>
      )}
    </div>
  );
}
