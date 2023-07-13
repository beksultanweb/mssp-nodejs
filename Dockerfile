# Указываем базовый образ
FROM node:18-alpine

# Устанавливаем зависимости
WORKDIR /app
COPY package*.json ./
RUN npm install

# Копируем исходный код
COPY . .

# Указываем команду для запуска приложения
CMD ["npm", "run", "dev"]