/**
 * Application-wide constants.
 */

// API Gateway base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Service routes via API Gateway (Eureka discovery-based routing)
export const SERVICE_ROUTES = {
  AUTH: '/auth',
  DONATIONS: '/donations',
  NGOS: '/ngos',
  DELIVERIES: '/deliveries',
  NOTIFICATIONS: '/notifications',
  IMPACTS: '/impacts',
  AI: '/ai',
};

// User roles
export const ROLES = {
  DONOR: 'DONOR',
  NGO: 'NGO',
  ADMIN: 'ADMIN',
  LOGISTICS: 'LOGISTICS',
  VOLUNTEER: 'VOLUNTEER',
};

// Donation statuses
export const DONATION_STATUS = {
  AVAILABLE: 'AVAILABLE',
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

// Delivery statuses
export const DELIVERY_STATUS = {
  ASSIGNED: 'ASSIGNED',
  PICKUP_PENDING: 'PICKUP_PENDING',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
};

// Food types
export const FOOD_TYPES = [
  { value: 'cooked_food', label: 'Cooked Food' },
  { value: 'raw_vegetables', label: 'Raw Vegetables' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'packaged_food', label: 'Packaged Food' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'grains', label: 'Grains' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'mixed', label: 'Mixed' },
];

// Quantity units
export const QUANTITY_UNITS = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'liters', label: 'Liters' },
  { value: 'servings', label: 'Servings' },
  { value: 'packets', label: 'Packets' },
  { value: 'boxes', label: 'Boxes' },
];

// Status badge colors
export const STATUS_COLORS = {
  AVAILABLE: '#10b981',
  PENDING: '#f59e0b',
  ACCEPTED: '#3b82f6',
  PICKED_UP: '#8b5cf6',
  IN_TRANSIT: '#6366f1',
  DELIVERED: '#10b981',
  COMPLETED: '#059669',
  CANCELLED: '#ef4444',
  ASSIGNED: '#3b82f6',
  PICKUP_PENDING: '#f59e0b',
};

// Priority colors
export const PRIORITY_COLORS = {
  CRITICAL: '#dc2626',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
};
