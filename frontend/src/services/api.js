const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Helper to get backend origin for static uploads
export const getAssetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/api/upload/static/')) {
    const origin = API_BASE_URL.replace(/\/api\/?$/, '');
    return `${origin}${url}`;
  }
  return url;
};

// Generic fetch wrapper with Bearer token injection
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('assignmentor-token');
  const headers = {
    ...(options.headers || {})
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.message || data?.detail || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }
    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

export const api = {
  // Auth
  verifyToken: (id_token) => request('/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ id_token })
  }),
  getMe: () => request('/auth/me'),
  login: (username, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  }),

  // Stats (Subjects, Assignments, Questions)
  getStats: () => request('/stats'),

  // Subjects
  getSubjects: () => request('/subjects'),
  getSubject: (id) => request(`/subjects/${id}`),
  getSubjectAssignments: (id) => request(`/subjects/${id}/assignments`),
  createSubject: (data) => request('/subjects', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateSubject: (id, data) => request(`/subjects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteSubject: (id) => request(`/subjects/${id}`, {
    method: 'DELETE'
  }),

  // Assignments (Belong directly to Subject)
  getAssignments: (subjectId) => {
    const query = subjectId ? `?subjectId=${encodeURIComponent(subjectId)}` : '';
    return request(`/assignments${query}`);
  },
  getAssignment: (id) => request(`/assignments/${id}`),
  getAssignmentQuestions: (id) => request(`/assignments/${id}/questions`),
  createAssignment: (data) => request('/assignments', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateAssignment: (id, data) => request(`/assignments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteAssignment: (id) => request(`/assignments/${id}`, {
    method: 'DELETE'
  }),

  // Questions (Belong directly to Assignment)
  getQuestions: (assignmentId, subjectId) => {
    const params = new URLSearchParams();
    if (assignmentId) params.append('assignmentId', assignmentId);
    if (subjectId) params.append('subjectId', subjectId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/questions${query}`);
  },
  getQuestion: (id) => request(`/questions/${id}`),
  createQuestion: (data) => request('/questions', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateQuestion: (id, data) => request(`/questions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteQuestion: (id) => request(`/questions/${id}`, {
    method: 'DELETE'
  }),

  // Diagrams (Outside Question Diagram & Inside Answer Diagram)
  uploadQuestionDiagram: (formData) => request('/upload/question-diagram', {
    method: 'POST',
    body: formData
  }),
  deleteQuestionDiagram: (questionId, imageUrl) => request('/upload/question-diagram', {
    method: 'DELETE',
    body: JSON.stringify({ questionId, imageUrl })
  }),
  uploadAnswerDiagram: (formData) => request('/upload/answer-diagram', {
    method: 'POST',
    body: formData
  }),
  deleteAnswerDiagram: (questionId, imageUrl) => request('/upload/answer-diagram', {
    method: 'DELETE',
    body: JSON.stringify({ questionId, imageUrl })
  }),

  // Search
  search: (query) => request(`/search?q=${encodeURIComponent(query)}`)
};

export default api;
