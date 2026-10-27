/**
 * Impact Service API calls.
 * Routes through: API Gateway -> Impact Service (:8086)
 */

import api from './api';
import { SERVICE_ROUTES } from '../utils/constants';

const IMPACTS = SERVICE_ROUTES.IMPACTS;

export const impactService = {
  /** Create an impact record */
  createImpact: (data) =>
    api.post(IMPACTS, data),

  /** Get all impact records */
  getAllImpacts: () =>
    api.get(IMPACTS),

  /** Get impact by ID */
  getImpact: (id) =>
    api.get(`${IMPACTS}/${id}`),

  /** Get impacts by donation ID */
  getByDonation: (donationId) =>
    api.get(`${IMPACTS}/donation/${donationId}`),

  /** Get impacts by NGO ID */
  getByNGO: (ngoId) =>
    api.get(`${IMPACTS}/ngo/${ngoId}`),

  /** Get impacts by delivery ID */
  getByDelivery: (deliveryId) =>
    api.get(`${IMPACTS}/delivery/${deliveryId}`),

  /** Delete impact record */
  deleteImpact: (id) =>
    api.delete(`${IMPACTS}/${id}`),
};
