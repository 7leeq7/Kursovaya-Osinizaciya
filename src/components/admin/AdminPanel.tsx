import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Form, Modal } from 'react-bootstrap';
import axios from 'axios';
import { API_URL } from '../../config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faClipboardList, faCog, faUserCog, faPlus, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';

export const AdminPanel = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояния для модального окна добавления услуги
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    category_id: ''
  });
  const [addingService, setAddingService] = useState(false);
  const [addServiceError, setAddServiceError] = useState<string | null>(null);
  const [services, setServices] = useState<any[]>([]);
  
  // Состояния для редактирования пользователя
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editUserError, setEditUserError] = useState<string | null>(null);
  const [savingUser, setSavingUser] = useState(false);
  
  // Состояния для удаления услуги
  const [deletingService, setDeletingService] = useState<number | null>(null);
  // Состояние для восстановления услуг
  const [restoringServices, setRestoringServices] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

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
        
        // Параллельно получаем пользователей, заказы, услуги и категории
        const [usersResponse, ordersResponse, servicesResponse, categoriesResponse] = await Promise.all([
          axios.get(`${API_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/orders`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/services`),
          axios.get(`${API_URL}/categories`)
        ]);
        
        console.log('Оригинальные данные пользователей:', usersResponse.data);
        
        // Обрабатываем данные пользователей для правильного отображения ролей
        const processedUsers = usersResponse.data.map((user: any) => {
          // Определяем role_id по имени роли, если роль передается как строка и role_id отсутствует
          if (user.role && !user.role_id) {
            if (user.role.toLowerCase() === 'admin' || 
                user.role.toLowerCase() === 'administrator' ||
                user.role.toLowerCase() === 'администратор') {
              user.role_id = 1;
            } else if (user.role.toLowerCase() === 'employee' ||
                       user.role.toLowerCase() === 'сотрудник') {
              user.role_id = 2;
            } else {
              user.role_id = 3;
            }
          }
          
          // Преобразуем role_id в строковое значение role
          if (user.role_id === 1) {
            return { ...user, role: 'admin' };
          } else if (user.role_id === 2) {
            return { ...user, role: 'employee' };
          } else {
            return { ...user, role: 'guest' };
          }
        });
        
        console.log('Обработанные данные пользователей:', processedUsers);
        
        setUsers(processedUsers);
        setOrders(ordersResponse.data);
        setServices(servicesResponse.data);
        setCategories(categoriesResponse.data);
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
      
      // Добавляем логирование ответа сервера
      console.log('Ответ сервера при изменении роли:', response.data);
      
      // Обновляем список пользователей после успешного изменения роли
      // Учитываем, что role_id=1 соответствует роли admin
      setUsers(users.map(user => {
        if (user.id === userId) {
          // Определяем строковое значение роли на основе role_id
          let roleName;
          if (newRoleId === 1) {
            roleName = 'admin';
          } else if (newRoleId === 2) {
            roleName = 'employee';
          } else {
            roleName = 'guest';
          }
          
          return { 
            ...user, 
            role: roleName
          };
        }
        return user;
      }));
      
    } catch (err: any) {
      console.error('Ошибка при изменении роли:', err);
      alert(err.response?.data?.error || 'Ошибка при изменении роли пользователя');
    }
  };

  // Обработчики для добавления новой услуги
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewService(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddService = async () => {
    try {
      setAddingService(true);
      setAddServiceError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }
      
      // Валидация формы
      if (!newService.title || !newService.description || !newService.price || !newService.duration || !newService.category_id) {
        throw new Error('Все поля обязательны для заполнения');
      }
      
      // Преобразуем price в число
      const priceAsNumber = parseFloat(newService.price);
      if (isNaN(priceAsNumber)) {
        throw new Error('Цена должна быть числом');
      }
      
      // Отправляем запрос на добавление услуги
      const response = await axios.post(
        `${API_URL}/services`, 
        {
          ...newService,
          price: priceAsNumber,
          category_id: parseInt(newService.category_id)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Добавляем новую услугу в список
      setServices(prev => [...prev, response.data]);
      
      // Сбрасываем форму и закрываем модальное окно
      setNewService({
        title: '',
        description: '',
        price: '',
        duration: '',
        category_id: ''
      });
      setShowAddServiceModal(false);
      
    } catch (err: any) {
      console.error('Ошибка при добавлении услуги:', err);
      setAddServiceError(err.message || err.response?.data?.error || 'Ошибка при добавлении услуги');
    } finally {
      setAddingService(false);
    }
  };
  
  // Обработчик удаления услуги
  const handleDeleteService = async (serviceId: number) => {
    try {
      setDeletingService(serviceId);
      
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Токен авторизации не найден');
        return;
      }
      
      // Отправляем запрос на удаление услуги
      await axios.delete(`${API_URL}/services/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Удаляем услугу из списка
      setServices((prev: any[]) => prev.filter(service => service.id !== serviceId));
      
      // Показываем сообщение об успешном удалении
      alert('Услуга успешно удалена');
      
    } catch (err: any) {
      console.error('Ошибка при удалении услуги:', err);
      alert(err.response?.data?.error || 'Ошибка при удалении услуги');
    } finally {
      setDeletingService(null);
    }
  };
  
  // Обработчики для редактирования пользователя
  const handleEditUser = (user: any) => {
    setSelectedUser({
      ...user,
      phone: user.phone || '',
      address: user.address || '',
      full_name: user.full_name || '',
      birthday: user.birthday || ''
    });
    setShowEditUserModal(true);
  };
  
  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSelectedUser((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveUser = async () => {
    try {
      setSavingUser(true);
      setEditUserError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }
      
      // Валидация формы
      if (!selectedUser.username || !selectedUser.email) {
        throw new Error('Имя пользователя и email обязательны для заполнения');
      }
      
      // Отправляем запрос на обновление данных пользователя
      // Используем patch вместо put и изменяем URL на основе доступных API эндпоинтов
      await axios.patch(
        `${API_URL}/admin/users/${selectedUser.id}/profile`, 
        {
          username: selectedUser.username,
          email: selectedUser.email,
          phone: selectedUser.phone,
          address: selectedUser.address,
          full_name: selectedUser.full_name,
          birthday: selectedUser.birthday
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Обновляем пользователя в списке
      setUsers((prev: any[]) => prev.map(user => 
        user.id === selectedUser.id ? {
          ...user,
          username: selectedUser.username,
          email: selectedUser.email,
          phone: selectedUser.phone,
          address: selectedUser.address,
          full_name: selectedUser.full_name
        } : user
      ));
      
      // Закрываем модальное окно
      setShowEditUserModal(false);
      
    } catch (err: any) {
      console.error('Ошибка при обновлении пользователя:', err);
      if (err.response && err.response.status === 404) {
        setEditUserError('Request failed with status code 404');
      } else {
        setEditUserError(err.message || err.response?.data?.error || 'Ошибка при обновлении пользователя');
      }
    } finally {
      setSavingUser(false);
    }
  };

  // Обработчик восстановления услуг
  const handleRestoreServices = async () => {
    try {
      setRestoringServices(true);
      setRestoreError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }
      
      // Отправляем запрос на восстановление услуг
      const response = await axios.post(
        `${API_URL}/restore-services`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Обновляем список услуг
      if (response.data.services) {
        setServices(prev => [...prev, ...response.data.services]);
      } else {
        // Если сервер не вернул список услуг, обновим весь список с сервера
        const servicesResponse = await axios.get(`${API_URL}/services`);
        setServices(servicesResponse.data);
      }
      
      alert(`Услуги успешно восстановлены. Добавлено: ${response.data.count} услуг.`);
      
    } catch (err: any) {
      console.error('Ошибка при восстановлении услуг:', err);
      setRestoreError(err.response?.data?.error || 'Ошибка при восстановлении услуг');
      alert(err.response?.data?.error || 'Ошибка при восстановлении услуг');
    } finally {
      setRestoringServices(false);
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
        
        {/* Управление услугами */}
        <Col md={12} className="mb-4">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                Управление услугами
              </h5>
              <div>
                <Button 
                  variant="success" 
                  onClick={() => setShowAddServiceModal(true)}
                  className="me-2"
                >
                  <FontAwesomeIcon icon={faPlus} className="me-1" />
                  Добавить услугу
                </Button>
                
                <Button 
                  variant="warning" 
                  onClick={handleRestoreServices}
                  disabled={restoringServices}
                >
                  {restoringServices ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      <span className="ms-1">Восстановление...</span>
                    </>
                  ) : 'Восстановить услуги'}
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Название</th>
                      <th>Описание</th>
                      <th>Цена (₽)</th>
                      <th>Длительность</th>
                      <th>Категория</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map(service => (
                      <tr key={service.id}>
                        <td>{service.id}</td>
                        <td>{service.title}</td>
                        <td>{service.description}</td>
                        <td>{service.price}</td>
                        <td>{service.duration}</td>
                        <td>
                          <Badge bg="info">{service.category}</Badge>
                        </td>
                        <td>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteService(service.id)}
                            disabled={deletingService === service.id}
                          >
                            {deletingService === service.id ? (
                              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                            ) : (
                              <FontAwesomeIcon icon={faTrash} />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
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
                        <td>
                          {user.username}
                        </td>
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
                            <Button 
                              size="sm" 
                              variant="outline-primary"
                              onClick={() => handleEditUser(user)}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </Button>

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

      {/* Модальное окно добавления услуги */}
      <Modal show={showAddServiceModal} onHide={() => setShowAddServiceModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Добавление новой услуги</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {addServiceError && (
            <div className="alert alert-danger">{addServiceError}</div>
          )}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Название услуги</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={newService.title}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Описание</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={newService.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Цена (₽)</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={newService.price}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Длительность</Form.Label>
              <Form.Control
                type="text"
                name="duration"
                value={newService.duration}
                onChange={handleInputChange}
                placeholder="Например: 1-2 часа"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Категория</Form.Label>
              <Form.Select 
                name="category_id"
                value={newService.category_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Выберите категорию</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddServiceModal(false)}>
            Отмена
          </Button>
          <Button 
            variant="success" 
            onClick={handleAddService}
            disabled={addingService}
          >
            {addingService ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-1">Добавление...</span>
              </>
            ) : 'Добавить услугу'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Модальное окно редактирования пользователя */}
      <Modal show={showEditUserModal} onHide={() => setShowEditUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Редактирование пользователя</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editUserError && (
            <div className="alert alert-danger">{editUserError}</div>
          )}
          {selectedUser && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Имя пользователя</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={selectedUser.username}
                  onChange={handleUserInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={selectedUser.email}
                  onChange={handleUserInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Телефон</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={selectedUser.phone}
                  onChange={handleUserInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Адрес</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={selectedUser.address}
                  onChange={handleUserInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Дата рождения</Form.Label>
                <Form.Control
                  type="date"
                  name="birthday"
                  value={selectedUser.birthday}
                  onChange={handleUserInputChange}
                />
              </Form.Group>
            
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditUserModal(false)}>
            Отмена
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveUser}
            disabled={savingUser}
          >
            {savingUser ? (
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