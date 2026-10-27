import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { logisticsService } from '../services/logisticsService';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDateTime, getStatusClass } from '../utils/formatters';

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDeliveries();
  }, [user]);

  async function fetchDeliveries() {
    setLoading(true);
    try {
      // Get pending deliveries for anyone to pick up
      const pendingRes = await logisticsService.getByStatus('PENDING');
      setDeliveries(pendingRes.data || []);

      // To find "my" deliveries, we have to fetch all and filter because backend doesn't have a getByDriver method yet
      const allRes = await logisticsService.getAllDeliveries();
      const mine = (allRes.data || []).filter(d => d.assignedDriver === user.name);
      setMyDeliveries(mine);
      
    } catch (err) {
      setError(err.userMessage || 'Failed to load deliveries.');
    }
    setLoading(false);
  }

  async function handleVolunteer(id) {
    try {
      await logisticsService.assignDriver(id, {
        driverName: user.name,
        driverPhone: 'Volunteer (via app)'
      });
      fetchDeliveries();
    } catch (err) {
      setError(err.userMessage || 'Failed to assign delivery.');
    }
  }

  async function handleStatusUpdate(id, newStatus) {
    try {
      await logisticsService.updateStatus(id, newStatus);
      fetchDeliveries();
    } catch (err) {
      setError(err.userMessage || 'Failed to update status.');
    }
  }

  async function handleVerify(id) {
    const code = window.prompt("Enter the 8-character verification code from the NGO:");
    if (!code) return;
    
    try {
      await logisticsService.verifyDelivery(id, code);
      fetchDeliveries();
    } catch (err) {
      setError(err.userMessage || 'Verification failed. Incorrect code.');
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Volunteer Dashboard</h1>
        <p>Help your community by completing small food drop-offs on your commute!</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card mb-6 border-indigo-200">
        <h3 className="text-indigo-800 font-bold">🚶 My Active Deliveries</h3>
        {myDeliveries.filter(d => d.status !== 'DELIVERED').length === 0 ? (
          <div className="empty-state">You don't have any active deliveries. Pick one from below!</div>
        ) : (
          <div className="grid gap-4 mt-4">
            {myDeliveries.filter(d => d.status !== 'DELIVERED').map(d => (
              <div key={d.id} className="border p-4 rounded bg-indigo-50 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-4 md:mb-0">
                  <h4 className="font-bold text-lg">Delivery #{d.id}</h4>
                  <p>📍 <strong>Pickup:</strong> {d.pickupAddress || 'Unknown'}</p>
                  <p>🏁 <strong>Dropoff:</strong> {d.deliveryAddress || 'Unknown'}</p>
                  <p className="mt-2 text-sm">Status: <span className={`badge ${getStatusClass(d.status)}`}>{d.status}</span></p>
                </div>
                <div className="flex gap-2">
                    {d.status === 'ASSIGNED' && (
                      <button className="btn btn-sm btn-warning" onClick={() => handleStatusUpdate(d.id, 'PICKUP_PENDING')}>
                        Start Trip
                      </button>
                    )}
                    {d.status === 'PICKUP_PENDING' && (
                      <button className="btn btn-sm btn-info" onClick={() => handleStatusUpdate(d.id, 'PICKED_UP')}>
                        Picked Up Food
                      </button>
                    )}
                    {d.status === 'PICKED_UP' && (
                      <button className="btn btn-sm btn-purple" onClick={() => handleStatusUpdate(d.id, 'IN_TRANSIT')}>
                        On The Way
                      </button>
                    )}
                    {d.status === 'IN_TRANSIT' && (
                      <button className="btn btn-sm btn-success" onClick={() => handleVerify(d.id)}>
                        Verify & Complete
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Available Deliveries Near You</h3>
        <p className="text-sm text-gray-500 mb-4">These deliveries are pending pickup. Claim one if it's on your route!</p>
        
        {deliveries.length === 0 ? (
          <div className="empty-state">No pending deliveries right now.</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Pickup Address</th>
                  <th>Dropoff Address</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map(d => (
                  <tr key={d.id}>
                    <td>#{d.id}</td>
                    <td>{d.pickupAddress || 'Unknown'}</td>
                    <td>{d.deliveryAddress || 'Unknown'}</td>
                    <td>{formatDateTime(d.createdAt)}</td>
                    <td>
                      <button className="btn btn-sm btn-primary" onClick={() => handleVolunteer(d.id)}>
                        Volunteer to Deliver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
