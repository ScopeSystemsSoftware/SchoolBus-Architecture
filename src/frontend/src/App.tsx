import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SchoolsPage from './pages/SchoolsPage';
import SchoolDetailPage from './pages/SchoolDetailPage';
import StudentsPage from './pages/StudentsPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f57c00',
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate replace to="/schools" />} />
            <Route path="schools" element={<SchoolsPage />} />
            <Route path="schools/:id" element={<SchoolDetailPage />} />
            <Route path="students" element={<StudentsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 