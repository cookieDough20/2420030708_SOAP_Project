/**
 * Logistics Service API calls.
 * Routes through: API Gateway -> Logistics Service (:8084)
 */

import api from './api';
import { SERVICE_ROUTES } from '../utils/constants';

const DELIVERIES = SERVICE_ROUTES.DELIVERIES;

export const logisticsService = {
  /** Create a new delivery */
  createDelivery: (data) =>
    api.post(DELIVERIES, data),

  /** Get all deliveries */
  getAllDeliveries: () =>
    api.get(DELIVERIES),

  /** Get delivery by ID */
  getDelivery: (id) =>
    api.get(`${DELIVERIES}/${id}`),

  /** Get deliveries by donation ID */
  getByDonation: (donationId) =>
    api.get(`${DELIVERIES}/donation/${donationId}`),

  /** Get deliveries by NGO ID */
  getByNGO: (ngoId) =>
    api.get(`${DELIVERIES}/ngo/${ngoId}`),

  /** Get deliveries by donor email */
  getByDonor: (email) =>
    api.get(`${DELIVERIES}/donor/${email}`),

  /** Get deliveries by status */
  getByStatus: (status) =>
    api.get(`${DELIVERIES}/status/${status}`),

  /** Assign driver to a delivery */
  assignDriver: (id, driverData) =>
    api.patch(`${DELIVERIES}/${id}/assign-driver`, driverData),

  /** Update delivery status */
  updateStatus: (id, status) =>
    api.patch(`${DELIVERIES}/${id}/status?status=${status}`),

  /** Verify delivery with QR code */
  verifyDelivery: (id, code) =>
    api.post(`${DELIVERIES}/${id}/verify?code=${code}`),

  /** Delete delivery */
  deleteDelivery: (id) =>
    api.delete(`${DELIVERIES}/${id}`),
};
