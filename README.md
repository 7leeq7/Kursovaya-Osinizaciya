# Курсовой проект по СТОЭИ
## Тема: "Разработка веб-приложения для автоматизированного управления услугами ассенизации"

<div align="center">
  <img src="./src/assets/images/mitso-logo.jpg" alt="МИТСО Логотип" width="200">
</div>

## Описание проекта
Данный проект представляет собой веб-приложение для автоматизации управления услугами ассенизации. Система позволяет клиентам заказывать услуги откачки септиков и выгребных ям, а компаниям-исполнителям эффективно управлять заказами, техникой и расписанием работ.

## Функциональность
- Регистрация и авторизация пользователей (клиенты и исполнители)
- Оформление заказов на услуги ассенизации
- Выбор даты и времени оказания услуг
- Расчет стоимости услуг в зависимости от параметров
- Отслеживание статуса заказа в реальном времени
- Управление автопарком ассенизаторских машин
- Формирование оптимальных маршрутов
- Система оценок и отзывов о качестве услуг
- Административная панель для управления системой

## Технологии
- Frontend: React, TypeScript
- Backend: Node.js
- База данных: SQLite
- Авторизация: JWT
- Геолокация: Dadata

## Структура проекта
- `/src` - исходный код приложения
- `/public` - статические файлы
- `/dist` - скомпилированные файлы для production
- `/assets` - изображения и другие ресурсы

## Установка и запуск
```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для production
npm run build

# Запуск сервера
node server.js
```

## Автор
Курсовой проект выполнен студентом [Шепелевичем Максимом Геннадьевичем] группы [2221] факультета [Экономического факультета] Международного университета "МИТСО".

## Научный руководитель
[Петрович Юлия Юрьевна], [Старший преподаватель кафедры экономики и менеджмента]