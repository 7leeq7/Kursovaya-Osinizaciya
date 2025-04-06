import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faClock, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import AddressSearch from './AddressSearch';
import axios from 'axios';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';

// Добавляем интерфейс Service
interface Service {
  id: number;
  title: string;
  price: number;
  duration: string;
  description?: string;
  category?: string;
}

interface ServiceOrderProps {
  show: boolean;
  onHide: () => void;
  service: Service;
  onOrderComplete: () => void;
}

export const ServiceOrder = ({ show, onHide, service, onOrderComplete }: ServiceOrderProps) => {
  const navigate = useNavigate();
  const [scheduledTime, setScheduledTime] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Необходимо войти в систему');
        return;
      }

      await axios.post(
        `${API_URL}/orders`,
        {
          serviceId: service.id,
          scheduledTime: new Date(scheduledTime).toISOString(),
          address: address
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess(true);
      onOrderComplete();
      
      // Перенаправляем на страницу профиля через 2 секунды
      setTimeout(() => {
        onHide();
        navigate('/profile', { state: { activeTab: 'orders' } });
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Ошибка при создании заказа');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Получаем минимальную дату (сегодня) и максимальную дату (через месяц)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 1);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Заказ услуги: {service.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {success ? (
          <Alert variant="success">
            Заказ успешно создан! Сейчас вы будете перенаправлены на страницу ваших заказов.
          </Alert>
        ) : (
          <Form onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <div className="mb-4">
              <h5>Детали заказа:</h5>
              <p className="mb-2">
                <FontAwesomeIcon icon={faClock} className="me-2" />
                Длительность: {service.duration}
              </p>
              <p className="mb-2">
                Стоимость: {service.price} руб.
              </p>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                Адрес
              </Form.Label>
              <AddressSearch
                value={address}
                onChange={setAddress}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                Выберите дату и время
              </Form.Label>
              <Form.Control
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                min={getMinDate()}
                max={getMaxDate()}
                required
              />
            </Form.Group>

            <div className="d-grid">
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Оформление заказа...' : 'Заказать'}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
}; 