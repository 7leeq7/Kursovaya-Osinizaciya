import { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faWrench, faFileAlt, faArrowRight } from '@fortawesome/free-solid-svg-icons';

// Типы данных для услуг
interface Service {
  id: number;
  title: string;
  description: string;
  price: number;
  priceUnit: string;
  icon: any; // FontAwesome icon
  popular: boolean;
}

const ServicesList = () => {
  // Данные о услугах (в реальном приложении они бы загружались с сервера)
  const [services] = useState<Service[]>([
    {
      id: 1,
      title: 'Откачка септика',
      description: 'Качественная и быстрая очистка септиков любой сложности и объема.',
      price: 150,
      priceUnit: 'от',
      icon: faTruck,
      popular: true
    },
    {
      id: 2,
      title: 'Откачка выгребных ям',
      description: 'Профессиональная очистка выгребных ям с применением специального оборудования.',
      price: 130,
      priceUnit: 'от',
      icon: faTruck,
      popular: true
    },
    {
      id: 3,
      title: 'Прочистка канализации',
      description: 'Устранение засоров в трубах с использованием гидродинамического оборудования.',
      price: 200,
      priceUnit: 'от',
      icon: faWrench,
      popular: false
    },
    {
      id: 4,
      title: 'Обслуживание биотуалетов',
      description: 'Регулярное обслуживание и очистка биотуалетов для мероприятий и строительных площадок.',
      price: 100,
      priceUnit: 'от',
      icon: faWrench,
      popular: false
    },
    {
      id: 5,
      title: 'Вывоз ЖБО',
      description: 'Экологически безопасный вывоз жидких бытовых отходов на специализированные полигоны.',
      price: 180,
      priceUnit: 'от',
      icon: faTruck,
      popular: false
    },
    {
      id: 6,
      title: 'Разработка документации',
      description: 'Подготовка технической документации для проектирования канализационных систем.',
      price: 500,
      priceUnit: '',
      icon: faFileAlt,
      popular: false
    }
  ]);

  return (
    <Container className="py-4">
      <h1 className="mb-4 text-center">Наши услуги</h1>
      <p className="text-center mb-5 lead">
        Мы предлагаем полный спектр услуг по обслуживанию септиков и канализационных систем
      </p>
      
      <Row>
        {services.map(service => (
          <Col key={service.id} lg={4} md={6} className="mb-4">
            <Card className="h-100 shadow-sm hover-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <FontAwesomeIcon icon={service.icon} size="2x" className="text-primary" />
                  {service.popular && (
                    <Badge bg="warning" text="dark">Популярная услуга</Badge>
                  )}
                </div>
                <Card.Title>{service.title}</Card.Title>
                <Card.Text>{service.description}</Card.Text>
              </Card.Body>
              <Card.Footer className="bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong className="text-primary fs-5">
                      {service.priceUnit} {service.price} ₽
                    </strong>
                  </div>
                  <Button 
                    as={Link} 
                    to={`/order?service=${service.id}`} 
                    variant="outline-primary"
                  >
                    Заказать <FontAwesomeIcon icon={faArrowRight} />
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
      
      <div className="bg-light p-4 mt-4 rounded shadow-sm">
        <h3>Нужна особая услуга?</h3>
        <p>
          Если вы не нашли необходимую вам услугу или у вас есть специфические требования, 
          свяжитесь с нами для получения индивидуального предложения.
        </p>
        <Button as={Link} to="/order?custom=true" variant="primary">
          Индивидуальный запрос
        </Button>
      </div>
    </Container>
  );
};

export default ServicesList; 