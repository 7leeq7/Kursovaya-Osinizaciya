import { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faUser, faEnvelope, faLock, faPhone } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { API_URL } from '../../config';
import AddressSearch from '../AddressSearch';

const Register = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Сбрасываем ошибку для измененного поля
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Валидация имени пользователя
    if (!formData.username.trim()) {
      newErrors.username = 'Пожалуйста, введите имя пользователя';
    }
    
    // Валидация email
    if (!formData.email.trim()) {
      newErrors.email = 'Пожалуйста, введите email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Пожалуйста, введите корректный email';
    }
    
    // Валидация пароля
    if (!formData.password) {
      newErrors.password = 'Пожалуйста, введите пароль';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать не менее 6 символов';
    }
    
    // Валидация подтверждения пароля
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    // Валидация телефона
    if (formData.phone && !/^\+?[0-9]{10,12}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Пожалуйста, введите корректный номер телефона';
    }

    // Валидация адреса
    if (formData.address && formData.address.length < 5) {
      newErrors.address = 'Адрес должен содержать не менее 5 символов';
    }
    
    return newErrors;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post(`${API_URL}/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address
      });

      const { token, user } = response.data;
      
      // Очищаем токен и данные пользователя после регистрации
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      setSuccess(true);
      
      // Перенаправление на страницу логина через 2 секунды
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      if (error.response) {
        // Ошибка от сервера
        setErrors({
          submit: error.response.data.error || 'Ошибка при регистрации'
        });
      } else if (error.request) {
        // Ошибка сети
        setErrors({
          submit: 'Ошибка соединения с сервером'
        });
      } else {
        setErrors({
          submit: 'Произошла ошибка при регистрации'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow" data-aos="zoom-in">
            <Card.Body className="p-4">
              <div className="text-center mb-4" data-aos="fade-down" data-aos-delay="100">
                <FontAwesomeIcon icon={faUserPlus} size="3x" className="text-primary mb-3" />
                <h2>Регистрация</h2>
                <p className="text-muted">Создайте аккаунт для доступа к сервису</p>
              </div>
              
              {success ? (
                <Alert variant="success" className="text-center" data-aos="fade-up" data-aos-delay="200">
                  <h4>Регистрация успешна!</h4>
                  <p>
                    Ваш аккаунт успешно создан. Сейчас вы будете перенаправлены на страницу входа...
                  </p>
                </Alert>
              ) : (
                <Form onSubmit={handleSubmit} data-aos="fade-up" data-aos-delay="200">
                  {errors.submit && (
                    <Alert variant="danger">{errors.submit}</Alert>
                  )}
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Имя пользователя</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FontAwesomeIcon icon={faUser} />
                      </span>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Введите имя пользователя"
                        isInvalid={!!errors.username}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.username}
                      </Form.Control.Feedback>
                    </div>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FontAwesomeIcon icon={faEnvelope} />
                      </span>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Введите email"
                        isInvalid={!!errors.email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </div>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Пароль</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FontAwesomeIcon icon={faLock} />
                      </span>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Введите пароль"
                        isInvalid={!!errors.password}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.password}
                      </Form.Control.Feedback>
                    </div>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Подтверждение пароля</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FontAwesomeIcon icon={faLock} />
                      </span>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Подтвердите пароль"
                        isInvalid={!!errors.confirmPassword}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.confirmPassword}
                      </Form.Control.Feedback>
                    </div>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Телефон</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FontAwesomeIcon icon={faPhone} />
                      </span>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Введите номер телефона"
                        isInvalid={!!errors.phone}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.phone}
                      </Form.Control.Feedback>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      {/* <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-primary" /> */}
                      Адрес
                    </Form.Label>
                    <div>
                      <AddressSearch
                        value={formData.address}
                        onChange={(address) => {
                          setFormData(prev => ({ ...prev, address }));
                          if (errors.address) {
                            setErrors(prev => ({ ...prev, address: '' }));
                          }
                        }}
                      />
                      {errors.address && (
                        <div className="text-danger small mt-1">
                          {errors.address}
                        </div>
                      )}
                    </div>
                  </Form.Group>
                  
                  <div className="d-grid">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      size="lg" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        'Регистрация...'
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                          Зарегистрироваться
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              )}
              
              <div className="text-center mt-4">
                <p>
                  Уже есть аккаунт? <Link to="/login" className="text-primary">Войти</Link>
                </p>
                <p className="mb-0">
                  <Link to="/">Вернуться на главную</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export { Register }; 