# Сайт для обработки заказов от покупателей

Готовая к продакшену самохостируемая платформа для приёма и обработки заказов. Покупатели заполняют многошаговую форму с контактными данными, описанием задачи и бюджетом; заказы сохраняются в PostgreSQL с полной аналитикой поведения (время на странице, тепловая карта курсора, клики по кнопкам). Спроектирована для работы на **VPS с 1 ГБ RAM** внутри Docker с приватным реестром образов и автоматическими обновлениями.

---

## Архитектура

```
Интернет
    │
    ▼
[ Nginx :80/:443 ]  ← обратный прокси + Basic Auth для /admin
    │
    ├─► /           → [ Frontend ] React SPA (раздаётся nginx:alpine)
    ├─► /api/       → [ Backend  ] FastAPI + SQLAlchemy (async)
    ├─► /docs       → [ Backend  ] Swagger UI
    ├─► /admin/     → [ pgAdmin  ] Веб-интерфейс PostgreSQL (Basic Auth)
    └─► /v2/        → [ Registry ] Приватный Docker-реестр
                              │
                     [ Watchtower ] — следит за реестром, авто-деплой при новых образах
```

**Сети:**
- `frontend-network` — nginx, frontend, backend, pgAdmin, registry
- `backend-network` (internal) — только backend + PostgreSQL; БД никогда не доступна снаружи

---

## Технологический стек

| Слой | Технология |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Hook Form |
| Backend | FastAPI, SQLAlchemy 2 (async), asyncpg, Pydantic v2 |
| База данных | PostgreSQL 16 |
| Обратный прокси | Nginx |
| Администрирование БД | pgAdmin 4 |
| Реестр контейнеров | Docker Registry v2 |
| Автообновление | Watchtower |

---

## Быстрый старт

### Требования

- Docker ≥ 24 и Docker Compose v2
- Linux-сервер (проверено на Ubuntu 22.04+)
- Доменное имя, указывающее на сервер (для HTTPS)

### 1. Клонировать репозиторий

```bash
git clone https://github.com/YOUR_USERNAME/ClientOrder.git
cd ClientOrder
```

### 2. Настроить переменные окружения

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Открыть `.env` и заменить все `CHANGE_ME_*` на реальные значения:

| Переменная | Описание |
|---|---|
| `POSTGRES_PASSWORD` | Пароль PostgreSQL |
| `PGADMIN_PASSWORD` | Пароль веб-интерфейса pgAdmin |
| `NGINX_ADMIN_PASSWORD` | Пароль HTTP Basic Auth для `/admin/` |
| `REGISTRY_PASSWORD` | Пароль для Docker Registry |
| `SECRET_KEY` | Случайный секрет бэкенда (сгенерировать: `openssl rand -hex 32`) |

В `backend/.env`:
- Обновить `DATABASE_URL` с реальным `POSTGRES_PASSWORD`
- Установить `CORS_ORIGINS` на свой домен, например `["https://your-domain.com"]`

### 3. Запустить скрипт первоначальной настройки

```bash
chmod +x setup.sh
./setup.sh
```

Скрипт сгенерирует хэши паролей для Nginx Basic Auth и Docker Registry из значений в `.env`.

### 4. Запустить все сервисы

```bash
docker compose up -d
```

После запуска сервисы доступны по адресам:

| URL | Сервис |
|---|---|
| `http://your-server/` | React-приложение |
| `http://your-server/api/` | Backend API |
| `http://your-server/docs` | Swagger UI |
| `http://your-server/admin/` | pgAdmin (Basic Auth) |
| `http://your-server/v2/` | Docker Registry |

---

## Структура проекта

```
ClientOrder/
├── .env.example            # Шаблон корневых переменных (пароли, реестр, watchtower)
├── docker-compose.yml      # 7 сервисов с лимитами ресурсов
├── setup.sh                # Скрипт первоначальной настройки
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   ├── init.sql            # Ручная инициализация БД (запасной вариант)
│   └── app/
│       ├── main.py
│       ├── core/           # Конфиг, движок базы данных
│       ├── models/         # ORM-модели SQLAlchemy
│       ├── schemas/        # Pydantic-схемы
│       ├── crud/           # Асинхронные CRUD-операции
│       └── routes/         # FastAPI-роутеры
│
├── frontend/
│   ├── Dockerfile
│   ├── .env.example
│   ├── nginx.conf          # Раздача статики
│   ├── package.json
│   └── src/
│       ├── components/     # UI-компоненты, шаги формы, layout
│       ├── hooks/          # useLeadSubmit, useAnalytics, useFormTracking
│       ├── services/       # API-клиент, сервисы лидов и аналитики
│       ├── types/          # TypeScript-интерфейсы
│       └── utils/          # Валидаторы, утилиты аналитики
│
├── nginx/
│   ├── nginx.conf          # Конфиг обратного прокси
│   ├── ssl/                # SSL-сертификаты (не хранятся в git)
│   └── auth/               # htpasswd-файлы (не хранятся в git)
│
└── registry/
    └── auth/               # htpasswd Docker Registry (не хранится в git)
```

---

## Справка по API

### Лиды

| Метод | Эндпоинт | Описание |
|---|---|---|
| `POST` | `/api/leads/` | Создать заявку |
| `GET` | `/api/leads/` | Список всех заявок |
| `GET` | `/api/leads/{id}` | Получить заявку по ID |
| `PATCH` | `/api/leads/{id}` | Обновить заявку |
| `DELETE` | `/api/leads/{id}` | Удалить заявку |

### Аналитика

| Метод | Эндпоинт | Описание |
|---|---|---|
| `POST` | `/api/analytics/` | Создать запись аналитики |
| `GET` | `/api/analytics/{lead_id}` | Получить аналитику по заявке |
| `PATCH` | `/api/analytics/{lead_id}` | Обновить аналитику |

### Конфигурация (Admin)

| Метод | Эндпоинт | Описание |
|---|---|---|
| `GET` | `/api/admin/configs/` | Получить все конфиг-записи |
| `POST` | `/api/admin/configs/` | Создать конфиг-запись |
| `PATCH` | `/api/admin/configs/{key}` | Обновить конфиг-запись |
| `DELETE` | `/api/admin/configs/{key}` | Удалить конфиг-запись |

### Health Check

| Метод | Эндпоинт | Описание |
|---|---|---|
| `GET` | `/api/health` | Проверка работоспособности |

Полная интерактивная документация доступна по `/docs` (Swagger UI) и `/redoc`.

---

## Лимиты ресурсов

| Контейнер | RAM | CPU |
|---|---|---|
| nginx | 48 МБ | 0.30 |
| frontend | 32 МБ | 0.15 |
| backend | 192 МБ | 0.50 |
| postgres | 256 МБ | 0.50 |
| pgadmin | 256 МБ | 0.30 |
| registry | 64 МБ | 0.25 |
| watchtower | 64 МБ | 0.15 |
| **Итого** | **~912 МБ** | **~2.15** |

---

## SSL / HTTPS

Разместить файлы сертификата в `nginx/ssl/`:

```
nginx/ssl/fullchain.pem
nginx/ssl/privkey.key
```

Затем раскомментировать HTTPS-блок в `nginx/nginx.conf` и перезапустить:

```bash
docker compose restart nginx
```

Для Let's Encrypt — запустить Certbot на хосте и скопировать/симлинковать сертификаты в `nginx/ssl/`.

---

## Сборка и публикация образов

Проект использует приватный Docker Registry, запущенный на том же сервере.

```bash
# Авторизоваться в локальном реестре
docker login localhost:5000 -u deployer

# Собрать и опубликовать бэкенд
docker build -t localhost:5000/autovip-backend:latest ./backend
docker push localhost:5000/autovip-backend:latest

# Собрать и опубликовать фронтенд
docker build -t localhost:5000/autovip-frontend:latest ./frontend
docker push localhost:5000/autovip-frontend:latest
```

Watchtower каждые 5 минут проверяет реестр и автоматически передеплоивает обновлённые образы.

---

## Локальная разработка

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite dev-сервер проксирует запросы `/api` на `http://localhost:8000` по умолчанию (см. `vite.config.ts`).

---
