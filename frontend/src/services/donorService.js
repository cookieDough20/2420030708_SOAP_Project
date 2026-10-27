/**
 * Donor Service API calls.
 * Routes through: API Gateway -> Donor Service (:8082)
 */

import api from './api';
import { SERVICE_ROUTES } from '../utils/constants';

const DONATIONS = SERVICE_ROUTES.DONATIONS;

export const donorService = {
  /** Create a new donation */
  createDonation: (data) =>
    api.post(DONATIONS, data),

  /** Get all donations */
  getAllDonations: () =>
    api.get(DONATIONS),

  /** Get a single donation by ID */
  getDonation: (id) =>
    api.get(`${DONATIONS}/${id}`),

  /** Get donations by donor email */
  getDonationsByDonor: (email) =>
    api.get(`${DONATIONS}/donor/${email}`),

  /** Update donation status */
  updateStatus: (id, status) =>
    api.patch(`${DONATIONS}/${id}/status?status=${status}`),

  /** Delete a donation */
  deleteDonation: (id) =>
    api.delete(`${DONATIONS}/${id}`),
    
  /** Create a Donor Profile */
  createProfile: (data) =>
    api.post('/donor-profiles', data),
    
  /** Get Donor Profile by Email */
  getProfileByEmail: (email) =>
    api.get(`/donor-profiles/email/${email}`),
};
