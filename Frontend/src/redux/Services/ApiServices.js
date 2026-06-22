import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const DepartmentApi = {
  getAllDepartments: () => axios.get(`${API_BASE_URL}/departments`),
  createDepartment: (data) => axios.post(`${API_BASE_URL}/departments`, data),
  updateDepartment: (id, data) => axios.put(`${API_BASE_URL}/departments/${id}`, data),
  deleteDepartment: (id) => axios.delete(`${API_BASE_URL}/departments/${id}`),
  getDepartmentById: (id) => axios.get(`${API_BASE_URL}/departments/${id}`),
};

export const PerformanceApi = {
  getAllReviews: () => axios.get(`${API_BASE_URL}/performance`),
  createReview: (data) => axios.post(`${API_BASE_URL}/performance`, data),
  updateReview: (id, data) => axios.put(`${API_BASE_URL}/performance/${id}`, data),
  deleteReview: (id) => axios.delete(`${API_BASE_URL}/performance/${id}`),
  getReviewsByEmployeeId: (employeeId) =>
    axios.get(`${API_BASE_URL}/performance/employee/${employeeId}`),
  getAnalytics: () => axios.get(`${API_BASE_URL}/performance/analytics`),
};

export const PayrollApi = {
  getAllPayrolls: () => axios.get(`${API_BASE_URL}/payroll`),
  createPayroll: (data) => axios.post(`${API_BASE_URL}/payroll`, data),
  updatePayroll: (id, data) => axios.put(`${API_BASE_URL}/payroll/${id}`, data),
  deletePayroll: (id) => axios.delete(`${API_BASE_URL}/payroll/${id}`),
  getPayrollByEmployeeId: (employeeId) =>
    axios.get(`${API_BASE_URL}/payroll/employee/${employeeId}`),
  getPayrollByMonthYear: (month, year) =>
    axios.get(`${API_BASE_URL}/payroll/month/${month}/${year}`),
  processPayroll: (id) => axios.patch(`${API_BASE_URL}/payroll/${id}/process`),
  getAnalytics: () => axios.get(`${API_BASE_URL}/payroll/analytics`),
};

export const SkillApi = {
  getAllSkills: () => axios.get(`${API_BASE_URL}/skills`),
  addSkill: (data) => axios.post(`${API_BASE_URL}/skills`, data),
  updateSkill: (id, data) => axios.put(`${API_BASE_URL}/skills/${id}`, data),
  deleteSkill: (id) => axios.delete(`${API_BASE_URL}/skills/${id}`),
  getSkillsByEmployeeId: (employeeId) =>
    axios.get(`${API_BASE_URL}/skills/employee/${employeeId}`),
  addCertification: (id, data) =>
    axios.post(`${API_BASE_URL}/skills/${id}/certification`, data),
  addTraining: (id, data) => axios.post(`${API_BASE_URL}/skills/${id}/training`, data),
  endorseSkill: (id) => axios.patch(`${API_BASE_URL}/skills/${id}/endorse`),
};

export const JobOpeningApi = {
  getAllJobOpenings: () => axios.get(`${API_BASE_URL}/job-openings`),
  getActiveJobOpenings: () => axios.get(`${API_BASE_URL}/job-openings/active`),
  createJobOpening: (data) => axios.post(`${API_BASE_URL}/job-openings`, data),
  updateJobOpening: (id, data) => axios.put(`${API_BASE_URL}/job-openings/${id}`, data),
  deleteJobOpening: (id) => axios.delete(`${API_BASE_URL}/job-openings/${id}`),
  getJobOpeningById: (id) => axios.get(`${API_BASE_URL}/job-openings/${id}`),
  closeJobOpening: (id) => axios.patch(`${API_BASE_URL}/job-openings/${id}/close`),
};

export const JobApplicationApi = {
  getAllApplications: () => axios.get(`${API_BASE_URL}/job-applications`),
  createApplication: (data) => axios.post(`${API_BASE_URL}/job-applications`, data),
  updateApplicationStatus: (id, data) =>
    axios.put(`${API_BASE_URL}/job-applications/${id}`, data),
  deleteApplication: (id) => axios.delete(`${API_BASE_URL}/job-applications/${id}`),
  getApplicationsByJobOpeningId: (jobOpeningId) =>
    axios.get(`${API_BASE_URL}/job-applications/job/${jobOpeningId}`),
  sendOffer: (id, data) => axios.patch(`${API_BASE_URL}/job-applications/${id}/offer`, data),
  rejectApplication: (id) =>
    axios.patch(`${API_BASE_URL}/job-applications/${id}/reject`),
  getAnalytics: () => axios.get(`${API_BASE_URL}/job-applications/analytics`),
};

export const AnnouncementApi = {
  getAllAnnouncements: () => axios.get(`${API_BASE_URL}/announcements`),
  getActiveAnnouncements: () => axios.get(`${API_BASE_URL}/announcements/active`),
  createAnnouncement: (data) => axios.post(`${API_BASE_URL}/announcements`, data),
  updateAnnouncement: (id, data) => axios.put(`${API_BASE_URL}/announcements/${id}`, data),
  deleteAnnouncement: (id) => axios.delete(`${API_BASE_URL}/announcements/${id}`),
  getAnnouncementById: (id) => axios.get(`${API_BASE_URL}/announcements/${id}`),
  deactivateAnnouncement: (id) =>
    axios.patch(`${API_BASE_URL}/announcements/${id}/deactivate`),
};

export const AiApi = {
  generateAnnouncement: (data) => axios.post(`${API_BASE_URL}/ai/announcement`, data),
  generateJobDescription: (data) => axios.post(`${API_BASE_URL}/ai/job-description`, data),
  summarizeText: (data) => axios.post(`${API_BASE_URL}/ai/document-summary`, data),
};

export const DocumentApi = {
  getAllDocuments: () => axios.get(`${API_BASE_URL}/documents`),
  getDocumentsByType: (type) => axios.get(`${API_BASE_URL}/documents/type/${type}`),
  uploadDocument: (data) => axios.post(`${API_BASE_URL}/documents`, data),
  updateDocument: (id, data) => axios.put(`${API_BASE_URL}/documents/${id}`, data),
  deleteDocument: (id) => axios.delete(`${API_BASE_URL}/documents/${id}`),
  getDocumentById: (id) => axios.get(`${API_BASE_URL}/documents/${id}`),
  searchDocuments: (query) => axios.get(`${API_BASE_URL}/documents/search?query=${query}`),
  deactivateDocument: (id) => axios.patch(`${API_BASE_URL}/documents/${id}/deactivate`),
};

export const AttendanceAnalyticsApi = {
  getAllAnalytics: () => axios.get(`${API_BASE_URL}/attendance-analytics`),
  createAnalytics: (data) => axios.post(`${API_BASE_URL}/attendance-analytics`, data),
  updateAnalytics: (id, data) =>
    axios.put(`${API_BASE_URL}/attendance-analytics/${id}`, data),
  deleteAnalytics: (id) => axios.delete(`${API_BASE_URL}/attendance-analytics/${id}`),
  getAnalyticsByEmployeeId: (employeeId) =>
    axios.get(`${API_BASE_URL}/attendance-analytics/employee/${employeeId}`),
  getAnalyticsByMonthYear: (month, year) =>
    axios.get(`${API_BASE_URL}/attendance-analytics/month/${month}/${year}`),
  getAttendanceSummary: () =>
    axios.get(`${API_BASE_URL}/attendance-analytics/summary`),
};

export const ReportApi = {
  getAllReports: () => axios.get(`${API_BASE_URL}/reports`),
  getAnalyticsOverview: () => axios.get(`${API_BASE_URL}/reports/overview`),
  createReport: (data) => axios.post(`${API_BASE_URL}/reports`, data),
  updateReport: (id, data) => axios.put(`${API_BASE_URL}/reports/${id}`, data),
  deleteReport: (id) => axios.delete(`${API_BASE_URL}/reports/${id}`),
  getReportById: (id) => axios.get(`${API_BASE_URL}/reports/${id}`),
  getReportsByType: (type) => axios.get(`${API_BASE_URL}/reports/type/${type}`),
};
