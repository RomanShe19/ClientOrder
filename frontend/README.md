# AutoVIP Frontend

Production-ready фронтенд для системы сбора лидов. Построен на React 18, TypeScript и Tailwind CSS с акцентом на минимальный размер бандла и быструю загрузку.

## Стек технологий

- **React 18** + TypeScript
- **Vite** — сборка и dev-server
- **Tailwind CSS** — utility-first стилизация
- **React Hook Form** — валидация форм
- **Axios** — HTTP-клиент с retry-логикой

## Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера (http://localhost:3000)
npm run dev

# Линтинг
npm run lint
```

Dev-сервер проксирует `/api` на `http://localhost:80` (Nginx).

## Production build

```bash
npm run build
```

Артефакты сборки — в `dist/`. Консоль и debugger автоматически удаляются, source maps отключены.

## Docker

```bash
# Сборка образа
docker build -t autovip-frontend .

# Запуск контейнера
docker run -p 3000:80 autovip-frontend
```

Multi-stage build: сначала `node:18-alpine` собирает проект, затем `nginx:1-alpine` раздаёт статику (~15 MB итоговый образ).

## Интеграция с backend

| Фронтенд | Nginx → Backend |
|---|---|
| `POST /api/leads/` | Создание заявки |
| `GET /api/admin/configs/by-key/{key}` | Конфигурация формы (ниши, бюджеты, типы задач) |
| `POST /api/analytics/` | Отправка аналитики поведения |

Все запросы идут через Nginx proxy — фронтенд использует относительные пути.

## Переменные окружения

| Переменная | Описание | По умолчанию |
|---|---|---|
| `VITE_API_URL` | Базовый URL API | `/api` |
| `VITE_APP_NAME` | Название приложения | `AutoVIP` |
| `VITE_ANALYTICS_ENABLED` | Включить трекинг аналитики | `true` |

## Структура проекта

```
src/
├── components/
│   ├── ui/          # Button, Input, Select, Textarea, LoadingSpinner
│   ├── form/        # LeadForm, ContactInfo, BusinessInfo, ProjectDetails, Preferences
│   └── layout/      # Header, Footer, PageContainer
├── hooks/           # useLeadSubmit, useAnalytics, useFormTracking
├── services/        # API клиент, leadService, analyticsService
├── types/           # TypeScript интерфейсы
└── utils/           # Валидаторы, аналитика
```

## Оптимизация

- **Code splitting**: vendor (React), forms (react-hook-form), app code
- **Terser**: удаление console.log и debugger в production
- **Gzip**: поддержка через Nginx
- **Кэширование**: статика — 1 год (immutable), index.html — без кэша
- **Lazy loading**: изображения загружаются по мере необходимости
