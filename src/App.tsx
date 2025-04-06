import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { Navigation } from './components/Navigation';
import { Home } from './components/Home';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { Services } from './components/Services';
import { NotFound } from './components/NotFound';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleBasedRoute } from './components/RoleBasedRoute';
import { Profile } from './components/Profile';
import { AdminPanel } from './components/admin/AdminPanel';
import { EmployeePanel } from './components/employee/EmployeePanel';
import { About } from './components/About';

function App() {
  // Добавляем логирование при инициализации приложения
  console.log('App initialized');
  
  return (
    <AuthProvider>
      <Navigation />
      <Container fluid className="p-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/about" element={<About />} />
          
          {/* Маршрут для админ-панели - только для пользователей с ролью admin */}
          <Route path="/admin" element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <AdminPanel />
            </RoleBasedRoute>
          } />
          
          {/* Маршрут для панели сотрудника - для пользователей с ролями admin и employee */}
          <Route path="/employee" element={
            <RoleBasedRoute allowedRoles={['admin', 'employee']}>
              <EmployeePanel />
            </RoleBasedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>
    </AuthProvider>
  );
}

export default App; 