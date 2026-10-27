/**
 * Auth Service API calls.
 * Routes through: API Gateway -> Auth Service (:8081)
 */

import api from './api';
import { SERVICE_ROUTES } from '../utils/constants';

const AUTH = SERVICE_ROUTES.AUTH;

export const authService = {
  /**
   * Login with email and password.
   * Returns: { token, email, role }
   */
  login: (email, password) =>
    api.post(`${AUTH}/login`, { email, password }),

  /**
   * Register a new user.
   * Returns: success message string
   */
  register: (name, email, password, role) =>
    api.post(`${AUTH}/register`, { name, email, password, role }),
};
