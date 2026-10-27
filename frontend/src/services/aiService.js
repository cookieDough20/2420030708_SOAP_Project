/**
 * AI Service API calls.
 * Routes through: API Gateway -> AI Orchestrator (:8087) -> FastAPI (:8000)
 * 
 * The React frontend NEVER calls FastAPI directly for standard JSON requests.
 * All JSON AI requests go through the Spring Boot AI Orchestrator.
 * Exception: Multipart File Uploads (Computer Vision) go directly to FastAPI (:8000).
 */

import api from './api';
import { SERVICE_ROUTES } from '../utils/constants';

const AI = SERVICE_ROUTES.AI;

export const aiService = {
  /**
   * Get AI prediction for a donation.
   * 
   * The AI Orchestrator expects:
   *   { input: "<JSON string>", taskType: "...", donationId: ... }
   * 
   * It forwards to FastAPI, stores the result, and returns:
   *   { result: "<JSON string>", taskType: "...", donationId: ... }
   */
  predict: (donationData, taskType = 'donation_priority', donationId = null) => {
    const payload = {
      input: JSON.stringify(donationData),
      taskType,
      donationId,
    };
    return api.post(`${AI}/predict`, payload);
  },

  /** Get all stored AI predictions */
  getAllPredictions: () =>
    api.get(`${AI}/predictions`),

  /** Get a specific prediction by ID */
  getPrediction: (id) =>
    api.get(`${AI}/predictions/${id}`),

  /** Get predictions for a specific donation */
  getByDonation: (donationId) =>
    api.get(`${AI}/predictions/donation/${donationId}`),

  /**
   * Parse the AI response result string into an object.
   * The 'result' field from the orchestrator is a JSON string.
   */
  parseResult: (resultString) => {
    try {
      return JSON.parse(resultString);
    } catch {
      return null;
    }
  },

  /**
   * Analyze Image using Computer Vision (FastAPI directly).
   * Now routed correctly through the API Gateway!
   */
  analyzeImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/fastapi/analyze_image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * Optimize Logistics Route using AI (FastAPI directly).
   * Now routed correctly through the API Gateway!
   */
  optimizeRoute: (locations) => {
    return api.post('/fastapi/optimize_route', locations, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
};
