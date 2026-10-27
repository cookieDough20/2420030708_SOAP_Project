/**
 * NGO Service API calls.
 * Routes through: API Gateway -> NGO Service (:8083)
 */

import api from './api';
import { SERVICE_ROUTES } from '../utils/constants';

const NGOS = SERVICE_ROUTES.NGOS;

export const ngoService = {
  /** Create/register a new NGO */
  createNGO: (data) =>
    api.post(NGOS, data),

  /** Get all NGOs */
  getAllNGOs: () =>
    api.get(NGOS),

  /** Get NGO by ID */
  getNGO: (id) =>
    api.get(`${NGOS}/${id}`),

  /** Get NGO by email */
  getByEmail: (email) =>
    api.get(`${NGOS}/email/${email}`),

  /** Get NGOs by city */
  getByCity: (city) =>
    api.get(`${NGOS}/city/${city}`),

  /** Get available NGOs */
  getAvailableNGOs: () =>
    api.get(`${NGOS}/available`),

  /** Update availability status */
  updateAvailability: (id, available) =>
    api.patch(`${NGOS}/${id}/availability?available=${available}`),

  /** Update active status */
  updateActiveStatus: (id, active) =>
    api.patch(`${NGOS}/${id}/active?active=${active}`),

  /** Delete NGO */
  deleteNGO: (id) =>
    api.delete(`${NGOS}/${id}`),
};
