# ClientOrder — Сайт для обработки заказов от покупателей

Готовая к продакшену самохостируемая платформа для приёма и обработки заказов. Покупатели заполняют многошаговую форму с контактными данными, описанием задачи и бюджетом; заказы сохраняются в PostgreSQL с полной аналитикой поведения (время на странице, тепловая карта курсора, клики по кнопкам). Встроенная админ-панель с JWT-аутентификацией для управления заявками и конфигурацией. Спроектирована для работы на **VPS с 1 ГБ RAM** внутри Docker.

---

## Архитектура

```
Интернет
    │
    ▼
[ Nginx :80/:443 ]  ← обратный прокси
    │
    ├─► /           → [ Frontend ] React SPA (форма заказов)
    ├─► /admin/*    → [ Frontend ] Админ-панель (JWT Auth)
    ├─► /api/       → [ Backend  ] FastAPI + SQLAlchemy (async)
    ├─► /docs       → [ Backend  ] Swagger UI
    ├─► /pgadmin/   → [ pgAdmin  ] (опционально, Basic Auth)
    └─► /v2/        → [ Registry ] (опционально, приватный Docker-реестр)
```

**Сети:**
- `frontend-network` — nginx, frontend, backend
- `backend-network` (internal) — только backend + PostgreSQL; БД никогда не доступна снаружи

> pgAdmin и Docker Registry отключены в `docker-compose.yml` по умолчанию. Раскомментировать при необходимости.

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
| `SECRET_KEY` | Случайный секрет бэкенда (`openssl rand -hex 32`) |
| `JWT_SECRET_KEY` | Секрет для JWT (мин. 32 символа, `openssl rand -hex 32`) |
| `PGADMIN_PASSWORD` | Пароль pgAdmin (если включён) |
| `NGINX_ADMIN_PASSWORD` | Пароль Basic Auth для `/pgadmin/` (если включён) |
| `REGISTRY_PASSWORD` | Пароль Docker Registry (если включён) |

В `backend/.env`:
- Обновить `DATABASE_URL` с реальным `POSTGRES_PASSWORD`
- Установить `CORS_ORIGINS` на свой домен, например `["https://your-domain.com"]`

### 3. Запустить скрипт первоначальной настройки (если используются pgAdmin/Registry)

```bash
chmod +x setup.sh
./setup.sh
```

Скрипт генерирует htpasswd для Nginx (Basic Auth) и Docker Registry. Пропустить, если эти сервисы отключены.

### 4. Запустить все сервисы

```bash
docker compose up -d
```

После запуска сервисы доступны по адресам:

| URL | Сервис |
|---|---|
| `http://your-server/` | Форма заказов (React SPA) |
| `http://your-server/admin/` | Админ-панель (JWT Auth) |
| `http://your-server/api/` | Backend API |
| `http://your-server/docs` | Swagger UI |

Опционально (раскомментировать в `docker-compose.yml` и `nginx.conf`):
| `http://your-server/pgadmin/` | pgAdmin (Basic Auth) |
| `http://your-server/v2/` | Docker Registry |

Подробнее об админ-панели: [frontend/ADMIN_README.md](frontend/ADMIN_README.md)

---

## Структура проекта

```
ClientOrder/
├── .env.example            # Шаблон переменных окружения
├── docker-compose.yml      # Сервисы: nginx, frontend, backend, postgres, watchtower
├── setup.sh                # Скрипт настройки htpasswd (pgAdmin, Registry)
├── deploy-admin-updates.sh # Скрипт деплоя обновлений админ-панели
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   ├── init.sql            # Ручная инициализация БД (запасной вариант)
│   ├── scripts/
│   │   └── seed_test_leads.sql   # Тестовые заявки для проверки сортировки
│   └── app/
│       ├── main.py
│       ├── core/           # Конфиг, движок БД
│       ├── models/         # ORM-модели (lead, analytics, admin, session_tracking)
│       ├── schemas/
│       ├── crud/
│       ├── routes/         # lead, analytics, admin, auth, admin_panel, session_tracking
│       └── services/       # lead_scoring и др.
│
├── frontend/
│   ├── Dockerfile
│   ├── .env.example
│   ├── nginx.conf
│   ├── ADMIN_README.md     # Документация админ-панели
│   ├── package.json
│   └── src/
│       ├── components/     # Форма заказов, UI-компоненты
│       ├── admin/          # Админ-панель: Leads, Dashboard, Settings, Admins
│       ├── hooks/
│       ├── services/
│       ├── types/
│       └── utils/
│
├── nginx/
│   ├── nginx.conf          # Обратный прокси, rate limiting
│   ├── ssl/                # SSL-сертификаты (не в git)
│   └── auth/               # htpasswd (не в git)
│
└── registry/
    └── auth/               # htpasswd Registry (не в git)
```

---

## Справка по API

### Публичные (форма заказов)

| Метод | Эндпоинт | Описание |
|---|---|---|
| `POST` | `/api/leads/` | Создать заявку |
| `POST` | `/api/analytics/` | Отправить аналитику |

### Аутентификация админ-панели (`/api/v1/auth`)

| Метод | Эндпоинт | Описание |
|---|---|---|
| `GET` | `/registration-available` | Доступна ли регистрация |
| `POST` | `/register` | Регистрация первого админа |
| `POST` | `/login` | Вход (JWT в HttpOnly cookies) |
| `POST` | `/logout` | Выход |
| `POST` | `/refresh` | Обновление токена |
| `GET` | `/me` | Текущий админ |

### Админ-API (`/api/v1/admin`, JWT)

| Метод | Эндпоинт | Описание |
|---|---|---|
| `GET` | `/dashboard/stats` | Статистика дашборда |
| `GET` | `/leads` | Список заявок (фильтры, пагинация) |
| `GET` | `/leads/{id}` | Детали заявки |
| `GET` | `/list` | Список админов |
| `PUT` | `/{id}` | Обновить админа |
| `DELETE` | `/{id}` | Удалить админа |

### Конфигурация (`/api/admin/configs`)

| Метод | Эндпоинт | Описание |
|---|---|---|
| `GET` | `/` | Получить конфиг |
| `POST` | `/` | Создать запись |
| `PATCH` | `/{key}` | Обновить запись |
| `DELETE` | `/{key}` | Удалить запись |

### Health Check

| Метод | Эндпоинт | Описание |
|---|---|---|
| `GET` | `/api/health` | Проверка работоспособности |

Полная документация: `/docs` (Swagger UI) и `/redoc`. Подробнее об админ-панели: [frontend/ADMIN_README.md](frontend/ADMIN_README.md).

---

## Лимиты ресурсов

| Контейнер | RAM | CPU |
|---|---|---|
| nginx | 48 МБ | 0.30 |
| frontend | 32 МБ | 0.15 |
| backend | 192 МБ | 0.50 |
| postgres | 256 МБ | 0.50 |
| watchtower | 64 МБ | 0.15 |
| **Итого (базовый)** | **~592 МБ** | **~1.6** |

Опционально: pgAdmin 256 МБ, Registry 64 МБ — при включении в `docker-compose.yml`.

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

## Деплой обновлений админ-панели

Быстрая пересборка и перезапуск только backend и frontend:

```bash
./deploy-admin-updates.sh
```

После деплоя сделать жёсткое обновление страницы (Ctrl+Shift+R), чтобы сбросить кэш.

---

## Сборка и публикация образов (при включённом Registry)

Проект поддерживает приватный Docker Registry на том же сервере.

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
