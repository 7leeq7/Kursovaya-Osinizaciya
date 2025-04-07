import { Container, Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect } from 'react';
import AOS from 'aos';

export const FAQ = () => {
  const { theme } = useTheme();
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({ 0: true });
  
  useEffect(() => {
    AOS.refresh();
  }, [theme]);
  
  const toggleItem = (index: number) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  const faqItems = [
    {
      question: "Какие услуги вы предоставляете?",
      answer: "Мы предоставляем широкий спектр услуг ассенизации, включая откачку септиков, выгребных ям, автомоек, жироуловителей, а также прочистку канализации. Работаем как с частными лицами, так и с коммерческими объектами."
    },
    {
      question: "Как быстро вы можете приехать?",
      answer: "В большинстве случаев мы приезжаем в течение 1-3 часов после заказа. При плановых работах согласовываем удобное для вас время. Для экстренных случаев у нас работает круглосуточная служба."
    },
    {
      question: "Какая вместимость у ваших ассенизаторских машин?",
      answer: "Наш автопарк включает машины различной вместимости от 3 до 10 кубометров. Это позволяет нам подобрать оптимальный вариант для любого объема работ."
    },
    {
      question: "Как формируется цена на ваши услуги?",
      answer: "Стоимость услуг зависит от объема работ, удаленности объекта, типа откачиваемых отходов и необходимости в дополнительных услугах. Для получения точной цены вы можете оформить заявку на нашем сайте или связаться с нами по телефону."
    },
    {
      question: "Вы работаете с юридическими лицами?",
      answer: "Да, мы работаем как с физическими, так и с юридическими лицами. Для организаций мы предлагаем заключение долгосрочных договоров на обслуживание с гибкими условиями оплаты и специальными тарифами."
    },
    {
      question: "Какие документы вы предоставляете после выполнения работ?",
      answer: "После выполнения работ мы предоставляем акт выполненных работ и все необходимые документы для бухгалтерии. Для юридических лиц также доступны закрывающие документы для отчетности."
    },
    {
      question: "Работаете ли вы в выходные и праздничные дни?",
      answer: "Да, наша компания работает без выходных, включая праздничные дни. В экстренных случаях мы готовы выехать на объект в любое время суток."
    },
    {
      question: "Есть ли у вас скидки для постоянных клиентов?",
      answer: "Да, для постоянных клиентов у нас действует программа лояльности с накопительными скидками. Также мы предлагаем специальные тарифы при заключении договора на регулярное обслуживание."
    },
    {
      question: "Как происходит оплата ваших услуг?",
      answer: "Оплата может производиться наличными водителю-ассенизатору после выполнения работ, безналичным переводом или банковской картой. Для юридических лиц доступна оплата по счету."
    },
    {
      question: "Вы вывозите только бытовые отходы или промышленные тоже?",
      answer: "Мы вывозим как бытовые, так и некоторые виды промышленных отходов. Однако для опасных отходов требуется специальное оборудование и разрешения. Уточнить возможность вывоза конкретного типа отходов можно у наших специалистов."
    }
  ];

  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col>
          <h1 className="text-center mb-4" data-aos="fade-down">
            <FontAwesomeIcon icon={faQuestionCircle} className="text-primary me-2" />
            Часто задаваемые вопросы
          </h1>
          <p className="lead text-center" data-aos="fade-up" data-aos-delay="100">
            Здесь вы найдете ответы на самые распространенные вопросы о наших услугах
          </p>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col lg={10} className="mx-auto">
          <Card className={`shadow-sm ${theme === 'dark' ? 'bg-dark text-light' : ''}`} data-aos="fade-up" data-aos-delay="150">
            <Card.Body>
              <div className="faq-collapsible" data-aos="fade-up" data-aos-delay="200">
                {faqItems.map((item, index) => (
                  <div key={index} className="faq-item mb-3">
                    <div 
                      className={`faq-question ${theme === 'dark' ? 'dark-faq-question' : ''}`}
                      onClick={() => toggleItem(index)}
                    >
                      <h5 className="mb-0 fw-bold d-flex justify-content-between align-items-center">
                        <span>{item.question}</span>
                        <FontAwesomeIcon 
                          icon={openItems[index] ? faChevronUp : faChevronDown} 
                          className="ms-2 faq-icon"
                        />
                      </h5>
                    </div>
                    <div className={`faq-answer ${openItems[index] ? 'open' : ''} ${theme === 'dark' ? 'dark-faq-answer' : ''}`}>
                      <p className="mb-0 p-3">{item.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col className="text-center" data-aos="fade-up" data-aos-delay="250">
          <p className="lead">Не нашли ответ на свой вопрос?</p>
          <p>Свяжитесь с нами по телефону <strong>+375 (29) 979-86-09</strong> или напишите на электронную почту <strong>7leeq7@gmail.com</strong></p>
        </Col>
      </Row>
    </Container>
  );
}; 