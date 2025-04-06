import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Form } from 'react-bootstrap';
import axios from 'axios';
import { API_URL } from '../../config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faUserTie, faCheck, faTimes, faPause, faFileAlt } from '@fortawesome/free-solid-svg-icons';

export const EmployeePanel = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

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
        
        // Получаем все заказы
        const response = await axios.get(`${API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setOrders(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Ошибка при загрузке заказов:', err);
        setError(err.response?.data?.error || 'Ошибка при загрузке заказов');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `${API_URL}/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Обновляем список заказов после успешного изменения статуса
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus } 
          : order
      ));
      
    } catch (err: any) {
      console.error('Ошибка при изменении статуса заказа:', err);
      alert(err.response?.data?.error || 'Ошибка при изменении статуса заказа');
    }
  };

  // Фильтруем заказы в зависимости от выбранного фильтра
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  // Получаем количество заказов по статусам
  const pendingCount = orders.filter(order => order.status === 'pending').length;
  const confirmedCount = orders.filter(order => order.status === 'confirmed').length;
  const completedCount = orders.filter(order => order.status === 'completed').length;
  const cancelledCount = orders.filter(order => order.status === 'cancelled').length;

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
        <p className="mt-2">Загрузка данных панели сотрудника...</p>
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
        <FontAwesomeIcon icon={faUserTie} className="me-2" />
        Панель сотрудника
      </h1>
      
      <Row>
        {/* Статистика заказов */}
        <Col md={12} className="mb-4">
          <Row>
            <Col md={3} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <FontAwesomeIcon icon={faPause} size="3x" className="text-warning mb-3" />
                  <Card.Title>Ожидающие</Card.Title>
                  <h3>{pendingCount}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <FontAwesomeIcon icon={faClipboardList} size="3x" className="text-primary mb-3" />
                  <Card.Title>Подтвержденные</Card.Title>
                  <h3>{confirmedCount}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <FontAwesomeIcon icon={faCheck} size="3x" className="text-success mb-3" />
                  <Card.Title>Завершенные</Card.Title>
                  <h3>{completedCount}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <FontAwesomeIcon icon={faTimes} size="3x" className="text-danger mb-3" />
                  <Card.Title>Отмененные</Card.Title>
                  <h3>{cancelledCount}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
        
        {/* Список заказов */}
        <Col md={12}>
          <Card>
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                Управление заказами
              </h5>
              <Form.Select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="ms-auto w-auto"
              >
                <option value="all">Все заказы</option>
                <option value="pending">Ожидающие</option>
                <option value="confirmed">Подтвержденные</option>
                <option value="completed">Завершенные</option>
                <option value="cancelled">Отмененные</option>
              </Form.Select>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Пользователь</th>
                      <th>Услуга</th>
                      <th>Цена</th>
                      <th>Дата и время</th>
                      <th>Статус</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center">Нет заказов</td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{order.user_name}</td>
                          <td>{order.service_title || order.title}</td>
                          <td>{order.final_price} ₽{order.discount_applied && <Badge bg="success" className="ms-1">-10%</Badge>}</td>
                          <td>{new Date(order.scheduled_time).toLocaleString()}</td>
                          <td>
                            <Badge bg={
                              order.status === 'completed' ? 'success' : 
                              order.status === 'confirmed' ? 'primary' :
                              order.status === 'cancelled' ? 'danger' :
                              'warning'
                            }>
                              {order.status === 'completed' ? 'Завершен' : 
                              order.status === 'confirmed' ? 'Подтвержден' :
                              order.status === 'cancelled' ? 'Отменен' :
                              'Ожидает'}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              {order.status === 'pending' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline-primary"
                                    onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                                  >
                                    Подтвердить
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline-danger"
                                    onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                  >
                                    Отменить
                                  </Button>
                                </>
                              )}
                              {order.status === 'confirmed' && (
                                <Button 
                                  size="sm" 
                                  variant="outline-success"
                                  onClick={() => handleUpdateStatus(order.id, 'completed')}
                                >
                                  Завершить
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
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