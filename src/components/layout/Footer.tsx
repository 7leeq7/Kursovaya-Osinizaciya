import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light py-4 mt-4">
      <Container>
        <Row>
          <Col md={4} className="mb-3 mb-md-0">
            <h5 className="mb-3">О компании</h5>
            <p>
              Наша компания предоставляет качественные услуги ассенизации для частных 
              домов, дач и коммерческих объектов. Мы гарантируем быструю и эффективную 
              работу с соблюдением всех экологических норм.
            </p>
          </Col>
          <Col md={4} className="mb-3 mb-md-0">
            <h5 className="mb-3">Контакты</h5>
            <div className="mb-2">
              <FontAwesomeIcon icon={faPhone} className="me-2" />
              <a href="tel:+71234567890" className="text-light">+7 (123) 456-78-90</a>
            </div>
            <div className="mb-2">
              <FontAwesomeIcon icon={faEnvelope} className="me-2" />
              <a href="mailto:info@assservice.ru" className="text-light">info@assservice.ru</a>
            </div>
            <div>
              <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
              <span>г. Москва, ул. Примерная, д. 123</span>
            </div>
          </Col>
          <Col md={4}>
            <h5 className="mb-3">Быстрые ссылки</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/services" className="text-light">Услуги</Link></li>
              <li className="mb-2"><Link to="/order" className="text-light">Заказать</Link></li>
              <li className="mb-2"><Link to="/login" className="text-light">Личный кабинет</Link></li>
            </ul>
          </Col>
        </Row>
        <hr className="my-3" />
        <div className="text-center">
          <p className="mb-0">© {currentYear} Ассенизация-Сервис. Все права защищены.</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer; 