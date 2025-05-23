import { api } from "./api";

 
export const dropoutRiskService = {
  // Get all risk assessments using ML
  getAllRisks: async (params = {}) => {
    return api.get('/dropout-risks-ml', { params });
  },
    // Get risk assessment by ID using ML
  getRiskById: async (riskId) => {
    return api.get(`/dropout-risks-ml/${riskId}`);
  },
    // Get risk assessments for a specific student using ML
  getStudentRisks: async (studentId) => {
    return api.get(`/dropout-risks-ml/${studentId}/historical`);
  },
  
  // Get latest risk assessment for a student using ML
  getLatestStudentRisk: async (studentId) => {
    return api.get(`/students/${studentId}/dropout-risks-ml/latest`);
  },
    // Predict risk for a specific student using ML
  predictRisk: async (studentId) => {
    return api.post(`/dropout-risks-ml/predict/${studentId}`);
  },
  
  // Original ML prediction method (keeping for backward compatibility)
  predictRiskML: async (studentId) => {
    return api.post(`/dropout-risks-ml/predict/${studentId}`);
  },
    // Recalculate risk for a specific student using ML
  recalculateRisk: async (studentId) => {
    return api.post(`/dropout-risks-ml/recalculate/${studentId}`);
  },
  
  // Predict risk for all students (admin only) using ML
  predictAllRisks: async () => {
    return api.post('/dropout-risks-ml/predict-all');
  },
  
  // Create a new risk assessment using ML
  createRisk: async (riskData) => {
    return api.post('/dropout-risks-ml', riskData);
  },
  
  // Update a risk assessment using ML
  updateRisk: async (riskId, riskData) => {
    return api.put(`/dropout-risks-ml/${riskId}`, riskData);
  },
  
  // Delete a risk assessment (admin only) using ML
  deleteRisk: async (riskId) => {
    return api.delete(`/dropout-risks-ml/${riskId}`);
  },  // Get class-based risk analytics (there's no ML-specific endpoint for this)
  getClassRiskAnalytics: async (classId) => {
    return api.get(`/classes/${classId}/dropout-risks/analytics`);
  },
  
  // Get class-based risk analytics specifically using ML algorithms
  getClassRiskAnalyticsWithML: async (classId) => {
    return api.get(`/classes/${classId}/dropout-risks-ml/analytics`);
  },
  
  // Get model performance metrics (Accuracy and ROC-AUC) for ML model
  getModelMetrics: async () => {
    // Using the correct endpoint for model metrics
    return api.get('/dropout-risks-ml/model-performance');
  },

  // Retrain model (admin only) for ML model
  retrainModel: async () => {
    // Using the correct endpoint for model retraining
    return api.post('/dropout-risks-ml/train-models');
  },
};

// Using named export for consistency with other services
// This ensures we're only exporting the service in one way
export default dropoutRiskService;