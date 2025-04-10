# Запуск проекта в Docker
## Требования

- Docker
- Docker Compose

## Запуск приложения

### Использование Docker Compose (рекомендуется)

1. Клонируйте репозиторий:
```bash
git clone <url-репозитория>
cd <директория-проекта>
```

2. Запустите приложение с помощью Docker Compose:
```bash
docker-compose up -d
```

3. Приложение будет доступно по адресу: http://localhost:3000

4. Для остановки приложения:
```bash
docker-compose down
```

### Использование Dockerfile

1. Соберите Docker-образ:
```bash
docker build -t kursovaya-app .
```

2. Запустите контейнер:
```bash
docker run -p 3000:3000 -v $(pwd)/database.sqlite:/app/database.sqlite -e JWT_SECRET=your_jwt_secret_key -d kursovaya-app
```

3. Приложение будет доступно по адресу: http://localhost:3000

## Настройка переменных окружения

В файле `docker-compose.yml` вы можете изменить следующие переменные окружения:

- `PORT`: порт, на котором будет запущен сервер (по умолчанию 3000)
- `JWT_SECRET`: секретный ключ для JWT аутентификации (рекомендуется изменить для продакшн)
- `DB_PATH`: путь к файлу базы данных SQLite

## База данных

SQLite база данных сохраняется как том Docker, поэтому данные сохраняются между перезапусками контейнера. 