import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { API_URL } from '../../config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faClipboardList, faCog, faUserCog } from '@fortawesome/free-solid-svg-icons';

export const AdminPanel = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Добавляем логирование при загрузке компонента
  console.log('AdminPanel component loaded');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Получаем токен из localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Токен авторизации не найден');
          setLoading(false);
          return;
        }
        
        // Параллельно получаем пользователей и заказы
        const [usersResponse, ordersResponse] = await Promise.all([
          axios.get(`${API_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/orders`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setUsers(usersResponse.data);
        setOrders(ordersResponse.data);
        setError(null);
      } catch (err: any) {
        console.error('Ошибка при загрузке данных:', err);
        setError(err.response?.data?.error || 'Ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleChangeRole = async (userId: number, newRoleId: number) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.patch(
        `${API_URL}/admin/users/${userId}/role`, 
        { role_id: newRoleId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Обновляем список пользователей после успешного изменения роли
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: response.data.role } 
          : user
      ));
      
    } catch (err: any) {
      console.error('Ошибка при изменении роли:', err);
      alert(err.response?.data?.error || 'Ошибка при изменении роли пользователя');
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
        <p className="mt-2">Загрузка данных панели администратора...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger">
          <h4>Ошибка</h4>
          <p>{error}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">
        <FontAwesomeIcon icon={faCog} className="me-2" />
        Панель администратора
      </h1>
      
      <Row>
        {/* Статистика */}
        <Col md={12} className="mb-4">
          <Row>
            <Col md={4} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <FontAwesomeIcon icon={faUsers} size="3x" className="text-primary mb-3" />
                  <Card.Title>Пользователи</Card.Title>
                  <h3>{users.length}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <FontAwesomeIcon icon={faClipboardList} size="3x" className="text-success mb-3" />
                  <Card.Title>Всего заказов</Card.Title>
                  <h3>{orders.length}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <FontAwesomeIcon icon={faUserCog} size="3x" className="text-warning mb-3" />
                  <Card.Title>Сотрудники</Card.Title>
                  <h3>{users.filter(user => user.role === 'employee').length}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
        
        {/* Список пользователей */}
        <Col md={12} className="mb-4">
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                Управление пользователями
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Имя пользователя</th>
                      <th>Email</th>
                      <th>Роль</th>
                      <th>Дата регистрации</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <Badge bg={
                            user.role === 'admin' ? 'danger' : 
                            user.role === 'employee' ? 'warning' : 
                            'primary'
                          }>
                            {user.role === 'admin' ? 'Администратор' : 
                             user.role === 'employee' ? 'Сотрудник' : 
                             'Пользователь'}
                          </Badge>
                        </td>
                        <td>{new Date(user.created_at).toLocaleString()}</td>
                        <td>
                          <div className="d-flex gap-2">
                            {user.role !== 'admin' && (
                              <Button 
                                size="sm" 
                                variant="outline-danger"
                                onClick={() => handleChangeRole(user.id, 1)}
                              >
                                Назначить админом
                              </Button>
                            )}
                            {user.role !== 'employee' && (
                              <Button 
                                size="sm" 
                                variant="outline-warning"
                                onClick={() => handleChangeRole(user.id, 2)}
                              >
                                Назначить сотрудником
                              </Button>
                            )}
                            {user.role !== 'guest' && (
                              <Button 
                                size="sm" 
                                variant="outline-primary"
                                onClick={() => handleChangeRole(user.id, 3)}
                              >
                                Назначить пользователем
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}; 