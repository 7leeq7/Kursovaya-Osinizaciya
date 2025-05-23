import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTruck,
  faHome,
  faIndustry,
  faWarehouse,
  faRecycle,
  faCalendarAlt,
  faClipboardCheck,
  faTools,
  faClock,
  faTag
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { API_URL } from '../config';
import { ServiceOrder } from './ServiceOrder';

interface Service {
  id: number;
  icon: any;
  title: string;
  description: string;
  price: number;
  duration: string;
  category: string;
}

const services: Service[] = [
  {
    id: 1,
    icon: faHome,
    title: 'Откачка септиков',
    description: 'Профессиональная откачка септиков и выгребных ям для частных домов',
    price: 200,
    duration: '30-60 минут',
    category: 'Частный сектор'
  },
  {
    id: 2,
    icon: faIndustry,
    title: 'Обслуживание предприятий',
    description: 'Комплексное обслуживание промышленных предприятий и производств',
    price: 500,
    duration: '1-2 часа',
    category: 'Промышленность'
  },
  {
    id: 3,
    icon: faWarehouse,
    title: 'Откачка отстойников',
    description: 'Очистка и откачка промышленных отстойников любого объема',
    price: 1500,
    duration: '2-4 часа',
    category: 'Промышленность'
  },
  {
    id: 4,
    icon: faRecycle,
    title: 'Утилизация отходов',
    description: 'Безопасная утилизация жидких бытовых отходов с соблюдением экологических норм',
    price: 300,
    duration: '1-2 часа',
    category: 'Утилизация'
  },
  {
    id: 5,
    icon: faCalendarAlt,
    title: 'Регулярное обслуживание',
    description: 'Плановая откачка по графику с гибкой системой скидок',
    price: 180,
    duration: '30-60 минут',
    category: 'Абонентское обслуживание'
  },
  {
    id: 6,
    icon: faClipboardCheck,
    title: 'Экспертиза и консультация',
    description: 'Профессиональная оценка состояния септиков и канализационных систем',
    price: 150,
    duration: '1 час',
    category: 'Консультации'
  },
  {
    id: 7,
    icon: faTools,
    title: 'Очистка канализации',
    description: 'Прочистка и промывка канализационных систем',
    price: 250,
    duration: '1-3 часа',
    category: 'Частный сектор'
  },
  {
    id: 8,
    icon: faTruck,
    title: 'Аварийный выезд',
    description: 'Срочный выезд в случае переполнения или аварийной ситуации',
    price: 350,
    duration: '30-60 минут',
    category: 'Экстренные вызовы'
  }
];

export const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const servicesResponse = await axios.get(`${API_URL}/services`);

        const services = servicesResponse.data;
        setServices(services);
        
        // Получаем уникальные категории
        const uniqueCategories = Array.from(new Set(services.map((s: Service) => s.category))) as string[];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();
  }, []);

  const handleOrderClick = (service: Service) => {
    setSelectedService(service);
    setShowOrderModal(true);
  };

  const handleOrderComplete = () => {
    // Обработчик завершения заказа
  };

  const filteredServices = selectedCategory
    ? services.filter(service => service.category === selectedCategory)
    : services;

  return (
    <Container className="py-5">
      <h1 className="text-center mb-5" data-aos="fade-down">Наши услуги</h1>

      <div className="mb-4" data-aos="fade-up" data-aos-delay="100">
        <div className="d-flex justify-content-center gap-2 flex-wrap">
          <Button
            variant={selectedCategory === '' ? 'primary' : 'outline-primary'}
            onClick={() => setSelectedCategory('')}
            className="mb-2"
          >
            Все услуги
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'primary' : 'outline-primary'}
              onClick={() => setSelectedCategory(category)}
              className="mb-2"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredServices.map((service, index) => (
          <Col key={service.id} data-aos="zoom-in" data-aos-delay={100 * (index % 3 + 1)}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title className="mb-3">{service.title}</Card.Title>
                <Card.Text>
                  {service.description}
                </Card.Text>
                <div className="mb-3">
                  <Badge bg="secondary" className="me-2">
                    <FontAwesomeIcon icon={faClock} className="me-1" />
                    {service.duration}
                  </Badge>
                  <Badge bg="info">
                    <FontAwesomeIcon icon={faTag} className="me-1" />
                    {service.category}
                  </Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">{service.price} руб.</h5>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => handleOrderClick(service)}
                  >
                    Заказать
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {selectedService && (
        <ServiceOrder
          show={showOrderModal}
          onHide={() => setShowOrderModal(false)}
          service={selectedService}
          onOrderComplete={handleOrderComplete}
        />
      )}
    </Container>
  );
}; 