import { api } from "./api";

 
export const dropoutRiskService = {
  // Get all risk assessments
  getAllRisks: async (params = {}) => {
    return api.get('/dropout-risks', { params });
  },
    // Get risk assessment by ID
  getRiskById: async (riskId) => {
    return api.get(`/dropout-risks/${riskId}`);
  },
    // Get risk assessments for a specific student
  getStudentRisks: async (studentId) => {
    return api.get(`/dropout-risks/${studentId}/historical`);
  },
  
  // Get latest risk assessment for a student
  getLatestStudentRisk: async (studentId) => {
    return api.get(`/students/${studentId}/dropout-risks/latest`);
  },
  
  // Predict risk for a specific student
  predictRisk: async (studentId) => {
    return api.post(`/dropout-risks/predict/${studentId}`);
  },
  
  // Recalculate risk for a specific student
  recalculateRisk: async (studentId) => {
    return api.post(`/dropout-risks/recalculate/${studentId}`);
  },
  
  // Predict risk for all students (admin only)
  predictAllRisks: async () => {
    return api.post('/dropout-risks/predict-all');
  },
  
  // Create a new risk assessment
  createRisk: async (riskData) => {
    return api.post('/dropout-risks', riskData);
  },
  
  // Update a risk assessment
  updateRisk: async (riskId, riskData) => {
    return api.put(`/dropout-risks/${riskId}`, riskData);
  },
  
  // Delete a risk assessment (admin only)
  deleteRisk: async (riskId) => {
    return api.delete(`/dropout-risks/${riskId}`);
  },
  
  // Get class-based risk analytics
  getClassRiskAnalytics: async (classId) => {
    return api.get(`/classes/${classId}/dropout-risks/analytics`);
  },
};

// Using named export for consistency with other services
// This ensures we're only exporting the service in one way
export default dropoutRiskService;