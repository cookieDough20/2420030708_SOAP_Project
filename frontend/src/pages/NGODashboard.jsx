/**
 * NGO Dashboard Page.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ngoService } from '../services/ngoService';
import { donorService } from '../services/donorService';
import { logisticsService } from '../services/logisticsService';
import { notificationService } from '../services/notificationService';
import QRCode from 'react-qr-code';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatNumber, formatDateTime, getStatusClass } from '../utils/formatters';

import { useNavigate } from 'react-router-dom';

export default function NGODashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ngoInfo, setNgoInfo] = useState(null);
  const [donations, setDonations] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetch() {
      try {
        const results = await Promise.allSettled([
          ngoService.getByEmail(user.email),
          donorService.getAllDonations(),
        ]);
        
        if (results[0].status === 'fulfilled') {
          const info = results[0].value.data;
          setNgoInfo(info);
          if (info && info.id) {
            logisticsService.getByNGO(info.id).then(res => {
              setDeliveries(res.data || []);
            }).catch(e => console.error(e));
          }
        } else {
          // If we fail to fetch the NGO profile (whether it's 404 or a 500 RuntimeException),
          // it means the NGO profile doesn't exist yet, so redirect to setup.
          navigate('/ngo-setup');
          return;
        }

        if (results[1].status === 'fulfilled') setDonations(results[1].value.data || []);
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetch();
  }, [user.email, navigate]);

  if (loading) return <LoadingSpinner />;

  const available = donations.filter(d => d.status === 'AVAILABLE');
  const accepted = donations.filter(d => d.status === 'ACCEPTED');

  return (
    <div className="page relative">
      <div className="page-header flex justify-between items-start">
        <div>
          <h1>NGO Dashboard</h1>
          <p>Manage food requests and availability</p>
        </div>
        <button 
          onClick={async () => {
            if(window.confirm('Are you sure you want to broadcast an Emergency SOS to all local donors?')) {
              try {
                await notificationService.createNotification({
                  recipient: 'ALL_USERS',
                  recipientType: 'GLOBAL',
                  title: `EMERGENCY SOS: ${ngoInfo?.organizationName || 'Local NGO'} needs food!`,
                  message: `Critical food shortage. Please donate immediately to help us serve the community. Address: ${ngoInfo?.address || 'See profile'}`,
                  notificationType: 'URGENT'
                });
                alert('SOS Broadcasted successfully!');
              } catch (err) {
                alert('Failed to send SOS: ' + err.message);
              }
            }
          }}
          className="btn bg-red-600 hover:bg-red-700 text-white font-bold animate-pulse shadow-lg text-lg px-6 py-3 rounded-full border-4 border-red-200">
          🚨 EMERGENCY SOS
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid">
        <StatCard icon="&#127859;" label="Available Donations" value={formatNumber(available.length)} color="#10b981" />
        <StatCard icon="&#10004;" label="Accepted" value={formatNumber(accepted.length)} color="#3b82f6" />
        <StatCard icon="&#127970;" label="Organization" value={ngoInfo?.organizationName || 'Not Registered'} color="#8b5cf6" />
        <StatCard icon="&#128205;" label="City" value={ngoInfo?.city || 'N/A'} color="#f59e0b" />
      </div>

      <div className="card">
        <h3>Available Food Donations</h3>
        {available.length === 0 ? (
          <div className="empty-state">No available donations at the moment.</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>Food</th><th>Type</th><th>Qty</th><th>Status</th><th>Address</th><th>Created</th><th>Action</th></tr>
              </thead>
              <tbody>
                {available.map(d => (
                  <tr key={d.id}>
                    <td><strong>{d.foodName}</strong></td>
                    <td>{d.foodType}</td>
                    <td>{d.quantity} {d.quantityUnit}</td>
                    <td><span className={`badge ${getStatusClass(d.status)}`}>{d.status}</span></td>
                    <td>{d.pickupAddress || 'N/A'}</td>
                    <td>{formatDateTime(d.createdAt)}</td>
                    <td>
                      <button className="btn btn-sm btn-primary" onClick={async () => {
                        try {
                          // 1. Update Donation Status
                          await donorService.updateStatus(d.id, 'ACCEPTED');
                          setDonations(prev => prev.map(x => x.id === d.id ? { ...x, status: 'ACCEPTED' } : x));
                          
                          // 2. Automatically Create Delivery for Logistics/Volunteers
                          await logisticsService.createDelivery({
                            donationId: d.id,
                            ngoId: ngoInfo.id,
                            donorEmail: d.donorEmail,
                            pickupAddress: d.pickupAddress,
                            deliveryAddress: ngoInfo.address
                          });
                          
                          // Workflow Notification: Notify Donor & Logistics
                          try {
                            await notificationService.createNotification({
                              recipient: d.donorEmail,
                              recipientType: 'DONOR',
                              title: 'Donation Accepted!',
                              message: `${ngoInfo.organizationName} has accepted your donation of ${d.foodName}. A logistics partner will be assigned shortly.`,
                              notificationType: 'SUCCESS'
                            });
                            await notificationService.createNotification({
                              recipient: 'ALL_USERS',
                              recipientType: 'LOGISTICS',
                              title: 'New Delivery Assignment',
                              message: `A new delivery for ${ngoInfo.organizationName} has been assigned to your fleet.`,
                              notificationType: 'INFO'
                            });
                          } catch (e) {
                            console.warn("Failed to send workflow notifications", e);
                          }
                          
                          // 3. Refresh deliveries
                          const res = await logisticsService.getByNGO(ngoInfo.id);
                          setDeliveries(res.data || []);
                          
                        } catch (err) { setError(err.userMessage || 'Failed to accept and schedule delivery'); }
                      }}>Accept</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card mt-6">
        <h3>Expected Deliveries</h3>
        {deliveries.filter(d => ['ASSIGNED', 'IN_TRANSIT', 'PICKED_UP'].includes(d.status)).length === 0 ? (
          <div className="empty-state">No active deliveries expected at this time.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deliveries.filter(d => ['ASSIGNED', 'IN_TRANSIT', 'PICKED_UP'].includes(d.status)).map(d => (
              <div key={d.id} className="border p-4 rounded bg-gray-50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold">Delivery #{d.id}</h4>
                  <p className="text-sm">Status: <span className="text-blue-600 font-bold">{d.status}</span></p>
                  <p className="text-sm">Driver: {d.assignedDriver || 'Unknown'} ({d.driverPhone})</p>
                  <p className="text-sm text-gray-500 mt-2">Show this code to driver:</p>
                  <p className="font-mono text-xl font-bold tracking-widest">{d.verificationCode}</p>
                </div>
                {d.verificationCode && (
                  <div className="bg-white p-2 border rounded">
                    <QRCode value={d.verificationCode} size={100} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
