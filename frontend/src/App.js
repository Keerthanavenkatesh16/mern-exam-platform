import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

import TakeExam from './pages/exam/TakeExam';
import ExamResult from './pages/exam/ExamResult';
import CreateExam from './pages/exam/CreateExam';
import ExamAttempts from './pages/exam/ExamAttempts';
import ExamAnalytics from './pages/exam/ExamAnalytics';
import QuestionBankList from './pages/questionBank/QuestionBankList';

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'faculty') return <Navigate to="/faculty" replace />;
  return <Navigate to="/student" replace />;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Student routes */}
            <Route
              path="/student"
              element={
                <PrivateRoute roles={['student']}>
                  <StudentDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/student/exam/:examId"
              element={
                <PrivateRoute roles={['student']}>
                  <TakeExam />
                </PrivateRoute>
              }
            />
            <Route
              path="/student/results"
              element={
                <PrivateRoute roles={['student']}>
                  <ExamResult />
                </PrivateRoute>
              }
            />

            {/* Faculty routes */}
            <Route
              path="/faculty"
              element={
                <PrivateRoute roles={['faculty']}>
                  <FacultyDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/faculty/exams/new"
              element={
                <PrivateRoute roles={['faculty']}>
                  <CreateExam />
                </PrivateRoute>
              }
            />
            <Route
              path="/faculty/exams/:examId/attempts"
              element={
                <PrivateRoute roles={['faculty', 'admin']}>
                  <ExamAttempts />
                </PrivateRoute>
              }
            />
            <Route
              path="/faculty/exams/:examId/analytics"
              element={
                <PrivateRoute roles={['faculty', 'admin']}>
                  <ExamAnalytics />
                </PrivateRoute>
              }
            />
            <Route
              path="/faculty/question-banks"
              element={
                <PrivateRoute roles={['faculty', 'admin']}>
                  <QuestionBankList />
                </PrivateRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <PrivateRoute roles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
