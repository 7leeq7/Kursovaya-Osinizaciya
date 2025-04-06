import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Tab, Nav, Badge, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt, 
  faEdit, 
  faCheck, 
  faTimes,
  faKey,
  faUserCircle,
  faCalendarAlt,
  faSignOutAlt,
  faPercent,
  faShoppingCart,
  faClock,
  faBan,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { API_URL } from '../config';
import { useNavigate, useLocation } from 'react-router-dom';
import AddressSearch from './AddressSearch';

interface UserData {
  id: number;
  username: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  hasDiscount: boolean;
  discountAmount: number;
}

interface Order {
  id: number;
  service_id: number;
  status: string;
  discount_applied: boolean;
  final_price: number;
  original_price: number;
  created_at: string;
  scheduled_time: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  address: string;
}

// Обновляем маппинг статусов заказов на русский язык
const orderStatusMap: { [key: string]: { label: string; color: string; } } = {
  'pending': { label: 'В обработке', color: 'warning' },
  'confirmed': { label: 'Подтвержден', color: 'info' },
  'completed': { label: 'Выполнен', color: 'success' },
  'cancelled': { label: 'Отменен', color: 'danger' }
};

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    address: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [activeTab, setActiveTab] = useState(
    (location.state as any)?.activeTab || 'profile'
  );
  const [message, setMessage] = useState({ type: '', text: '' });
  const [orders, setOrders] = useState<Order[]>([]);
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);
  const [orderActionStatus, setOrderActionStatus] = useState({ 
    loading: false, 
    error: '', 
    success: '' 
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUserData(response.data);
        setFormData({
          username: response.data.username,
          email: response.data.email,
          phone: response.data.phone || '',
          address: response.data.address || ''
        });
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        setMessage({
          type: 'danger',
          text: error.response?.data?.error || 'Ошибка при загрузке данных профиля'
        });
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(`${API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Токен не найден');

      await axios.put(
        `${API_URL}/profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserData(prev => ({
        ...prev!,
        ...formData
      }));
      setIsEditing(false);
      setMessage({
        type: 'success',
        text: 'Профиль успешно обновлен'
      });
    } catch (error) {
      setMessage({
        type: 'danger',
        text: 'Ошибка при обновлении профиля'
      });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({
        type: 'danger',
        text: 'Пароли не совпадают'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Токен не найден');

      await axios.put(
        `${API_URL}/profile/password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setMessage({
        type: 'success',
        text: 'Пароль успешно изменен'
      });
    } catch (error) {
      setMessage({
        type: 'danger',
        text: 'Ошибка при изменении пароля'
      });
    }
  };

  // Добавляем функцию отмены заказа
  const handleCancelOrder = async (orderId: number) => {
    try {
      setOrderActionStatus({ loading: true, error: '', success: '' });
      setCancellingOrderId(orderId);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен не найден');
      }

      const response = await axios.patch(
        `${API_URL}/orders/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Обновляем состояние заказа в списке
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'cancelled' } 
          : order
      ));

      setOrderActionStatus({ 
        loading: false, 
        error: '', 
        success: 'Заказ успешно отменен' 
      });

      // Очищаем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setOrderActionStatus(prev => ({ ...prev, success: '' }));
      }, 3000);
    } catch (error: any) {
      console.error('Ошибка при отмене заказа:', error);
      setOrderActionStatus({ 
        loading: false, 
        error: error.response?.data?.error || 'Ошибка при отмене заказа', 
        success: '' 
      });
    } finally {
      setCancellingOrderId(null);
    }
  };

  // Проверяем, можно ли отменить заказ
  const canCancelOrder = (order: Order) => {
    return order.status === 'pending' || order.status === 'confirmed';
  };

  if (isLoading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <p className="mt-2">Загрузка данных профиля...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {message.text && (
        <Alert variant={message.type} onClose={() => setMessage({ type: '', text: '' })} dismissible>
          {message.text}
        </Alert>
      )}

      <Row>
        <Col lg={4} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body className="text-center">
              <div className="mb-4">
                <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
                  <FontAwesomeIcon icon={faUserCircle} size="4x" className="text-primary" />
                </div>
              </div>
              <h4>{userData?.username}</h4>
              <p className="text-muted mb-4">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                Дата регистрации: {new Date(userData?.created_at || '').toLocaleDateString('ru-RU')}
              </p>
              <Button variant="outline-danger" onClick={handleLogout} className="w-100">
                <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                Выйти
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'profile')}>
                <Nav variant="pills" className="mb-4">
                  <Nav.Item>
                    <Nav.Link eventKey="profile" className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      Профиль
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="orders" className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                      Мои заказы
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="password" className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faKey} className="me-2" />
                      Изменить пароль
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content>
                  <Tab.Pane eventKey="profile">
                    {!isEditing ? (
                      <div className="p-3">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h3 className="mb-0">Информация профиля</h3>
                          <Button variant="primary" onClick={() => setIsEditing(true)}>
                            <FontAwesomeIcon icon={faEdit} className="me-2" />
                            Редактировать
                          </Button>
                        </div>

                        <Row className="g-4">
                          <Col md={6}>
                            <Card className="h-100 border-0 bg-light">
                              <Card.Body>
                                <h6 className="text-muted mb-3">Информация о профиле</h6>
                                <p className="mb-3">
                                  <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
                                  <strong>Имя:</strong> {userData?.username}
                                </p>
                                <p className="mb-3">
                                  <FontAwesomeIcon icon={faEnvelope} className="me-2 text-primary" />
                                  <strong>Email:</strong> {userData?.email}
                                </p>
                                <p className="mb-0">
                                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
                                  <strong>Дата регистрации:</strong>
                                  <br />
                                  <span className="ms-4">
                                    {userData?.created_at ? new Date(userData.created_at).toLocaleString() : 'Не указана'}
                                  </span>
                                </p>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col md={6}>
                            <Card className="h-100 border-0 bg-light">
                              <Card.Body>
                                <h6 className="text-muted mb-3">Контактная информация</h6>
                                <p className="mb-3">
                                  <FontAwesomeIcon icon={faPhone} className="me-2 text-primary" />
                                  <strong>Телефон:</strong>
                                  <br />
                                  <span className="ms-4">{userData?.phone || 'Не указан'}</span>
                                </p>
                                <p className="mb-0">
                                  <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-primary" />
                                  <strong>Адрес:</strong>
                                  <br />
                                  <span className="ms-4">{userData?.address || 'Не указан'}</span>
                                </p>
                              </Card.Body>
                            </Card>
                          </Col>
                        </Row>
                      </div>
                    ) : (
                      <Form onSubmit={handleProfileSubmit} className="p-3">
                        <Row className="g-4">
                          <Col md={6}>
                            <Card className="border-0 bg-light">
                              <Card.Body>
                                <h6 className="text-muted mb-3">Основная информация</h6>
                                <Form.Group className="mb-3">
                                  <Form.Label>
                                    <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
                                    Имя пользователя
                                  </Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleProfileChange}
                                    required
                                  />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                  <Form.Label>
                                    <FontAwesomeIcon icon={faEnvelope} className="me-2 text-primary" />
                                    Email
                                  </Form.Label>
                                  <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleProfileChange}
                                    required
                                  />
                                </Form.Group>
                              </Card.Body>
                            </Card>
                          </Col>

                          <Col md={6}>
                            <Card className="border-0 bg-light">
                              <Card.Body>
                                <h6 className="text-muted mb-3">Контактная информация</h6>
                                <Form.Group className="mb-3">
                                  <Form.Label>
                                    <FontAwesomeIcon icon={faPhone} className="me-2 text-primary" />
                                    Телефон
                                  </Form.Label>
                                  <Form.Control
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleProfileChange}
                                    placeholder="Введите номер телефона"
                                  />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                  <Form.Label>
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-primary" />
                                    Адрес
                                  </Form.Label>
                                  <AddressSearch
                                    value={formData.address}
                                    onChange={(address) => setFormData(prev => ({ ...prev, address }))}
                                  />
                                  
                                </Form.Group>
                              </Card.Body>
                            </Card>
                          </Col>
                        </Row>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                          <Button variant="secondary" onClick={() => setIsEditing(false)}>
                            <FontAwesomeIcon icon={faTimes} className="me-2" />
                            Отмена
                          </Button>
                          <Button variant="success" type="submit">
                            <FontAwesomeIcon icon={faCheck} className="me-2" />
                            Сохранить
                          </Button>
                        </div>
                      </Form>
                    )}
                  </Tab.Pane>

                  <Tab.Pane eventKey="orders">
                    <div className="p-3">
                      <h3 className="mb-4">История заказов</h3>
                      
                      {orderActionStatus.error && (
                        <Alert variant="danger" dismissible onClose={() => setOrderActionStatus(prev => ({ ...prev, error: '' }))}>
                          {orderActionStatus.error}
                        </Alert>
                      )}
                      
                      {orderActionStatus.success && (
                        <Alert variant="success" dismissible onClose={() => setOrderActionStatus(prev => ({ ...prev, success: '' }))}>
                          {orderActionStatus.success}
                        </Alert>
                      )}
                      
                      {orders.length === 0 ? (
                        <Alert variant="info">
                          У вас пока нет заказов
                        </Alert>
                      ) : (
                        <Row xs={1} md={2} className="g-4">
                          {orders.map(order => (
                            <Col key={order.id}>
                              <Card className="h-100 shadow-sm">
                                <Card.Body>
                                  <Card.Title className="d-flex justify-content-between align-items-center mb-3">
                                    <span>{order.title}</span>
                                    <Badge bg={orderStatusMap[order.status]?.color || 'secondary'}>
                                      {orderStatusMap[order.status]?.label || order.status}
                                    </Badge>
                                  </Card.Title>
                                  <Card.Text>
                                    <p className="mb-2">{order.description}</p>
                                    <small className="text-muted d-block mb-2">
                                      <FontAwesomeIcon icon={faClock} className="me-2" />
                                      Длительность: {order.duration}
                                    </small>
                                    <small className="text-muted d-block mb-2">
                                      <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                                      Запланировано на: {new Date(order.scheduled_time).toLocaleString('ru-RU')}
                                    </small>
                                    <small className="text-muted d-block mb-2">
                                      <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                                      Адрес: {order.address || 'Не указан'}
                                    </small>
                                    <strong className="d-block mt-3">
                                      Итоговая стоимость: {order.final_price} руб.
                                    </strong>
                                  </Card.Text>
                                  
                                  {canCancelOrder(order) && (
                                    <div className="mt-3">
                                      <Button 
                                        variant="outline-danger" 
                                        size="sm" 
                                        onClick={() => handleCancelOrder(order.id)}
                                        disabled={cancellingOrderId === order.id}
                                      >
                                        {cancellingOrderId === order.id ? (
                                          <>
                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                            Отмена заказа...
                                          </>
                                        ) : (
                                          <>
                                            <FontAwesomeIcon icon={faBan} className="me-2" />
                                            Отменить заказ
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  )}
                                  
                                  {order.status === 'cancelled' && (
                                    <Alert variant="secondary" className="mt-3 mb-0 py-2">
                                      <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                                      Заказ был отменен
                                    </Alert>
                                  )}
                                </Card.Body>
                                <Card.Footer className="text-muted">
                                  <small>
                                    Заказ создан: {new Date(order.created_at).toLocaleString('ru-RU')}
                                  </small>
                                </Card.Footer>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      )}
                    </div>
                  </Tab.Pane>

                  <Tab.Pane eventKey="password">
                    <Form onSubmit={handlePasswordSubmit} className="p-3">
                      <Card className="border-0 bg-light">
                        <Card.Body>
                          <h3 className="mb-4">Изменение пароля</h3>
                          
                          <Row className="justify-content-center">
                            <Col md={8}>
                              <Form.Group className="mb-3">
                                <Form.Label>
                                  <FontAwesomeIcon icon={faKey} className="me-2 text-primary" />
                                  Текущий пароль
                                </Form.Label>
                                <Form.Control
                                  type="password"
                                  name="currentPassword"
                                  value={passwordData.currentPassword}
                                  onChange={handlePasswordChange}
                                  required
                                />
                              </Form.Group>

                              <Form.Group className="mb-3">
                                <Form.Label>
                                  <FontAwesomeIcon icon={faKey} className="me-2 text-primary" />
                                  Новый пароль
                                </Form.Label>
                                <Form.Control
                                  type="password"
                                  name="newPassword"
                                  value={passwordData.newPassword}
                                  onChange={handlePasswordChange}
                                  required
                                />
                              </Form.Group>

                              <Form.Group className="mb-3">
                                <Form.Label>
                                  <FontAwesomeIcon icon={faKey} className="me-2 text-primary" />
                                  Подтвердите новый пароль
                                </Form.Label>
                                <Form.Control
                                  type="password"
                                  name="confirmPassword"
                                  value={passwordData.confirmPassword}
                                  onChange={handlePasswordChange}
                                  required
                                />
                              </Form.Group>

                              <div className="d-grid">
                                <Button variant="primary" type="submit">
                                  <FontAwesomeIcon icon={faCheck} className="me-2" />
                                  Изменить пароль
                                </Button>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Form>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export { Profile }; 