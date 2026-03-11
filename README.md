# ClientOrder — Платформа для приёма и обработки заказов

[![Docker](https://img.shields.io/badge/Docker-✅-2496ED?logo=docker)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)

> 🎯 **Готовая к продакшену платформа** для сбора заявок от клиентов с аналитикой поведения, админ-панелью и автоматическим деплоем. Оптимизирована для работы на **VPS с 1 ГБ RAM**.

---

## 📑 Оглавление

- [✨ Возможности](#-возможности)
- [🖼️ Демонстрация](#️-демонстрация)
- [🏗️ Архитектура](#️-архитектура)
- [🛠️ Технологический стек](#️-технологический-стек)
- [🚀 Быстрый старт](#-быстрый-старт)
- [⚙️ Настройка](#️-настройка)
- [📁 Структура проекта](#-структура-проекта)
- [🔌 API Документация](#-api-документация)
- [🔐 Админ-панель](#-админ-панель)
- [💻 Локальная разработка](#-локальная-разработка)
- [🔧 Ресурсы и оптимизация](#-ресурсы-и-оптимизация)
- [🔒 Безопасность](#-безопасность)
- [❓ Устранение неполадок](#-устранение-неполадок)
- [🤝 Вклад в проект](#-вклад-в-проект)

---

## ✨ Возможности

### Для клиентов
- 📝 Многошаговая форма заказа с валидацией
- 🎨 Адаптивный интерфейс (mobile-first)
- ⚡ Мгновенная отправка и подтверждение

### Для администраторов
- 🔐 Безопасная авторизация через JWT (HttpOnly cookies)
- 📊 Дашборд с аналитикой и статистикой
- 🗂️ Управление заявками: фильтрация, поиск, экспорт
- 👥 Управление администраторами и ролями
- ⚙️ Гибкая настройка системы без перезапуска

### Для разработчиков
- 🐳 Полная контейнеризация (Docker + Compose)
- ♻️ Автообновление через Watchtower
- 📈 Аналитика поведения: время на странице, тепловая карта курсора, клики
- 🧪 Тестовые данные для отладки
- 📚 Swagger UI для документации API

---

## 🖼️ Демонстрация

> 💡 *Скриншоты работы в директории /work_example*

---

## 🏗️ Архитектура

```
                    Интернет
                        │
                        ▼
              ┌─────────────────┐
              │  Nginx :80/:443 │ ← Обратный прокси + SSL
              └────────┬────────┘
                       │
     ┌─────────────────┼─────────────────┐
     ▼                 ▼                 ▼
┌─────────┐   ┌─────────────┐   ┌─────────────┐
│Frontend │   │   Backend   │   │  PostgreSQL │
│ React   │   │  FastAPI    │   │   16        │
│   SPA   │   │ +SQLAlchemy │   │             │
└────┬────┘   └──────┬──────┘   └──────┬──────┘
     │              │                  │
     └──────────────┴──────────────────┘
                    │
         ┌──────────▼──────────┐
         │  backend-network    │ ← Internal: БД не доступна извне
         └─────────────────────┘
```

### Маршрутизация Nginx

| Путь | Сервис | Описание |
|------|--------|----------|
| `/` | Frontend | Публичная форма заказа |
| `/admin/*` | Frontend | Админ-панель (защищена JWT) |
| `/api/*` | Backend | REST API |
| `/docs` | Backend | Swagger UI |
| `/pgadmin/` | pgAdmin | Управление БД *(опционально, Basic Auth)* |

> 🔐 **Безопасность сети**: `backend-network` помечен как `internal` — PostgreSQL доступен только из контейнера backend.

---

## 🛠️ Технологический стек

| Компонент | Технология | Версия |
|-----------|-----------|--------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS | 18.x |
| **State/Form** | React Hook Form, Zustand | latest |
| **Backend** | FastAPI, SQLAlchemy (async), Pydantic v2 | 0.109+ |
| **Database** | PostgreSQL + asyncpg | 16.x |
| **Auth** | JWT (HttpOnly cookies), bcrypt | — |
| **Proxy** | Nginx + rate limiting | latest |
| **DevOps** | Docker, Compose, Watchtower | 24.x / v2 |
| **Monitoring** | pgAdmin 4 *(опционально)* | 4.x |

---

## 🚀 Быстрый старт

### 📋 Требования

```bash
✅ Docker ≥ 24.0
✅ Docker Compose v2.x  
✅ Linux-сервер (Ubuntu 22.04+ протестировано)
✅ Доменное имя → сервер (для HTTPS)
✅ Минимум 1 ГБ RAM, 2 vCPU
```

### 1️⃣ Клонирование репозитория

```bash
git clone https://github.com/YOUR_USERNAME/ClientOrder.git
cd ClientOrder
```

### 2️⃣ Настройка переменных окружения

```bash
# Скопировать шаблоны
cp .env.example .env
cp backend/.env.example backend/.env  
cp frontend/.env.example frontend/.env

# Сгенерировать секреты
SECRET_KEY=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)
POSTGRES_PASS=$(openssl rand -base64 32)

# Отредактировать .env (заменить CHANGE_ME_*)
nano .env
```

#### 🔑 Ключевые переменные

| Переменная | Описание | Пример |
|------------|----------|--------|
| `POSTGRES_PASSWORD` | Пароль БД | `xK9$mP2nQ...` |
| `SECRET_KEY` | Секрет FastAPI | `openssl rand -hex 32` |
| `JWT_SECRET_KEY` | Секрет JWT (мин. 32 символа) | `openssl rand -hex 32` |
| `CORS_ORIGINS` | Разрешённые домены | `["https://your-domain.com"]` |
| `COOKIE_SECURE` | `true` при использовании HTTPS | `true` |

### 3️⃣ Первоначальная настройка *(опционально)*

```bash
# Только если используете pgAdmin или Docker Registry
chmod +x setup.sh
./setup.sh
```

### 4️⃣ Запуск сервисов

```bash
docker compose up -d
```

### 5️⃣ Проверка работоспособности

| Сервис | URL | Статус |
|--------|-----|--------|
| 🛒 Форма заказа | `https://your-domain.com/` | ✅ |
| 👨‍💼 Админ-панель | `https://your-domain.com/admin/` | ✅ |
| 🔌 API | `https://your-domain.com/api/health` | ✅ |
| 📚 Swagger UI | `https://your-domain.com/docs` | ✅ |

> ℹ️ Первый вход в админ-панель: перейдите на `/admin/register` для создания супер-администратора.

---

## ⚙️ Настройка

### 🔐 Настройка HTTPS

1. Получите сертификаты (например, через Let's Encrypt):
```bash
certbot certonly --standalone -d your-domain.com
```

2. Скопируйте в проект:
```bash
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/
```

3. Раскомментируйте блок `server { listen 443 ssl; ... }` в `nginx/nginx.conf`

4. Перезапустите Nginx:
```bash
docker compose restart nginx
```

### 🧩 Опциональные сервисы

В `docker-compose.yml` раскомментируйте блоки для включения:

- `pgadmin` — веб-интерфейс для управления БД
- `registry` — приватный Docker Registry для авто-деплоя

> ⚠️ Не забудьте настроить `htpasswd` через `./setup.sh` перед включением!

---

## 📁 Структура проекта

```
ClientOrder/
├── 📄 docker-compose.yml      # Оркестрация сервисов
├── 📄 .env.example            # Шаблон переменных окружения
├── 📄 setup.sh                # Инициализация htpasswd
├── 📄 deploy-admin-updates.sh # Быстрый деплой обновлений
│
├── 📁 backend/
│   ├── 📄 Dockerfile
│   ├── 📄 requirements.txt
│   ├── 📄 .env.example
│   ├── 📄 init.sql            # Ручная инициализация БД
│   ├── 📁 scripts/
│   │   └── 📄 seed_test_leads.sql  # Тестовые данные
│   └── 📁 app/
│       ├── 📄 main.py         # Точка входа FastAPI
│       ├── 📁 core/           # Конфигурация, БД, безопасность
│       ├── 📁 models/         # SQLAlchemy ORM-модели
│       ├── 📁 schemas/        # Pydantic-схемы
│       ├── 📁 crud/           # Бизнес-логика доступа к данным
│       ├── 📁 routes/         # API-эндпоинты
│       └── 📁 services/       # Вспомогательные сервисы
│
├── 📁 frontend/
│   ├── 📄 Dockerfile
│   ├── 📄 vite.config.ts
│   ├── 📄 .env.example
│   ├── 📄 ADMIN_README.md     # Детальная документация админки
│   ├── 📄 package.json
│   └── 📁 src/
│       ├── 📁 components/     # UI-компоненты формы
│       ├── 📁 admin/          # Компоненты админ-панели
│       ├── 📁 hooks/          # Custom React hooks
│       ├── 📁 services/       # API-клиенты
│       ├── 📁 types/          # TypeScript интерфейсы
│       └── 📁 utils/          # Вспомогательные функции
│
├── 📁 nginx/
│   ├── 📄 nginx.conf          # Конфигурация прокси + rate limit
│   ├── 📁 ssl/                # SSL-сертификаты (.gitignore)
│   └── 📁 auth/               # htpasswd файлы (.gitignore)
│
└── 📁 work_example/           # Примеры и скриншоты
```

---

## 🔌 API Документация

### 🌐 Публичные эндпоинты

| Метод | Эндпоинт | Описание | Тело запроса |
|-------|----------|----------|--------------|
| `POST` | `/api/leads/` | Создать заявку | `{name, phone, budget, description}` |
| `POST` | `/api/analytics/` | Отправить аналитику | `{sessionId, events, cursorData}` |

### 🔐 Аутентификация (`/api/v1/auth`)

| Метод | Эндпоинт | Описание | Доступ |
|-------|----------|----------|--------|
| `GET` | `/registration-available` | Проверка возможности регистрации | Публичный |
| `POST` | `/register` | Регистрация первого админа | Только при 0 админов |
| `POST` | `/login` | Вход → установка JWT cookies | Публичный |
| `POST` | `/logout` | Выход + добавление в blacklist | Авторизованный |
| `POST` | `/refresh` | Обновление access token | Авторизованный |
| `GET` | `/me` | Данные текущего пользователя | Авторизованный |

### ⚙️ Административный API (`/api/v1/admin`)

| Метод | Эндпоинт | Описание | Роль |
|-------|----------|----------|------|
| `GET` | `/dashboard/stats` | Статистика для дашборда | Admin |
| `GET` | `/leads` | Список заявок с фильтрацией | Admin |
| `GET` | `/leads/{id}` | Детали заявки + аналитика | Admin |
| `GET` | `/admins/list` | Список администраторов | Superadmin |
| `PUT` | `/admins/{id}` | Обновление прав админа | Superadmin |
| `DELETE` | `/admins/{id}` | Удаление админа | Superadmin |

> 📚 **Полная интерактивная документация**: [`/docs`](https://your-domain.com/docs) (Swagger UI) или [`/redoc`](https://your-domain.com/redoc)

---

## 🔐 Админ-панель

Подробная документация по админ-панели вынесена в отдельный файл:  
👉 [frontend/ADMIN_README.md](frontend/ADMIN_README.md)

### Ключевые особенности:
- 🔐 **JWT в HttpOnly cookies** — защита от XSS
- 🛡️ **SameSite=strict + CSRF protection**
- 🔑 **Bcrypt (cost=12)** для хэширования паролей
- ⏱️ **Rate limiting**: 5 запросов/мин на эндпоинты аутентификации
- ♻️ **Refresh token rotation** с blacklist'ом
- 🕒 **TTL токенов**: Access — 30 мин, Refresh — 7 дней

---

## 💻 Локальная разработка

### 🐍 Backend (FastAPI)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Запуск с авто-релоадом
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Документация: http://localhost:8000/docs
```

### ⚛️ Frontend (React + Vite)

```bash
cd frontend
npm install

# Запуск dev-сервера с прокси на backend
npm run dev

# Приложение: http://localhost:5173
# API-запросы автоматически проксируются на http://localhost:8000
```

### 🐘 PostgreSQL (локально)

```bash
# Запустить только БД из docker-compose
docker compose up -d postgres

# Подключиться
docker exec -it autovip-postgres psql -U autovip -d autovip
```

---

## 🔧 Ресурсы и оптимизация

### 📊 Потребление ресурсов (базовая конфигурация)

| Контейнер | RAM (лимит) | CPU (лимит) | Примечание |
|-----------|-------------|-------------|------------|
| `nginx` | 48 МБ | 0.30 | Обратный прокси |
| `frontend` | 32 МБ | 0.15 | Статический контент |
| `backend` | 192 МБ | 0.50 | FastAPI + async |
| `postgres` | 256 МБ | 0.50 | Основное хранилище |
| `watchtower` | 64 МБ | 0.15 | Авто-обновление |
| **Итого** | **~592 МБ** | **~1.6 ядра** | ✅ Укладывается в 1 ГБ RAM |

### 🚀 Оптимизация для слабой инфраструктуры

```yaml
# В docker-compose.yml можно дополнительно:
services:
  postgres:
    command: >
      postgres
      -c shared_buffers=128MB
      -c effective_cache_size=256MB
      -c work_mem=4MB
      -c maintenance_work_mem=32MB
```

> 💡 **Совет**: Отключите `pgAdmin` и `registry` в продакшене, если они не используются — сэкономите ~320 МБ RAM.

---

## 🔒 Безопасность

### ✅ Реализованные меры

- [x] JWT-токены в **HttpOnly + Secure + SameSite=strict** cookies
- [x] **Bcrypt** с `cost=12` для хэширования паролей
- [x] **Rate limiting** на эндпоинты аутентификации (5 запросов/мин)
- [x] **Token blacklist** с авто-очисткой по TTL
- [x] **Refresh token rotation** — старый токен аннулируется при обновлении
- [x] **Internal Docker network** — PostgreSQL недоступен извне
- [x] **CORS** с явным списком разрешённых доменов
- [x] **Input validation** через Pydantic v2

### 🔐 Рекомендации для продакшена

1. Всегда используйте **HTTPS** (Let's Encrypt + авто-обновление)
2. Регулярно обновляйте образы: `watchtower` делает это автоматически
3. Меняйте секреты при компрометации:  
   ```bash
   openssl rand -hex 32  # для SECRET_KEY и JWT_SECRET
   ```
4. Настройте бэкапы PostgreSQL:  
   ```bash
   docker exec autovip-postgres pg_dump -U autovip autovip > backup.sql
   ```

---

## ❓ Устранение неполадок

### 🚨 Контейнеры не запускаются

```bash
# Проверить логи
docker compose logs -f

# Проверить переменные окружения
docker compose config

# Пересобрать образы
docker compose up -d --build
```

### 🔐 Ошибка 401 в админ-панели

- Убедитесь, что `JWT_SECRET_KEY` одинаков в `.env` и `backend/.env`
- Проверьте, что `COOKIE_SECURE=false` при разработке без HTTPS
- Очистите cookies браузера и войдите заново

### 🐘 Ошибка подключения к БД

```bash
# Проверить статус PostgreSQL
docker compose ps postgres

# Проверить логи БД
docker compose logs postgres

# Убедиться, что пароль в DATABASE_URL совпадает с POSTGRES_PASSWORD
```

### 🌐 CORS-ошибки при разработке

- В `backend/.env` установите:  
  ```env
  CORS_ORIGINS=["http://localhost:5173", "http://127.0.0.1:5173"]
  ```

### 💾 "No space left on device"

```bash
# Очистить неиспользуемые образы и volumes
docker system prune -a --volumes

# Проверить место
df -h
```

---

## 🤝 Вклад в проект

Приветствуются любые улучшения! 🙌

1. **Fork** репозиторий
2. Создайте ветку для фичи: `git checkout -b feature/amazing-feature`
3. Внесите изменения и протестируйте
4. Закоммитьте: `git commit -m 'feat: добавить amazing-feature'`
5. Отправьте: `git push origin feature/amazing-feature`
6. Откройте **Pull Request** 🎉

### 📋 Guidelines

- Следуйте [Conventional Commits](https://www.conventionalcommits.org/)
- Добавляйте тесты для новой функциональности
- Обновляйте документацию при изменении API
- Проверяйте код через `ruff` (backend) и `eslint` (frontend)

---

Copyright (c) 2026 RomanShe19

Permission is hereby granted...
