import { Container, Row, Col, Card, Button, Form, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTruck, 
  faCheckCircle, 
  faClock, 
  faPhone,
  faArrowRight,
  faStar as fasStar,
  faUser,
  faComment
} from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuthContext } from '../contexts/AuthContext';

// Компонент для отображения рейтинга в виде звезд
interface StarRatingProps {
  rating: number;
  setRating?: Dispatch<SetStateAction<number>>;
  readOnly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, setRating, readOnly = false }) => {
  const stars = [1, 2, 3, 4, 5];
  
  return (
    <div className="star-rating">
      {stars.map(star => (
        <span 
          key={star} 
          className="star"
          onClick={() => !readOnly && setRating && setRating(star)}
          style={{ cursor: readOnly ? 'default' : 'pointer', marginRight: '2px' }}
        >
          <FontAwesomeIcon 
            icon={star <= rating ? fasStar : farStar} 
            className={star <= rating ? "text-warning" : "text-muted"} 
          />
        </span>
      ))}
      {!readOnly && (
        <span className="ms-2 small">({rating}/5)</span>
      )}
    </div>
  );
};

export const Home = () => {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const { user, isAuthenticated } = useAuthContext();

  useEffect(() => {
    // Загрузка отзывов
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/feedback`);
        setFeedback(response.data);
        
        // Расчет средней оценки
        if (response.data.length > 0) {
          const totalRating = response.data.reduce((sum: number, item: any) => sum + item.rating, 0);
          setAverageRating(totalRating / response.data.length);
        }
      } catch (error) {
        console.error('Ошибка при загрузке отзывов:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) return;
    
    try {
      setSubmitting(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Необходимо авторизоваться');
        return;
      }
      
      await axios.post(
        `${API_URL}/feedback`, 
        { 
          comment,
          // Отзыв без привязки к заказу
          order_id: 0,
          rating // Используем выбранный рейтинг
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Очистить форму
      setComment('');
      setRating(5);
      
      // Обновить список отзывов
      const response = await axios.get(`${API_URL}/feedback`);
      setFeedback(response.data);
      
      // Обновляем среднюю оценку
      if (response.data.length > 0) {
        const totalRating = response.data.reduce((sum: number, item: any) => sum + item.rating, 0);
        setAverageRating(totalRating / response.data.length);
      }
      
    } catch (error: any) {
      console.error('Ошибка при отправке отзыва:', error);
      alert(error.response?.data?.error || 'Ошибка при отправке отзыва');
    } finally {
      setSubmitting(false);
    }
  };

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

      {/* Отзывы клиентов */}
      <h2 className="text-center mb-4">Отзывы наших клиентов</h2>
      <Row className="mb-5">
        <Col md={8} className="mx-auto">
          {/* Средний рейтинг */}
          {feedback.length > 0 && (
            <Card className="shadow-sm mb-4 text-center">
              <Card.Body>
                <h3 className="mb-3">Средняя оценка</h3>
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <StarRating rating={Math.round(averageRating * 10) / 10} readOnly={true} />
                  <span className="ms-2 h4 mb-0">{averageRating.toFixed(1)}</span>
                </div>
                <p className="text-muted mb-0">На основе {feedback.length} отзывов</p>
              </Card.Body>
            </Card>
          )}
          
          <Card className="shadow-sm mb-4">
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 mb-0">Загрузка отзывов...</p>
                </div>
              ) : feedback.length > 0 ? (
                <div className="feedback-list">
                  {feedback.map((item) => (
                    <Card key={item.id} className="mb-3 border-0 bg-light">
                      <Card.Body>
                        <div className="d-flex align-items-center mb-2">
                          <FontAwesomeIcon icon={faUser} className="text-primary me-2" />
                          <strong>{item.username}</strong>
                          <span className="ms-auto">
                            <StarRating rating={item.rating} readOnly={true} />
                          </span>
                        </div>
                        <Card.Text>{item.comment}</Card.Text>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted mb-0">
                  Пока нет отзывов. Будьте первым, кто оставит отзыв!
                </p>
              )}
            </Card.Body>
          </Card>

          {isAuthenticated ? (
            <Card className="shadow-sm">
              <Card.Header className="bg-light">
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faComment} className="me-2" />
                  Оставьте свой отзыв
                </h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmitFeedback}>
                  <Form.Group className="mb-3">
                    <Form.Label>Ваша оценка</Form.Label>
                    <div>
                      <StarRating rating={rating} setRating={setRating} />
                    </div>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Комментарий</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Поделитесь вашим мнением о нашем сервисе"
                      required
                    />
                  </Form.Group>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={submitting || !comment.trim()}
                  >
                    {submitting ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                        <span className="ms-2">Отправка...</span>
                      </>
                    ) : 'Отправить отзыв'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          ) : (
            <Card className="shadow-sm text-center">
              <Card.Body>
                <p className="mb-3">Войдите в аккаунт, чтобы оставить отзыв</p>
                <Link to="/login">
                  <Button variant="outline-primary">
                    Войти в аккаунт
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          )}
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