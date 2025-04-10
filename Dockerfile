FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код проекта
COPY . .

# Устанавливаем переменные окружения
ENV PORT=3000
ENV JWT_SECRET=your_jwt_secret_key
ENV DB_PATH=/app/database.sqlite

# Собираем клиентскую часть
RUN npm run build

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"] 