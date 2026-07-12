const statusMap = {
  'Available': 'available',
  'On Trip': 'on-trip',
  'In Shop': 'in-shop',
  'Retired': 'retired',
  'Dispatched': 'dispatched',
  'Completed': 'completed',
  'Cancelled': 'cancelled',
  'Draft': 'draft',
  'Suspended': 'suspended',
  'Off Duty': 'off-duty',
  'Active': 'active',
  'Closed': 'closed',
};

export default function StatusBadge({ status }) {
  const cls = statusMap[status] || 'draft';
  return <span className={`status-badge status-badge--${cls}`}>{status}</span>;
}
