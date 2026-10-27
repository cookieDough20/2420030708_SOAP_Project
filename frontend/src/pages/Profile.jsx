/**
 * Profile Page.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ngoService } from '../services/ngoService';
import { logisticsPartnerService } from '../services/logisticsPartnerService';
import { donorService } from '../services/donorService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Profile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      if (!user?.email) return;
      
      setLoading(true);
      try {
        if (user.role === 'NGO') {
          const res = await ngoService.getByEmail(user.email);
          setProfileData(res.data);
        } else if (user.role === 'LOGISTICS') {
          const res = await logisticsPartnerService.getByEmail(user.email);
          setProfileData(res.data);
        } else if (user.role === 'DONOR') {
          const res = await donorService.getProfileByEmail(user.email);
          setProfileData(res.data);
        }
        // ADMIN role doesn't currently have a separate profile table
      } catch (err) {
        // If 404, they haven't created a profile yet
        if (err.status === 404 || (err.userMessage && err.userMessage.includes('not found'))) {
          setError('Profile setup incomplete. Please complete your profile setup.');
        } else {
          setError(err.userMessage || 'Failed to load profile details.');
        }
      } finally {
        setLoading(false);
      }
    }
    
    loadProfile();
  }, [user]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Your account information</p>
      </div>

      <div className="form-card" style={{ maxWidth: 600 }}>
        <div className="profile-avatar">
          <span className="avatar-icon">&#128100;</span>
        </div>

        <div className="profile-info">
          <div className="profile-field">
            <label>Email</label>
            <p>{user?.email || 'N/A'}</p>
          </div>
          <div className="profile-field">
            <label>Role</label>
            <span className={`badge badge-info`}>{user?.role || 'N/A'}</span>
          </div>
          
          {loading && <div style={{marginTop: '20px'}}><LoadingSpinner message="Loading profile..." /></div>}
          
          {error && <div className="alert alert-error" style={{marginTop: '20px'}}>{error}</div>}
          
          {!loading && profileData && user?.role === 'NGO' && (
            <>
              <div className="profile-field">
                <label>Organization Name</label>
                <p>{profileData.organizationName}</p>
              </div>
              <div className="profile-field">
                <label>Phone</label>
                <p>{profileData.phone}</p>
              </div>
              <div className="profile-field">
                <label>Address</label>
                <p>{profileData.address}, {profileData.city}, {profileData.state} {profileData.pincode}</p>
              </div>
              <div className="profile-field">
                <label>Food Capacity</label>
                <p>{profileData.foodCapacity} kg</p>
              </div>
              <div className="profile-field">
                <label>People Served</label>
                <p>{profileData.peopleServed} people</p>
              </div>
              <div className="profile-field">
                <label>Status</label>
                <p>{profileData.active ? 'Active' : 'Inactive'} | {profileData.available ? 'Available to Receive' : 'Busy'}</p>
              </div>
            </>
          )}

          {!loading && profileData && user?.role === 'LOGISTICS' && (
            <>
              <div className="profile-field">
                <label>Company Name</label>
                <p>{profileData.companyName}</p>
              </div>
              <div className="profile-field">
                <label>Phone</label>
                <p>{profileData.phone}</p>
              </div>
              <div className="profile-field">
                <label>Vehicle Details</label>
                <p>{profileData.vehicleType} (Capacity: {profileData.vehicleCapacity} kg)</p>
              </div>
              <div className="profile-field">
                <label>Service Area</label>
                <p>{profileData.serviceArea}</p>
              </div>
            </>
          )}

          {!loading && profileData && user?.role === 'DONOR' && (
            <>
              <div className="profile-field">
                <label>Name / Organization</label>
                <p>{profileData.fullName}</p>
              </div>
              <div className="profile-field">
                <label>Donor Type</label>
                <p>{profileData.donorType}</p>
              </div>
              <div className="profile-field">
                <label>Phone</label>
                <p>{profileData.phone}</p>
              </div>
              <div className="profile-field">
                <label>Address</label>
                <p>{profileData.address}, {profileData.city}, {profileData.state} {profileData.pincode}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
