import { Container, Row, Col, Card, Button, Image } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTruck, 
  faUsers, 
  faHistory, 
  faAward,
  faPhone,
  faEnvelope,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';

export const About = () => {
  return (
    <Container className="py-5">
      {/* Заголовок */}
      <Row className="mb-5">
        <Col>
          <h1 className="text-center mb-4">О компании "МитсоАссенизатор"</h1>
          <p className="lead text-center">
            Мы предоставляем профессиональные услуги ассенизации с 2025 года.
          </p>
        </Col>
      </Row>

      {/* История компании */}
      <Row className="mb-5">
        <Col lg={6} className="mb-4 mb-lg-0">
          <h2>
            <FontAwesomeIcon icon={faHistory} className="text-primary me-2" />
            История компании
          </h2>
          <p>
            Компания "МитсоАссенизатор" была основана в 2025 году группой профессионалов 
            в сфере коммунальных услуг, которые решили создать компанию, предоставляющую 
            высококачественные услуги ассенизации для бытовых и промышленных клиентов.
          </p>
          <p>
            За год работы мы значительно расширили спектр услуг и географию обслуживания. 
            Начав с нескольких машин и небольшой команды, сегодня мы располагаем современным 
            парком специализированной техники и штатом квалифицированных сотрудников.
          </p>
          <p>
            Наша компания заслужила репутацию надежного партнера, выполняющего свои 
            обязательства качественно и в срок.
          </p>
        </Col>
        <Col lg={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="p-4">
              <h3 className="mb-3">Наши ценности</h3>
              <ul className="list-unstyled">
                <li className="mb-3">
                  <div className="d-flex">
                    <div className="me-3">
                      <span className="badge bg-primary p-2 rounded-circle">
                        <FontAwesomeIcon icon={faAward} size="lg" />
                      </span>
                    </div>
                    <div>
                      <h5>Профессионализм</h5>
                      <p className="text-muted">
                        Мы используем современное оборудование и применяем передовые технологии 
                        для эффективного решения задач любой сложности.
                      </p>
                    </div>
                  </div>
                </li>
                <li className="mb-3">
                  <div className="d-flex">
                    <div className="me-3">
                      <span className="badge bg-primary p-2 rounded-circle">
                        <FontAwesomeIcon icon={faUsers} size="lg" />
                      </span>
                    </div>
                    <div>
                      <h5>Клиентоориентированность</h5>
                      <p className="text-muted">
                        Мы ценим каждого клиента и делаем всё возможное, чтобы предоставить 
                        сервис, превосходящий ожидания.
                      </p>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="d-flex">
                    <div className="me-3">
                      <span className="badge bg-primary p-2 rounded-circle">
                        <FontAwesomeIcon icon={faTruck} size="lg" />
                      </span>
                    </div>
                    <div>
                      <h5>Оперативность</h5>
                      <p className="text-muted">
                        Мы гарантируем быстрое реагирование и выполнение работ в кратчайшие сроки.
                      </p>
                    </div>
                  </div>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Команда */}
      <Row className="mb-5">
        <Col>
          <h2 className="text-center mb-4">
            <FontAwesomeIcon icon={faUsers} className="text-primary me-2" />
            Наша команда
          </h2>
          <p className="text-center mb-5">
            Наша сила в профессионалах, которые работают в компании
          </p>
        </Col>
      </Row>
      <Row className="mb-5">
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm text-center">
            <Card.Body>
              <div className="rounded-circle overflow-hidden mx-auto mb-3" style={{ width: '150px', height: '150px', backgroundColor: '#f8f9fa' }}>
                <FontAwesomeIcon icon={faUsers} size="6x" className="text-primary mt-4" />
              </div>
              <h4>Максим Шепелевич</h4>
              <p className="text-muted">Директор</p>
              <p>
                Основатель компании с более чем 15-летним опытом в сфере ассенизации и коммунальных услуг.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm text-center">
            <Card.Body>
              <div className="rounded-circle overflow-hidden mx-auto mb-3" style={{ width: '150px', height: '150px', backgroundColor: '#f8f9fa' }}>
                <FontAwesomeIcon icon={faUsers} size="6x" className="text-primary mt-4" />
              </div>
              <h4>Никита Скоков</h4>
              <p className="text-muted">Технический директор</p>
              <p>
                Отвечает за техническое оснащение и обслуживание автопарка компании.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm text-center">
            <Card.Body>
              <div className="rounded-circle overflow-hidden mx-auto mb-3" style={{ width: '150px', height: '150px', backgroundColor: '#f8f9fa' }}>
                <FontAwesomeIcon icon={faUsers} size="6x" className="text-primary mt-4" />
              </div>
              <h4>Илья Самусевич</h4>
              <p className="text-muted">Менеджер по работе с клиентами</p>
              <p>
                Координирует работу с клиентами и обеспечивает высокий уровень сервиса.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Контакты */}
      <Row className="mb-5">
        <Col>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="mb-4 text-center">Связаться с нами</h2>
              <Row>
                <Col md={4} className="mb-4 mb-md-0">
                  <div className="text-center">
                    <FontAwesomeIcon icon={faPhone} size="3x" className="text-primary mb-3" />
                    <h4>Телефон</h4>
                    <p>+375 (29) 979-86-09</p>
                  </div>
                </Col>
                <Col md={4} className="mb-4 mb-md-0">
                  <div className="text-center">
                    <FontAwesomeIcon icon={faEnvelope} size="3x" className="text-primary mb-3" />
                    <h4>Email</h4>
                    <p>7leeq7@gmail.com</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center">
                    <FontAwesomeIcon icon={faMapMarkerAlt} size="3x" className="text-primary mb-3" />
                    <h4>Адрес</h4>
                    <p>г. Минск, пр. Рокоссовского, д. 170</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Призыв к действию */}
      <Row>
        <Col>
          <Card className="bg-primary text-white text-center">
            <Card.Body className="p-5">
              <h2 className="mb-3">Нужны услуги ассенизации?</h2>
              <p className="lead mb-4">
                Свяжитесь с нами прямо сейчас или оставьте заявку на сайте
              </p>
              <Button variant="light" size="lg" href="/services">
                Заказать услугу
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}; 