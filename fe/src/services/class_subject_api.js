import { api } from "./api";

// Class Subject Relation APIs
export const fetchSubjectsByClass = (classId) => api.get(`/class-subjects/class/${classId}/subjects`);
export const fetchClassesBySubject = (subjectId) => api.get(`/class-subjects/subject/${subjectId}/classes`);
export const addSubjectToClass = (classId, subjectId) => api.post(`/class-subjects/`, { class_id: classId, subject_id: subjectId });
export const removeSubjectFromClass = (classId, subjectId) => api.delete(`/class-subjects/${classId}/${subjectId}`);

// Class Student Relation APIs (enhanced)
export const addStudentToClass = (classId, studentId) => api.post(`/classes/${classId}/students`, { student_id: studentId });
export const removeStudentFromClass = (classId, studentId) => api.delete(`/classes/${classId}/students/${studentId}`);
export const getStudentClasses = (studentId) => api.get(`/students/${studentId}/classes`);
