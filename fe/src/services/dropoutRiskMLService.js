import { api } from './api';

// ML Dropout Risk APIs
export const dropoutRiskMLService = {
  // Train ML models
  trainModels: () => api.post('/dropout-risks-ml/train-models'),

  // Get model performance
  getModelPerformance: () => api.get('/dropout-risks-ml/model-performance'),

  // Get feature importance
  getFeatureImportance: () => api.get('/dropout-risks-ml/feature-importance'),

  // Predict dropout risk for a specific student
  predictStudent: (studentId, useEnsemble = true) => 
    api.post(`/dropout-risks-ml/predict/${studentId}`, {}, {
      params: { use_ensemble: useEnsemble }
    }),

  // Predict dropout risk for all students
  predictAllStudents: (useEnsemble = true) => 
    api.post('/dropout-risks-ml/predict-all', {}, {
      params: { use_ensemble: useEnsemble }
    }),

  // Compare models prediction for a student
  compareModels: (studentId) => 
    api.get(`/dropout-risks-ml/compare-models/${studentId}`),

  // Get risk factors analysis
  getRiskFactorsAnalysis: () => 
    api.get('/dropout-risks-ml/risk-factors-analysis')
};

export default dropoutRiskMLService;
