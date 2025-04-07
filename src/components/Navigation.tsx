import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faSignOutAlt, faTruck, faSignInAlt, 
  faUserPlus, faCog, faUserTie, faSun, faMoon
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../contexts/ThemeContext';
// @ts-ignore
import iconWhite from '../assets/images/icon white.png';
// @ts-ignore

export const Navigation = () => {
  const { user, logout, isAdmin, isEmployee } = useAuthContext();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

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
    <Navbar bg="primary" variant="dark" expand="lg" sticky="top" className="navbar-fixed">
      <Container>
        <Navbar.Brand as={Link} to="/" data-aos="fade-right">
          <img 
            src={iconWhite} 
            alt="Логотип" 
            className="me-2"
            style={{ height: '60px', width: 'auto' }} 
          />
          МитсоАссенизатор
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        {/* Кнопка переключения темы в правом верхнем углу */}
        <Button 
          variant={theme === 'light' ? 'outline-light' : 'dark'} 
          className="position-absolute top-0 end-0 m-2 rounded-circle p-2" 
          onClick={toggleTheme}
          size="sm"
          style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1030 }}
          aria-label={theme === 'light' ? 'Включить темную тему' : 'Включить светлую тему'}
        >
          <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
        </Button>
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto d-flex flex-nowrap" data-aos="fade-down" data-aos-delay="100">
            <Nav.Link as={Link} to="/" className="py-1 px-2 me-1">Главная</Nav.Link>
            <Nav.Link as={Link} to="/services" className="py-1 px-2 me-1">Услуги</Nav.Link>
            <Nav.Link as={Link} to="/about" className="py-1 px-2 me-1">О компании</Nav.Link>
            <Nav.Link as={Link} to="/faq" className="py-1 px-2 me-1">Частые вопросы</Nav.Link>
            
            {/* Панель сотрудника - видна сотрудникам и админам */}
            {user && (isEmployee() || isAdmin()) && (
              <Nav.Link as={Link} to="/employee" className="py-1 px-2 me-1">
                <FontAwesomeIcon icon={faUserTie} className="me-1" />
                <span className="d-none d-md-inline">Сотрудник</span>
              </Nav.Link>
            )}
            
            {/* Админ-панель - видна только админам */}
            {user && isAdmin() && (
              <Nav.Link as={Link} to="/admin" className="py-1 px-2 me-1">
                <FontAwesomeIcon icon={faCog} className="me-1" />
                <span className="d-none d-md-inline">Админ</span>
              </Nav.Link>
            )}
          </Nav>
          <Nav className="d-flex align-items-center flex-nowrap" data-aos="fade-down" data-aos-delay="200">
            {user ? (
              <>
                <Nav.Link as={Link} to="/profile" className="me-2 text-nowrap">
                  <FontAwesomeIcon icon={faUser} className="me-1" />
                  <span className="d-none d-lg-inline">{user.username}</span>
                  <span className="d-none d-xl-inline ms-1 text-white-50">
                    ({isAdmin() ? 'Админ' : 
                      isEmployee() ? 'Сотрудник' : 
                      'Пользователь'})
                  </span>
                </Nav.Link>
                <Button 
                  variant="outline-light" 
                  onClick={handleLogout}
                  size="sm"
                  className="mx-1"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  <span className="d-none d-sm-inline ms-1">Выйти</span>
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="me-2">
                  <Button 
                    variant="outline-light"
                    size="sm"
                  >
                    <FontAwesomeIcon icon={faSignInAlt} />
                    <span className="d-none d-sm-inline ms-1">Войти</span>
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    variant="light"
                    className="text-primary fw-bold"
                    size="sm"
                  >
                    <FontAwesomeIcon icon={faUserPlus} />
                    <span className="d-none d-sm-inline ms-1">Регистрация</span>
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