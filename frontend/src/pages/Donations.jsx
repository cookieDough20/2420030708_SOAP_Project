/**
 * Donations Page — List of all donations.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { donorService } from '../services/donorService';
import { ngoService } from '../services/ngoService';
import { logisticsService } from '../services/logisticsService';
import { aiService } from '../services/aiService';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDateTime, getStatusClass } from '../utils/formatters';
import { ROLES } from '../utils/constants';

export default function Donations() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [aiPredictions, setAiPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDonations();
  }, []);

  async function fetchDonations() {
    setLoading(true);
    try {
      let res;
      if (user?.role === ROLES.DONOR) {
        res = await donorService.getDonationsByDonor(user.email);
        setDonations(res.data || []);
      } else {
        res = await donorService.getAllDonations();
        setDonations(res.data || []);
        
        if (user?.role === ROLES.ADMIN) {
          const [ngoRes, deliveryRes, aiRes] = await Promise.allSettled([
            ngoService.getAllNGOs(),
            logisticsService.getAllDeliveries(),
            aiService.getAllPredictions()
          ]);
          
          if (ngoRes.status === 'fulfilled') setNgos(ngoRes.value.data || []);
          if (deliveryRes.status === 'fulfilled') setDeliveries(deliveryRes.value.data || []);
          if (aiRes.status === 'fulfilled') setAiPredictions(aiRes.value.data || []);
        }
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to load donations.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(id, newStatus) {
    try {
      await donorService.updateStatus(id, newStatus);
      fetchDonations();
    } catch (err) {
      setError(err.userMessage || 'Failed to update status.');
    }
  }

  async function handleAdminAssign(d) {
    const ngoId = window.prompt("Enter the NGO ID to assign this donation to (e.g., 1 or 2):");
    if (!ngoId) return;

    try {
      const ngoRes = await ngoService.getNGO(ngoId);
      const ngo = ngoRes.data;

      await donorService.updateStatus(d.id, 'ACCEPTED');
      
      await logisticsService.createDelivery({
        donationId: d.id,
        ngoId: ngo.id,
        donorEmail: d.donorEmail,
        pickupAddress: d.pickupAddress,
        deliveryAddress: ngo.address
      });

      fetchDonations();
      alert("Successfully assigned to NGO and scheduled for Logistics!");
    } catch (err) {
      alert(err.userMessage || 'Failed to assign. Please ensure the NGO ID is valid.');
    }
  }

  if (loading) return <LoadingSpinner message="Loading donations..." />;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Donations</h1>
        <p>{user?.role === ROLES.DONOR ? 'Your donations' : 'All donations'}</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {donations.length === 0 ? (
        <div className="empty-state">
          <p>No donations found.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                {user?.role === ROLES.ADMIN && <th>Donor</th>}
                <th>Food/Item</th>
                <th>Quantity</th>
                {user?.role === ROLES.ADMIN && <th>AI Priority</th>}
                {user?.role === ROLES.ADMIN && <th>Allocated NGO</th>}
                {user?.role === ROLES.ADMIN && <th>Logistics Partner</th>}
                {user?.role === ROLES.ADMIN && <th>Logistics Status</th>}
                <th>Donation Status</th>
                <th>Created</th>
                {user?.role === ROLES.ADMIN && <th>Completed Date</th>}
                {(user?.role === ROLES.ADMIN || user?.role === ROLES.NGO) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => {
                const aiData = aiPredictions.find(ai => ai.donationId === d.id);
                let priority = 'N/A';
                if (aiData) {
                  const parsed = aiService.parseResult(aiData.result);
                  if (parsed) {
                    priority = parsed.priority || 'N/A';
                    if (parsed.urgency_score) priority += ` (${parsed.urgency_score})`;
                  }
                }
                const allocatedNgo = ngos.find(n => n.id === d.allocatedNgoId);
                const delivery = deliveries.find(del => del.donationId === d.id);

                return (
                <tr key={d.id}>
                  <td>#{d.id}</td>
                  {user?.role === ROLES.ADMIN && <td>{d.donorEmail}</td>}
                  <td><strong>{d.foodName}</strong><br/><small>{d.foodType}</small></td>
                  <td>{d.quantity} {d.quantityUnit}</td>
                  {user?.role === ROLES.ADMIN && <td>{priority}</td>}
                  {user?.role === ROLES.ADMIN && (
                    <td>
                      {allocatedNgo ? `${allocatedNgo.name} (ID: ${allocatedNgo.id})` : d.allocatedNgoId ? `NGO ID: ${d.allocatedNgoId}` : 'Not Allocated'}
                    </td>
                  )}
                  {user?.role === ROLES.ADMIN && (
                    <td>{delivery?.assignedDriver ? `${delivery.assignedDriver} (${delivery.driverPhone || ''})` : 'Unassigned'}</td>
                  )}
                  {user?.role === ROLES.ADMIN && (
                    <td>{delivery ? <span className={`badge ${getStatusClass(delivery.status)}`}>{delivery.status}</span> : 'N/A'}</td>
                  )}
                  <td><span className={`badge ${getStatusClass(d.status)}`}>{d.status}</span></td>
                  <td>{formatDateTime(d.createdAt)}</td>
                  {user?.role === ROLES.ADMIN && <td>{delivery?.deliveredAt ? formatDateTime(delivery.deliveredAt) : '-'}</td>}
                  {(user?.role === ROLES.ADMIN || user?.role === ROLES.NGO) && (
                    <td>
                      {d.status === 'AVAILABLE' && user?.role === ROLES.ADMIN && (
                        <button className="btn btn-sm btn-secondary" onClick={() => handleAdminAssign(d)}>
                          Assign to NGO
                        </button>
                      )}
                      {d.status === 'AVAILABLE' && user?.role === ROLES.NGO && (
                        <button className="btn btn-sm btn-primary" onClick={() => handleStatusUpdate(d.id, 'ACCEPTED')}>
                          Accept
                        </button>
                      )}
                      {d.status === 'ACCEPTED' && user?.role === ROLES.NGO && (
                        <button className="btn btn-sm btn-success" onClick={() => handleStatusUpdate(d.id, 'PICKED_UP')}>
                          Mark Picked Up
                        </button>
                      )}
                    </td>
                  )}
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
