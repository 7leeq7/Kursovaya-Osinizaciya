import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTruck, 
  faCheckCircle, 
  faClock, 
  faPhone,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';

export const Home = () => {
  return (
    <Container className="py-5">
      {/* Hero Section */}
      <Row className="align-items-center mb-5">
        <Col md={6}>
          <h1 className="display-4 mb-4">Услуги ассенизации</h1>
          <p className="lead mb-4">
            Мы предоставляем профессиональные услуги по откачке и вывозу жидких бытовых отходов. 
            Работаем с частными домами, предприятиями и организациями.
          </p>
          <div className="d-flex align-items-center mb-4">
            <FontAwesomeIcon icon={faPhone} className="text-primary me-2" size="lg" />
            <a href="tel:+375299798609" className="text-decoration-none">
              <span className="h4 mb-0 text-primary">+375 (29) 979-86-09</span>
            </a>
          </div>
          <Link to="/services">
            <Button variant="primary" size="lg">
              Заказать услугу
              <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
            </Button>
          </Link>
        </Col>
        <Col md={6} className="text-center">
          <FontAwesomeIcon icon={faTruck} size="8x" className="text-primary mt-4 mt-md-0" />
        </Col>
      </Row>

      {/* Features Section */}
      <h2 className="text-center mb-4">Почему выбирают нас</h2>
      <Row xs={1} md={2} lg={4} className="g-4 mb-5">
        <Col>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <FontAwesomeIcon icon={faTruck} size="3x" className="text-primary mb-3" />
              <Card.Title>Современный автопарк</Card.Title>
              <Card.Text>
                Собственный парк специализированной техники различной вместимости
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <FontAwesomeIcon icon={faCheckCircle} size="3x" className="text-primary mb-3" />
              <Card.Title>Гарантия качества</Card.Title>
              <Card.Text>
                Работаем с соблюдением всех экологических норм и стандартов
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <FontAwesomeIcon icon={faClock} size="3x" className="text-primary mb-3" />
              <Card.Title>Оперативность</Card.Title>
              <Card.Text>
                Быстрый выезд на объект в любое удобное для вас время
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <FontAwesomeIcon icon={faPhone} size="3x" className="text-primary mb-3" />
              <Card.Title>24/7 поддержка</Card.Title>
              <Card.Text>
                Круглосуточная поддержка для экстренных вызовов
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* CTA Section */}
      <Card className="bg-primary text-white text-center p-5">
        <Card.Body>
          <h2 className="mb-4">Нужна регулярная откачка?</h2>
          <p className="lead mb-4">
            Зарегистрируйтесь и сделайте первый заказ!
          </p>
          <Link to="/register">
            <Button variant="light" size="lg">
              Зарегистрироваться
              <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
            </Button>
          </Link>
        </Card.Body>
      </Card>
    </Container>
  );
};