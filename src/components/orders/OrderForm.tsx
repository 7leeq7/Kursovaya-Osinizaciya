import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

// Интерфейсы
interface ServiceOption {
  id: number;
  title: string;
  price: number;
  priceUnit: string;
}

interface OrderData {
  serviceId: number;
  name: string;
  phone: string;
  address: string;
  date: string;
  volume: string;
  comments: string;
  agreementChecked: boolean;
}

const OrderForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const serviceId = queryParams.get('service') ? parseInt(queryParams.get('service') as string) : 0;
  const isCustom = queryParams.get('custom') === 'true';

  // Список доступных услуг (в реальном приложении получали бы с сервера)
  const serviceOptions: ServiceOption[] = [
    { id: 0, title: 'Выберите услугу', price: 0, priceUnit: '' },
    { id: 1, title: 'Откачка септика', price: 1500, priceUnit: 'от' },
    { id: 2, title: 'Откачка выгребных ям', price: 1300, priceUnit: 'от' },
    { id: 3, title: 'Прочистка канализации', price: 2000, priceUnit: 'от' },
    { id: 4, title: 'Обслуживание биотуалетов', price: 900, priceUnit: 'от' },
    { id: 5, title: 'Вывоз ЖБО', price: 1800, priceUnit: 'от' },
    { id: 6, title: 'Разработка документации', price: 5000, priceUnit: '' },
    { id: 7, title: 'Другое (укажите в комментариях)', price: 0, priceUnit: '' }
  ];

  // Инициализация состояния формы
  const [formData, setFormData] = useState<OrderData>({
    serviceId: serviceId || 0,
    name: '',
    phone: '',
    address: '',
    date: '',
    volume: '',
    comments: isCustom ? 'Индивидуальный запрос: ' : '',
    agreementChecked: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // Сбрасываем ошибку при изменении поля
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Валидация формы
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.serviceId === 0) {
      newErrors.serviceId = 'Пожалуйста, выберите услугу';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Пожалуйста, укажите ваше имя';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Пожалуйста, укажите номер телефона';
    } else if (!/^\+?[0-9]{10,12}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Пожалуйста, укажите корректный номер телефона';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Пожалуйста, укажите адрес';
    }
    
    if (!formData.date.trim()) {
      newErrors.date = 'Пожалуйста, выберите дату';
    }
    
    if (!formData.agreementChecked) {
      newErrors.agreementChecked = 'Необходимо согласиться с условиями';
    }
    
    return newErrors;
  };

  // Отправка формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    // Имитация отправки данных на сервер
    setTimeout(() => {
      console.log('Данные заказа:', formData);
      setIsSubmitting(false);
      setSubmitted(true);
      
      // В реальном приложении здесь был бы API-запрос
      
      // Перенаправление на страницу успешного заказа через 2 секунды
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    }, 1500);
  };

  // Установка минимальной даты на следующий день
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4 text-center">Заказ услуги</h1>
      
      {submitted ? (
        <Alert variant="success" className="text-center">
          <FontAwesomeIcon icon={faCheck} className="me-2" size="lg" />
          <h4 className="mb-3">Заказ успешно отправлен!</h4>
          <p>
            Ваш заказ принят в обработку. В ближайшее время с вами свяжется наш менеджер для уточнения деталей.
          </p>
          <p className="mb-0">
            Вы будете перенаправлены на страницу ваших заказов...
          </p>
        </Alert>
      ) : (
        <Row>
          <Col lg={8}>
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Выберите услугу *</Form.Label>
                    <Form.Select 
                      name="serviceId"
                      value={formData.serviceId}
                      onChange={handleChange}
                      isInvalid={!!errors.serviceId}
                    >
                      {serviceOptions.map(service => (
                        <option key={service.id} value={service.id}>
                          {service.title} {service.price > 0 ? `(${service.priceUnit} ${service.price} ₽)` : ''}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.serviceId}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Ваше имя *</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Иван Иванов"
                          isInvalid={!!errors.name}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.name}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Телефон *</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+7 (___) ___-__-__"
                          isInvalid={!!errors.phone}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.phone}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Адрес *</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Ваш полный адрес"
                      isInvalid={!!errors.address}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.address}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Дата выполнения *</Form.Label>
                        <Form.Control
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          min={getTomorrowDate()}
                          isInvalid={!!errors.date}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.date}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Объем (в кубометрах)</Form.Label>
                        <Form.Control
                          type="text"
                          name="volume"
                          value={formData.volume}
                          onChange={handleChange}
                          placeholder="Примерный объем (если известен)"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Комментарии</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="comments"
                      value={formData.comments}
                      onChange={handleChange}
                      placeholder="Дополнительная информация"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="agreement"
                      name="agreementChecked"
                      checked={formData.agreementChecked}
                      onChange={handleChange}
                      label="Я согласен с условиями обработки персональных данных *"
                      isInvalid={!!errors.agreementChecked}
                      feedback={errors.agreementChecked}
                      feedbackType="invalid"
                    />
                  </Form.Group>
                  
                  <div className="d-grid">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>Обработка заказа...</>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faSave} className="me-2" />
                          Отправить заказ
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4}>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Информация о заказе</h5>
              </Card.Header>
              <Card.Body>
                <p>
                  <strong>Выбранная услуга:</strong><br />
                  {formData.serviceId === 0 ? 
                    'Не выбрана' : 
                    serviceOptions.find(s => s.id === formData.serviceId)?.title
                  }
                </p>
                
                {formData.serviceId > 0 && serviceOptions.find(s => s.id === formData.serviceId)?.price > 0 && (
                  <p>
                    <strong>Ориентировочная стоимость:</strong><br />
                    {serviceOptions.find(s => s.id === formData.serviceId)?.priceUnit}{' '}
                    {serviceOptions.find(s => s.id === formData.serviceId)?.price} ₽
                    <small className="d-block text-muted">
                      Окончательная стоимость будет рассчитана после осмотра объекта
                    </small>
                  </p>
                )}
                
                <Alert variant="info" className="mb-0">
                  <small>
                    После отправки заказа наш менеджер свяжется с вами для подтверждения 
                    и уточнения деталей. Вы также можете отслеживать статус заказа в личном кабинете.
                  </small>
                </Alert>
              </Card.Body>
            </Card>
            
            <Card className="shadow-sm">
              <Card.Body>
                <h5>Контактная информация</h5>
                <p className="mb-2">Телефон: <strong>+7 (123) 456-78-90</strong></p>
                <p className="mb-0">Email: <strong>info@assservice.ru</strong></p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default OrderForm; 