import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProtectedRoute } from './components/common/ProtectedRoute.jsx';
import { Login } from './pages/auth/Login.jsx';
import { Register } from './pages/auth/Register.jsx';
import { Overview } from './pages/dashboard/Overview.jsx';
import { OrgProvider } from './context/OrgContext.jsx';
import { ProjectBoard } from './pages/projects/ProjectBoard.jsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OrgProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Overview />
              </ProtectedRoute>
            }
          />
          <Route
              path="/projects/:projectId"
              element={
                <ProtectedRoute>
                  <ProjectBoard />
                </ProtectedRoute>
              }
            />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </OrgProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;