import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Form, Modal } from 'react-bootstrap';
import axios from 'axios';
import { API_URL } from '../../config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faUserTie, faCheck, faTimes, faPause, faFileAlt, faEdit, faCalendarAlt, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import AddressSearch from '../AddressSearch';

export const EmployeePanel = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  
  // Состояния для редактирования заказа
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [updatingOrder, setUpdatingOrder] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

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
        
        // Получаем все заказы и услуги параллельно
        const [ordersResponse, servicesResponse] = await Promise.all([
          axios.get(`${API_URL}/orders`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/services`)
        ]);
        
        // Выводим содержимое первого заказа для отладки
        if (ordersResponse.data && ordersResponse.data.length > 0) {
          console.log('Пример заказа:', JSON.stringify(ordersResponse.data[0], null, 2));
        }
        
        setOrders(ordersResponse.data);
        setServices(servicesResponse.data);
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
  
  // Обработчик открытия модального окна редактирования
  const handleEditOrder = (order: any) => {
    console.log('Редактируем заказ:', order);
    
    // Определяем адрес, проверяя разные возможные поля
    // Расширяем перечень полей для поиска адреса
    const address = order.address || order.delivery_address || order.location || 
                   order.client_address || order.serviceAddress || '';
    
    console.log('Найденный адрес:', address);
    
    setEditingOrder({
      ...order,
      service_id: order.service_id,
      scheduled_time: new Date(order.scheduled_time).toISOString().slice(0, 16),
      address: address
    });
    setShowEditModal(true);
  };
  
  // Функция для получения адреса из объекта заказа
  const getOrderAddress = (order: any) => {
    // Исключаем поля, которые не должны рассматриваться как адрес
    const excludeFields = ['service_title', 'title', 'description', 'service_description'];
    
    // Проверяем, есть ли поле с адресом непосредственно в объекте
    const directAddressFields = ['address', 'delivery_address', 'location', 'client_address', 
                               'serviceAddress', 'user_address', 'order_address'];
    
    for (const field of directAddressFields) {
      if (order[field] && typeof order[field] === 'string' && order[field].trim() !== '') {
        return order[field];
      }
    }
    
    // Проверяем подобъекты
    const nestedObjects = ['client', 'service', 'user', 'data', 'order', 'details'];
    for (const obj of nestedObjects) {
      if (order[obj] && typeof order[obj] === 'object') {
        for (const field of directAddressFields) {
          if (order[obj][field] && typeof order[obj][field] === 'string' && order[obj][field].trim() !== '') {
            return order[obj][field];
          }
        }
      }
    }
    
    // Не используем поиск по индикаторам адреса, так как это приводит к ложным срабатываниям
    
    return null;
  };
  
  // Обработчик изменения полей формы редактирования
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditingOrder((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Обработчик изменения адреса
  const handleAddressChange = (address: string) => {
    setEditingOrder((prev: any) => ({
      ...prev,
      address
    }));
  };
  
  // Обработчик сохранения изменений заказа
  const handleSaveOrderChanges = async () => {
    try {
      setUpdatingOrder(true);
      setUpdateError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }
      
      // Получаем выбранную услугу по ID
      const selectedService = services.find(service => service.id === parseInt(editingOrder.service_id));
      if (!selectedService) {
        throw new Error('Выбранная услуга не найдена');
      }
      
      // Отправляем запрос на обновление заказа
      const response = await axios.patch(
        `${API_URL}/orders/${editingOrder.id}`,
        {
          service_id: parseInt(editingOrder.service_id),
          scheduled_time: new Date(editingOrder.scheduled_time).toISOString(),
          address: editingOrder.address
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Обновляем заказ в списке
      setOrders(orders.map(order => 
        order.id === editingOrder.id
          ? {
              ...order,
              service_id: parseInt(editingOrder.service_id),
              service_title: selectedService.title,
              title: selectedService.title,
              description: selectedService.description,
              duration: selectedService.duration,
              final_price: selectedService.price,
              scheduled_time: editingOrder.scheduled_time,
              address: editingOrder.address
            }
          : order
      ));
      
      // Закрываем модальное окно
      setShowEditModal(false);
      
    } catch (err: any) {
      console.error('Ошибка при обновлении заказа:', err);
      setUpdateError(err.message || err.response?.data?.error || 'Ошибка при обновлении заказа');
    } finally {
      setUpdatingOrder(false);
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
                      <th>Адрес</th>
                      <th>Статус</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center">Нет заказов</td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{order.user_name}</td>
                          <td>{order.service_title || order.title}</td>
                          <td>{order.final_price} ₽</td>
                          <td>{new Date(order.scheduled_time).toLocaleString()}</td>
                          <td>
                            {getOrderAddress(order) || <span className="text-muted">Не указан</span>}
                          </td>
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
                              {/* Добавляем кнопку редактирования для всех заказов, кроме отмененных */}
                              {order.status !== 'cancelled' && (
                                <Button 
                                  size="sm" 
                                  variant="outline-secondary"
                                  onClick={() => handleEditOrder(order)}
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </Button>
                              )}
                              
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
      
      {/* Модальное окно редактирования заказа */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Редактирование заказа №{editingOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {updateError && (
            <div className="alert alert-danger">{updateError}</div>
          )}
          
          {editingOrder && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Клиент</Form.Label>
                <Form.Control 
                  type="text" 
                  value={editingOrder.user_name} 
                  disabled
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Услуга</Form.Label>
                <Form.Select
                  name="service_id"
                  value={editingOrder.service_id}
                  onChange={handleEditChange}
                >
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.title} - {service.price} руб.
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                  Дата и время
                </Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="scheduled_time"
                  value={editingOrder.scheduled_time}
                  onChange={handleEditChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                  Адрес
                </Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={editingOrder.address}
                  onChange={handleEditChange}
                  placeholder="Введите адрес"
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Отмена
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveOrderChanges}
            disabled={updatingOrder}
          >
            {updatingOrder ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-1">Сохранение...</span>
              </>
            ) : 'Сохранить изменения'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}; 