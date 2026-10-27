/**
 * Utility formatters for display purposes.
 */

/**
 * Format a date string to a readable format.
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

/**
 * Format a datetime string to a readable format.
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
};

/**
 * Format number with commas.
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString('en-US');
};

/**
 * Format weight in kg.
 */
export const formatWeight = (kg) => {
  if (!kg) return '0 kg';
  return `${Number(kg).toLocaleString('en-US', { maximumFractionDigits: 1 })} kg`;
};

/**
 * Get status badge class name.
 */
export const getStatusClass = (status) => {
  const map = {
    AVAILABLE: 'badge-success',
    AI_PROCESSING: 'badge-purple',
    ALLOCATED: 'badge-info',
    PENDING: 'badge-warning',
    ACCEPTED: 'badge-info',
    PICKED_UP: 'badge-purple',
    IN_TRANSIT: 'badge-indigo',
    DELIVERED: 'badge-success',
    COMPLETED: 'badge-success',
    CANCELLED: 'badge-danger',
    ASSIGNED: 'badge-info',
    PICKUP_PENDING: 'badge-warning',
  };
  return map[status] || 'badge-default';
};

/**
 * Get priority badge class.
 */
export const getPriorityClass = (priority) => {
  const map = {
    CRITICAL: 'priority-critical',
    HIGH: 'priority-high',
    MEDIUM: 'priority-medium',
    LOW: 'priority-low',
  };
  return map[priority] || 'priority-default';
};

/**
 * Calculate time remaining from now to expiry.
 */
export const getTimeRemaining = (expiryString) => {
  if (!expiryString) return 'Unknown';
  const now = new Date();
  const expiry = new Date(expiryString);
  const diff = expiry - now;

  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return `${hours}h ${minutes}m`;
};

/**
 * Truncate text with ellipsis.
 */
export const truncate = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};
