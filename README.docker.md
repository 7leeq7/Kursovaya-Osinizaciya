# Запуск проекта в Docker
## Требования

- Docker
- Docker Compose

## Запуск приложения

Запустите приложение с помощью Docker Compose:
```bash
docker-compose up -d
```

Приложение будет доступно по адресу: http://localhost:3000

Для остановки приложения:
```bash
docker-compose down
```

## База данных

SQLite база данных сохраняется как том Docker, поэтому данные сохраняются между перезапусками контейнера. 

npm run test:integration 