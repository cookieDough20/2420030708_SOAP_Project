/**
 * Notification Service API calls.
 * Routes through: API Gateway -> Notification Service (:8085)
 */

import api from './api';
import { SERVICE_ROUTES } from '../utils/constants';

const NOTIFS = SERVICE_ROUTES.NOTIFICATIONS;

export const notificationService = {
  /** Create a notification */
  createNotification: (data) =>
    api.post(NOTIFS, data),

  /** Get all notifications */
  getAllNotifications: () =>
    api.get(NOTIFS),

  /** Get notification by ID */
  getNotification: (id) =>
    api.get(`${NOTIFS}/${id}`),

  /** Get notifications by recipient */
  getByRecipient: (recipient) =>
    api.get(`${NOTIFS}/recipient/${recipient}`),

  /** Get unread notifications */
  getUnreadNotifications: (recipient) =>
    api.get(`${NOTIFS}/unread/${recipient}`),

  /** Mark notification as read */
  markAsRead: (id) =>
    api.patch(`${NOTIFS}/${id}/read`),

  /** Mark notification as unread */
  markAsUnread: (id) =>
    api.patch(`${NOTIFS}/${id}/unread`),

  /** Delete notification */
  deleteNotification: (id) =>
    api.delete(`${NOTIFS}/${id}`),
};
