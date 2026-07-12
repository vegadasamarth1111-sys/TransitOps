import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import KPICard from '../components/KPICard.jsx';
import { apiGetAnalytics, apiGetFuelLogs, apiGetMaintenance, apiGetVehicles, apiExportCSV, apiGetTrips } from '../api/api.js';

export default function Analytics() {
  const [kpis, setKpis] = useState({});
  const [vehicles, setVehicles] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [maintLogs, setMaintLogs] = useState([]);
  const [trips, setTrips] = useState([]);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    Promise.all([apiGetAnalytics(), apiGetVehicles(), apiGetFuelLogs(), apiGetMaintenance(), apiGetTrips()])
      .then(([k, v, f, m, t]) => { setKpis(k); setVehicles(v); setFuelLogs(f); setMaintLogs(m); setTrips(t); });
    setTimeout(() => setAnimated(true), 150);
  }, []);

  const getMonthYear = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const d = new Date(dateStr);
    return `${d.toLocaleString('default', { month: 'short' })} '${d.getFullYear().toString().slice(-2)}`;
  };

  const monthlyCostsMap = {};
  fuelLogs.forEach(f => {
    const mo = getMonthYear(f.date);
    if (!monthlyCostsMap[mo]) monthlyCostsMap[mo] = { month: mo, fuel: 0, maintenance: 0 };
    monthlyCostsMap[mo].fuel += f.cost;
  });
  maintLogs.forEach(m => {
    const mo = getMonthYear(m.date);
    if (!monthlyCostsMap[mo]) monthlyCostsMap[mo] = { month: mo, fuel: 0, maintenance: 0 };
    monthlyCostsMap[mo].maintenance += m.cost;
  });

  const monthlyCostsData = Object.values(monthlyCostsMap).sort((a, b) => {
    const dateA = new Date("01 " + a.month.replace("'", "20"));
    const dateB = new Date("01 " + b.month.replace("'", "20"));
    return dateA - dateB;
  });

  const tripStatuses = trips.reduce((acc, trip) => {
    acc[trip.status] = (acc[trip.status] || 0) + 1;
    return acc;
  }, {});
  const tripStatusData = Object.keys(tripStatuses).map(status => ({ name: status, value: tripStatuses[status] }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const vehicleCosts = vehicles.map(v => {
    const fuelCost = fuelLogs.filter(f => f.vehicle_id === v.id).reduce((s, f) => s + f.cost, 0);
    const maintCost = maintLogs.filter(m => m.vehicle_id === v.id).reduce((s, m) => s + m.cost, 0);
    return { name: v.name, totalCost: fuelCost + maintCost };
  }).filter(v => v.totalCost > 0).sort((a, b) => b.totalCost - a.totalCost).slice(0, 5);

  const maxCost = Math.max(...vehicleCosts.map(v => v.totalCost), 1);
  const costColors = ['var(--danger)', 'var(--warning)', 'var(--info)', 'var(--success)', 'var(--accent)'];

  return (
    <div className="page-content">
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <KPICard label="Fuel Efficiency"    value={kpis.fuel_efficiency    || '—'} accentColor="var(--info)"    />
        <KPICard label="Fleet Utilization"  value={kpis.fleet_utilization  || '—'} accentColor="var(--success)"  />
        <KPICard label="Operational Cost"   value={kpis.operational_cost ? `₹${kpis.operational_cost}` : '—'} accentColor="var(--warning)"  />
        <KPICard label="Vehicle ROI"        value={kpis.vehicle_roi        || '—'} accentColor="var(--accent)"   />
      </div>

      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '24px' }}>
        ROI = (Revenue – (Maintenance + Fuel)) / Acquisition Cost
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <div className="chart-title">Trip Status Distribution</div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={tripStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label isAnimationActive={true} animationBegin={200} animationDuration={1200} animationEasing="ease-out">
                {tripStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <div className="chart-title">Monthly Fuel vs Maintenance Costs</div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyCostsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} formatter={v => `₹${v.toLocaleString('en-IN')}`} />
              <Legend />
              <Line type="monotone" dataKey="fuel" stroke="#FF8042" strokeWidth={2} name="Fuel Cost" isAnimationActive={true} animationBegin={300} animationDuration={1500} animationEasing="ease-out" />
              <Line type="monotone" dataKey="maintenance" stroke="#0088FE" strokeWidth={2} name="Maintenance Cost" isAnimationActive={true} animationBegin={500} animationDuration={1500} animationEasing="ease-out" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <div className="chart-title">Top Costliest Vehicles</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {vehicleCosts.map((v, i) => (
              <div key={v.name} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ width: '80px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>{v.name}</span>
                <div style={{ flex: 1, height: '14px', background: 'var(--bg-input)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ width: animated ? `${(v.totalCost / maxCost) * 100}%` : '0%', height: '100%', background: costColors[i] || 'var(--accent)', borderRadius: 'var(--radius-full)', transition: 'width 1.2s cubic-bezier(0.1, 0.9, 0.2, 1) 0.2s' }} />
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '80px', textAlign: 'right' }}>₹{v.totalCost.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
        <button className="btn btn-outline" onClick={() => apiExportCSV('vehicles')}>📥 Export Vehicles CSV</button>
        <button className="btn btn-outline" onClick={() => apiExportCSV('trips')}>📥 Export Trips CSV</button>
        <button className="btn btn-outline" onClick={() => apiExportCSV('drivers')}>📥 Export Drivers CSV</button>
      </div>
    </div>
  );
}
