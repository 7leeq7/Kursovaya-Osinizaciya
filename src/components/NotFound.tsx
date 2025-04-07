import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faHome, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const NotFound = () => {
  return (
    <Container className="py-5 text-center">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="mb-4" data-aos="zoom-in">
            <FontAwesomeIcon 
              icon={faExclamationTriangle} 
              size="5x" 
              className="text-warning mb-3"
            />
            <h1 className="display-4 mb-2">404</h1>
            <h2 className="mb-4">Страница не найдена</h2>
            <p className="lead mb-5">
              Извините, запрашиваемая вами страница не существует или была перемещена.
            </p>
          </div>
          
          <div className="d-grid gap-3 d-md-flex justify-content-md-center" data-aos="fade-up" data-aos-delay="200">
            <Link to="/" className="btn btn-primary btn-lg">
              <FontAwesomeIcon icon={faHome} className="me-2" />
              На главную
            </Link>
            <Button 
              onClick={() => window.history.back()} 
              variant="outline-secondary" 
              size="lg"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Вернуться назад
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export { NotFound }; 