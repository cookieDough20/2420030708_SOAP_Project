/**
 * Logistics Page — Delivery management.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { logisticsService } from '../services/logisticsService';
import { logisticsPartnerService } from '../services/logisticsPartnerService';
import { donorService } from '../services/donorService';
import { impactService } from '../services/impactService';
import { aiService } from '../services/aiService';
import { notificationService } from '../services/notificationService';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDateTime, getStatusClass } from '../utils/formatters';

export default function Logistics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  
  // AI Route state
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState(null);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        // 1. Check if partner profile exists (only for LOGISTICS role)
        if (user.role === 'LOGISTICS') {
          try {
            const profileRes = await logisticsPartnerService.getByEmail(user.email);
            setPartnerInfo(profileRes.data);
          } catch {
            // If 404 or 500 (not found), redirect to setup
            navigate('/logistics-setup');
            return;
          }
        }

        // 2. Fetch deliveries
        const res = await logisticsService.getAllDeliveries();
        setDeliveries(res.data || []);
      } catch (err) {
        setError(err.userMessage || 'Failed to load data.');
      }
      setLoading(false);
    }
    init();
  }, [user.email, navigate]);

  async function fetchDeliveries() {
    try {
      const res = await logisticsService.getAllDeliveries();
      setDeliveries(res.data || []);
    } catch (err) {
      setError(err.userMessage || 'Failed to refresh deliveries.');
    }
  }

  async function handleStatusUpdate(id, newStatus) {
    try {
      await logisticsService.updateStatus(id, newStatus);
      
      // Auto-update the underlying donation status to match the delivery status
      const d = deliveries.find(x => x.id === id);
      if (d && d.donationId) {
        try {
          await donorService.updateStatus(d.donationId, newStatus);
          
          if (newStatus === 'PICKED_UP') {
            await notificationService.createNotification({
              recipient: d.donorEmail,
              recipientType: 'DONOR',
              title: 'Food Picked Up',
              message: `Your donation has been picked up by our logistics partner!`,
              notificationType: 'INFO'
            });
          } else if (newStatus === 'IN_TRANSIT') {
             await notificationService.createNotification({
              recipient: d.donorEmail,
              recipientType: 'DONOR',
              title: 'Food in Transit',
              message: `Your donation is on its way to the NGO.`,
              notificationType: 'INFO'
            });
          }
        } catch (e) {
          console.warn("Failed to sync donation status or send notification:", e);
        }
      }

      fetchDeliveries();
    } catch (err) {
      setError(err.userMessage || 'Failed to update status.');
    }
  }

  async function handleAssignDriver(id) {
    const driverName = window.prompt("Enter Driver Name:");
    if (!driverName) return;
    
    const driverPhone = window.prompt("Enter Driver Phone Number:");
    if (!driverPhone) return;

    try {
      await logisticsService.assignDriver(id, { driverName, driverPhone });
      fetchDeliveries();
    } catch (err) {
      setError(err.userMessage || 'Failed to assign driver.');
    }
  }

  async function handleVerify(id) {
    const code = window.prompt("Enter the 8-character verification code from the NGO:");
    if (!code) return;
    
    try {
      await logisticsService.verifyDelivery(id, code);
      
      // Auto-update the underlying donation status to match the delivery status
      const d = deliveries.find(x => x.id === id);
      if (d && d.donationId) {
        try {
          await donorService.updateStatus(d.donationId, 'DELIVERED');
          
          // Trigger Impact Calculation
          const donationRes = await donorService.getDonation(d.donationId);
          const donation = donationRes.data;
          
          let qtyKg = donation.quantity || 0;
          if (donation.quantityUnit !== 'kg') {
             // rough estimation for non-kg units (e.g. 50 boxes -> 25kg)
             qtyKg = qtyKg * 0.5;
          }
          
          await impactService.createImpact({
              donationId: d.donationId,
              ngoId: d.ngoId,
              deliveryId: d.id,
              foodQuantityKg: qtyKg,
              mealsProvided: Math.floor(qtyKg * 4), // ~4 meals per kg
              co2SavedKg: qtyKg * 2.5, // ~2.5kg CO2 saved per kg of food
              peopleServed: Math.floor(qtyKg * 3), 
              impactType: 'DELIVERY_COMPLETED'
          });
          
          await notificationService.createNotification({
              recipient: d.donorEmail,
              recipientType: 'DONOR',
              title: 'Food Delivered!',
              message: `Your donation has been successfully delivered and is serving the community!`,
              notificationType: 'SUCCESS'
          });

        } catch (e) {
          console.warn("Failed to sync donation status or calculate impact:", e);
        }
      }

      fetchDeliveries();
    } catch (err) {
      setError(err.userMessage || 'Verification failed. Incorrect code.');
    }
  }

  async function handleOptimizeRoute() {
    const activeDeliveries = deliveries.filter(d => ['PENDING', 'ASSIGNED', 'PICKUP_PENDING'].includes(d.status));
    if (activeDeliveries.length === 0) {
      alert('No active pickups to optimize!');
      return;
    }

    setOptimizing(true);
    setError('');
    
    try {
      const locations = activeDeliveries.map(d => ({
        id: d.id,
        pickup: d.pickupAddress || 'Unknown Pickup',
        dropoff: d.deliveryAddress || 'Unknown Dropoff'
      }));
      
      const res = await aiService.optimizeRoute(locations);
      setOptimizedRoute(res.data);
    } catch {
      setError('AI Optimization failed. Is the FastAPI service running?');
    } finally {
      setOptimizing(false);
    }
  }

  const filtered = filter === 'ALL' ? deliveries : deliveries.filter(d => d.status === filter);

  if (loading) return <LoadingSpinner message="Loading deliveries..." />;

  return (
    <div className="page">
      <div className="page-header flex justify-between items-start">
        <div>
          <h1>Logistics Dashboard</h1>
          <p>Manage pickups and deliveries for {partnerInfo?.companyName || 'your fleet'}</p>
        </div>
        <button className="btn btn-primary" onClick={handleOptimizeRoute} disabled={optimizing}>
          {optimizing ? 'Optimizing…' : '🎯 Optimize Route (AI)'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filter-bar flex justify-between items-center">
        <div>
          {['ALL', 'PENDING', 'ASSIGNED', 'PICKUP_PENDING', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].map(s => (
            <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'} mr-2`}
              onClick={() => setFilter(s)}>{s.replace('_', ' ')}</button>
          ))}
        </div>
      </div>

      {optimizedRoute && (
        <div className="card bg-purple-50 border-purple-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-purple-800 font-bold m-0">🎯 AI Optimized Route</h3>
            <button className="text-gray-500 hover:text-gray-800" onClick={() => setOptimizedRoute(null)}>✕</button>
          </div>
          <div className="flex gap-8 mb-4 text-sm font-semibold text-purple-700">
            <span>⏱️ Estimated Time Saved: {optimizedRoute.estimated_time_saved_mins} mins</span>
            <span>🛣️ Distance Saved: {optimizedRoute.distance_saved_km} km</span>
          </div>
          <ol className="list-decimal pl-5 space-y-2">
            {optimizedRoute.optimized_route.map((loc, i) => (
              <li key={i} className="bg-white p-2 rounded shadow-sm border">
                <strong>Delivery #{loc.id}</strong> — Pickup: <span className="text-gray-600">{loc.pickup}</span> ➡️ Dropoff: <span className="text-gray-600">{loc.dropoff}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">No deliveries found.</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Donation</th>
                <th>NGO</th>
                <th>Driver</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id}>
                  <td>#{d.id}</td>
                  <td>Donation #{d.donationId}</td>
                  <td>NGO #{d.ngoId}</td>
                  <td>{d.driverName || d.driverPhone || 'Unassigned'}</td>
                  <td><span className={`badge ${getStatusClass(d.status)}`}>{d.status}</span></td>
                  <td>{formatDateTime(d.createdAt)}</td>
                  <td className="action-buttons">
                    {d.status === 'PENDING' && (
                      <button className="btn btn-sm btn-primary" onClick={() => handleAssignDriver(d.id)}>
                        Assign Driver
                      </button>
                    )}
                    {d.status === 'ASSIGNED' && (
                      <button className="btn btn-sm btn-warning" onClick={() => handleStatusUpdate(d.id, 'PICKUP_PENDING')}>
                        Start Pickup
                      </button>
                    )}
                    {d.status === 'PICKUP_PENDING' && (
                      <button className="btn btn-sm btn-info" onClick={() => handleStatusUpdate(d.id, 'PICKED_UP')}>
                        Picked Up
                      </button>
                    )}
                    {d.status === 'PICKED_UP' && (
                      <button className="btn btn-sm btn-purple" onClick={() => handleStatusUpdate(d.id, 'IN_TRANSIT')}>
                        In Transit
                      </button>
                    )}
                    {d.status === 'IN_TRANSIT' && (
                      <button className="btn btn-sm btn-success" onClick={() => handleVerify(d.id)}>
                        Verify Delivery
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
