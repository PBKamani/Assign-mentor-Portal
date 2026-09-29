import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';

// Public Page
import Login from '../pages/Login';

// User Study Pages (Subject -> Assignment -> Question)
import UserDashboard from '../pages/user/UserDashboard';
import SubjectPage from '../pages/user/SubjectPage';
import AssignmentPage from '../pages/user/AssignmentPage';
import QuestionPage from '../pages/user/QuestionPage';

// Admin Pages (No Units)
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageSubjects from '../pages/admin/ManageSubjects';
import ManageAssignments from '../pages/admin/ManageAssignments';
import ManageQuestions from '../pages/admin/ManageQuestions';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected User Study Routes (Wrapped in MainLayout) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="subjects/:subjectId" element={<SubjectPage />} />
        <Route path="assignments/:assignmentId" element={<AssignmentPage />} />
        <Route path="assignments/:assignmentId/questions/:questionId" element={<QuestionPage />} />
      </Route>

      {/* Protected Admin Routes (Guarded with requireAdmin) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin={true}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="subjects" element={<ManageSubjects />} />
        <Route path="assignments" element={<ManageAssignments />} />
        <Route path="questions" element={<ManageQuestions />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
