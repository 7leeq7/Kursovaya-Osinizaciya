import { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Card, Alert, Tabs, Tab } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faFileAlt, faHistory, faCheck, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';

// Интерфейсы
interface Order {
  id: string;
  serviceTitle: string;
  date: string;
  status: 'new' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  address: string;
  price: number;
  createdAt: string;
}

const OrdersList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Имитация загрузки данных с сервера
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // В реальном приложении здесь будет API-запрос
        setTimeout(() => {
          const mockOrders: Order[] = [
            {
              id: '10001',
              serviceTitle: 'Откачка септика',
              date: '2023-05-15',
              status: 'completed',
              address: 'г. Москва, ул. Примерная, д. 10',
              price: 1500,
              createdAt: '2023-05-10'
            },
            {
              id: '10002',
              serviceTitle: 'Вывоз ЖБО',
              date: '2023-05-25',
              status: 'in_progress',
              address: 'Московская обл., г. Пушкино, ул. Лесная, д. 5',
              price: 2200,
              createdAt: '2023-05-20'
            },
            {
              id: '10003',
              serviceTitle: 'Прочистка канализации',
              date: '2023-06-01',
              status: 'confirmed',
              address: 'г. Москва, ул. Центральная, д. 25, кв. 12',
              price: 2500,
              createdAt: '2023-05-27'
            },
            {
              id: '10004',
              serviceTitle: 'Откачка выгребной ямы',
              date: '2023-06-10',
              status: 'new',
              address: 'Московская обл., пос. Новый, ул. Дачная, д. 17',
              price: 1800,
              createdAt: '2023-05-30'
            }
          ];
          
          setOrders(mockOrders);
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        setError('Ошибка при загрузке заказов');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Фильтрация заказов по статусу
  const getFilteredOrders = () => {
    if (activeTab === 'all') {
      return orders;
    }
    return orders.filter(order => {
      if (activeTab === 'active') {
        return ['new', 'confirmed', 'in_progress'].includes(order.status);
      } else if (activeTab === 'completed') {
        return order.status === 'completed';
      } else if (activeTab === 'cancelled') {
        return order.status === 'cancelled';
      }
      return true;
    });
  };

  // Функция для отображения статуса заказа с соответствующим цветом и иконкой
  const renderStatus = (status: Order['status']) => {
    switch (status) {
      case 'new':
        return <Badge bg="info"><FontAwesomeIcon icon={faFileAlt} className="me-1" /> Новый</Badge>;
      case 'confirmed':
        return <Badge bg="primary"><FontAwesomeIcon icon={faCheck} className="me-1" /> Подтвержден</Badge>;
      case 'in_progress':
        return <Badge bg="warning" text="dark"><FontAwesomeIcon icon={faSpinner} className="me-1" /> В процессе</Badge>;
      case 'completed':
        return <Badge bg="success"><FontAwesomeIcon icon={faCheck} className="me-1" /> Выполнен</Badge>;
      case 'cancelled':
        return <Badge bg="danger"><FontAwesomeIcon icon={faTimes} className="me-1" /> Отменен</Badge>;
      default:
        return <Badge bg="secondary">Неизвестно</Badge>;
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Мои заказы</h1>
      
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <p className="mt-3">Загрузка заказов...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">
          {error}
        </Alert>
      ) : orders.length === 0 ? (
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <FontAwesomeIcon icon={faHistory} size="3x" className="text-muted mb-3" />
            <h3>У вас пока нет заказов</h3>
            <p className="mb-4">Вы можете создать новый заказ на одну из наших услуг</p>
            <Button href="/order" variant="primary" size="lg">Заказать услугу</Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k || 'all')}
            className="mb-4"
          >
            <Tab eventKey="all" title="Все заказы" />
            <Tab eventKey="active" title="Активные" />
            <Tab eventKey="completed" title="Выполненные" />
            <Tab eventKey="cancelled" title="Отмененные" />
          </Tabs>
          
          <Card className="shadow-sm">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>№ заказа</th>
                      <th>Услуга</th>
                      <th>Дата выполнения</th>
                      <th>Статус</th>
                      <th>Адрес</th>
                      <th>Сумма</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredOrders().map(order => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.serviceTitle}</td>
                        <td>{formatDate(order.date)}</td>
                        <td>{renderStatus(order.status)}</td>
                        <td>{order.address}</td>
                        <td>{order.price} ₽</td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            href={`/orders/${order.id}`}
                          >
                            <FontAwesomeIcon icon={faEye} className="me-1" /> Детали
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
          
          <div className="mt-4">
            <Alert variant="info">
              <small>
                <FontAwesomeIcon icon={faCheck} className="me-1" />
                Для получения дополнительной информации о заказе или его изменения,
                нажмите "Детали" или свяжитесь с нами по телефону.
              </small>
            </Alert>
          </div>
        </>
      )}
    </Container>
  );
};

export default OrdersList; 