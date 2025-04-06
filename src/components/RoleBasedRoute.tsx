import { Navigate } from 'react-router-dom';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { useAuthContext } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const RoleBasedRoute = ({ children, allowedRoles }: RoleBasedRouteProps) => {
  const { isAuthenticated, loading, isAdmin, isEmployee } = useAuthContext();

  // Добавляем отладочный вывод
  console.log('RoleBasedRoute:', { allowedRoles, isAdmin: isAdmin(), isEmployee: isEmployee() });

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
        <p className="mt-2">Проверка прав доступа...</p>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Проверка на админа или сотрудника в зависимости от разрешенных ролей
  const hasAccess = 
    (allowedRoles.includes('admin') && isAdmin()) || 
    (allowedRoles.includes('employee') && isEmployee());

  // Пользователь аутентифицирован, но не имеет необходимой роли
  if (!hasAccess) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Доступ запрещен</Alert.Heading>
          <p>
            У вас недостаточно прав для доступа к этой странице. 
            Эта страница доступна только для пользователей с ролями: {allowedRoles.join(', ')}
          </p>
        </Alert>
      </Container>
    );
  }

  return <>{children}</>;
}; 