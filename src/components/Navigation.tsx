import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faSignOutAlt, faTruck, faSignInAlt, 
  faUserPlus, faCog, faUserTie 
} from '@fortawesome/free-solid-svg-icons';

export const Navigation = () => {
  const { user, logout, isAdmin, isEmployee } = useAuthContext();
  const navigate = useNavigate();

  // Отладочный вывод для проверки пользователя и его роли
  console.log('Navigation user data:', { 
    user, 
    userJSON: JSON.stringify(user),
    role: user?.role,
    role_id: user?.role_id,
    isAdmin: user && isAdmin(),
    isEmployee: user && isEmployee()
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <FontAwesomeIcon icon={faTruck} className="me-2" />
          МитсоАссенизатор
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Главная</Nav.Link>
            <Nav.Link as={Link} to="/services">Услуги</Nav.Link>
            
            {/* Панель сотрудника - видна сотрудникам и админам */}
            {user && (isEmployee() || isAdmin()) && (
              <Nav.Link as={Link} to="/employee">
                <FontAwesomeIcon icon={faUserTie} className="me-1" />
                Панель сотрудника
              </Nav.Link>
            )}
            
            {/* Админ-панель - видна только админам */}
            {user && isAdmin() && (
              <Nav.Link as={Link} to="/admin">
                <FontAwesomeIcon icon={faCog} className="me-1" />
                Админ-панель
              </Nav.Link>
            )}
          </Nav>
          <Nav className="d-flex align-items-center">
            {user ? (
              <>
                <Nav.Link as={Link} to="/profile" className="me-3">
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  {user.username}
                  <span className="ms-1 text-white-50">
                    ({isAdmin() ? 'Админ' : 
                      isEmployee() ? 'Сотрудник' : 
                      'Пользователь'})
                  </span>
                </Nav.Link>
                <Button 
                  variant="outline-light" 
                  onClick={handleLogout}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="me-2">
                  <Button 
                    variant="outline-light"
                  >
                    <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                    Войти
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    variant="light"
                    className="text-primary fw-bold"
                  >
                    <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                    Регистрация
                  </Button>
                </Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}; 