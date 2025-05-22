import axios from "axios";

// Create axios instance with base URL and default headers
const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 unauthorized errors (expired token, etc.)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const login = (credentials) => api.post("/auth/login", credentials);
export const register = (userData) => api.post("/auth/register", userData);
export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", { email });
export const resetPassword = (token, newPassword) =>
  api.post("/auth/reset-password", { token, newPassword });
export const getProfile = () => api.get("/auth/me");
export const updateProfile = (data) => api.put("/users/me", data);

// Student APIs
export const fetchStudents = (params) => api.get("/students", { params });
export const fetchStudentById = (id) => api.get(`/students/${id}`);
export const createStudent = (data) => api.post("/students", data);
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/students/${id}`);
export const fetchStudentPerformance = (id) =>
  api.get(`/students/${id}/performance`);
export const fetchStudentAttendance = (id) =>
  api.get(`/students/${id}/attendance`);
export const fetchStudentDisciplinary = (id) =>
  api.get(`/students/${id}/disciplinary`);
export const fetchStudentDropoutRisk = (id) =>
  api.get(`/students/${id}/dropout-risk`);

// Class APIs
export const fetchClasses = (params) => api.get("/classes", { params });
export const fetchClassById = (id) => api.get(`/classes/${id}`);
export const createClass = (data) => api.post("/classes", data);
export const updateClass = (id, data) => api.put(`/classes/${id}`, data);
export const deleteClass = (id) => api.delete(`/classes/${id}`);
export const fetchStudentsByClass = (classId) =>
  api.get(`/classes/${classId}/students`);

// Subject APIs
export const fetchSubjects = (params) => api.get("/subjects", { params });
export const fetchSubjectById = (id) => api.get(`/subjects/${id}`);
export const createSubject = (data) => api.post("/subjects", data);
export const updateSubject = (id, data) => api.put(`/subjects/${id}`, data);
export const deleteSubject = (id) => api.delete(`/subjects/${id}`);

// Teacher APIs
export const fetchTeachers = (params) => api.get("/teachers", { params });
export const fetchTeacherById = (id) => api.get(`/teachers/${id}`);
export const createTeacher = (data) => api.post("/teachers", data);
export const updateTeacher = (id, data) => api.put(`/teachers/${id}`, data);
export const deleteTeacher = (id) => api.delete(`/teachers/${id}`);

// Attendance APIs
export const fetchAttendanceRecords = (params) =>
  api.get("/attendance", { params });
export const fetchAttendanceByFilters = ({ class_id, date, status }) => {
  // Remove empty parameters to avoid sending them as empty strings
  const params = {};
  if (class_id) params.class_id = class_id;
  if (date) params.date = date;
  if (status) params.status = status;
  
  return api.get("/attendance", { params });
};
export const submitAttendance = (data) => api.post("/attendance", data);
export const fetchAttendanceStats = (dateRange) =>
  api.get("/attendance/stats", { params: dateRange });
export const fetchClassAttendance = (classId, dateRange) =>
  api.get(`/attendance/class/${classId}`, { params: dateRange });

// Disciplinary APIs
export const fetchDisciplinaryRecords = (params) =>
  api.get("/disciplinary-records", { params });
export const fetchDisciplinaryById = (id) => api.get(`/disciplinary-records/${id}`);
export const createDisciplinaryRecord = (data) =>
  api.post("/disciplinary-records", data);
export const updateDisciplinaryRecord = (id, data) =>
  api.put(`/disciplinary-records/${id}`, data);
export const deleteDisciplinaryRecord = (id) =>
  api.delete(`/disciplinary-records/${id}`);

// Dropout Risk APIs
export const fetchDropoutRisks = (params) =>
  api.get("/dropout-risks", { params });
export const fetchDropoutRiskById = (id) => api.get(`/dropout-risks/${id}`);
export const fetchDropoutRiskData = (filters) =>
  api.get("/dropout-risks/data", { params: filters });
export const fetchInterventionsByStudent = (studentId) =>
  api.get(`/dropout-risks/students/${studentId}/interventions`);
export const fetchAllInterventions = (filters) =>
  api.get("/dropout-risks/interventions", { params: filters });
export const fetchInterventionById = (id) =>
  api.get(`/dropout-risks/interventions/${id}`);
export const createIntervention = (data) =>
  api.post("/dropout-risks/interventions", data);
export const updateIntervention = (id, data) =>
  api.put(`/dropout-risks/interventions/${id}`, data);
export const completeIntervention = (id) =>
  api.put(`/dropout-risks/interventions/${id}/complete`);
export const fetchRiskFactors = () => api.get("/dropout-risks/factors");

// Report APIs
export const fetchAcademicReports = (params) =>
  api.get("/reports/academic", { params });
export const fetchAttendanceReports = (params) =>
  api.get("/reports/attendance", { params });
export const fetchDropoutReports = (params) =>
  api.get("/reports/dropout", { params });
export const exportReport = (type, params) =>
  api.get(`/reports/export/${type}`, {
    params,
    responseType: "blob",
  });

// User Management APIs
export const fetchUsers = (params) => api.get("/users", { params });
export const fetchUserById = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post("/users", data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Parent APIs
export const fetchParents = (params) => api.get("/parents", { params });
export const fetchParentById = (id) => api.get(`/parents/${id}`);
export const createParent = (data) => api.post("/parents", data);
export const updateParent = (id, data) => api.put(`/parents/${id}`, data);
export const deleteParent = (id) => api.delete(`/parents/${id}`);
export const fetchParentStudents = (parentId) =>
  api.get(`/parents/${parentId}/students`);
export const linkParentToStudent = (parentId, studentId) =>
  api.post(`/parents/${parentId}/students/${studentId}`);
export const unlinkParentFromStudent = (parentId, studentId) =>
  api.delete(`/parents/${parentId}/students/${studentId}`);

export { api };

