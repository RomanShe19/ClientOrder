# Админ-панель

Защищённая админ-панель с JWT-аутентификацией для управления заявками лидов и конфигурацией системы.

---

## Архитектура

```
Браузер
  │
  ├─► /admin/login      → React SPA (логин)
  ├─► /admin/register    → React SPA (регистрация первого админа)
  ├─► /admin/dashboard   → React SPA (дашборд, защищён JWT)
  ├─► /admin/leads       → React SPA (управление заявками)
  ├─► /admin/admins      → React SPA (управление админами)
  ├─► /admin/settings    → React SPA (конфигурация)
  │
  ├─► /api/v1/auth/*     → FastAPI (аутентификация, rate-limit: 5 req/min)
  ├─► /api/v1/admin/*    → FastAPI (админ API, JWT-protected)
  └─► /pgadmin/          → pgAdmin (Basic Auth, перенесён с /admin/)
```

---

## Быстрый старт

### 1. Обновить переменные окружения

Добавить в `.env` (корневой):

```bash
JWT_SECRET_KEY=your-secret-key-minimum-32-characters-long
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
COOKIE_SECURE=false   # true при наличии HTTPS
```

Сгенерировать безопасный ключ:

```bash
openssl rand -hex 32
```

### 2. Установить зависимости фронтенда

```bash
cd frontend
npm install
```

### 3. Применить миграцию БД

**Вариант А — Автоматически через SQLAlchemy:**

Таблица `admins` создаётся автоматически при старте backend, если её ещё нет в БД.

**Вариант Б — Вручную через SQL:**

```bash
docker exec -i autovip-postgres psql -U autovip -d autovip <<'SQL'
CREATE TABLE IF NOT EXISTS admins (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50) NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20) NOT NULL DEFAULT 'admin',
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS ix_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS ix_admins_is_active ON admins(is_active);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_admins_updated_at ON admins;
CREATE TRIGGER trg_admins_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
SQL
```

### 4. Пересобрать и запустить

```bash
docker compose up -d --build
```

### 5. Зарегистрировать первого администратора

Откройте в браузере:

```
http://your-server/admin/register
```

Заполните форму:
- **Username:** 3–50 символов, буквы/цифры/подчёркивание
- **Email:** валидный email
- **Password:** мин. 8 символов, 1 заглавная, 1 цифра, 1 спецсимвол

Первый админ автоматически получает роль `superadmin`.

> Регистрация доступна только когда в БД 0 администраторов. После создания первого админа страница перенаправляет на логин.

### 6. Проверить работу

1. **Логин:** `http://your-server/admin/login`
2. **Дашборд:** после входа → автоматический редирект на `/admin/dashboard`
3. **Заявки:** `/admin/leads` — таблица с фильтрами и пагинацией
4. **Админы:** `/admin/admins` — управление администраторами (superadmin)
5. **Настройки:** `/admin/settings` — конфигурация системы

---

## API эндпоинты

### Аутентификация (`/api/v1/auth`)

| Метод | Эндпоинт | Описание | Доступ |
|-------|----------|----------|--------|
| GET | `/registration-available` | Можно ли зарегистрироваться | Public |
| POST | `/register` | Регистрация первого админа | Public (0 админов) |
| POST | `/login` | Вход, выдача JWT cookies | Public |
| POST | `/logout` | Выход, blacklist токенов | Authenticated |
| POST | `/refresh` | Обновление access token | Authenticated |
| GET | `/me` | Данные текущего админа | Authenticated |

### Админ-панель (`/api/v1/admin`)

| Метод | Эндпоинт | Описание | Доступ |
|-------|----------|----------|--------|
| GET | `/dashboard/stats` | Статистика для дашборда | Authenticated |
| GET | `/leads` | Список заявок (пагинация + фильтры) | Authenticated |
| GET | `/leads/{id}` | Детали заявки | Authenticated |
| GET | `/list` | Список админов | Authenticated |
| GET | `/{id}` | Данные админа | Authenticated |
| PUT | `/{id}` | Обновление админа | Superadmin |
| DELETE | `/{id}` | Удаление админа | Superadmin |

---

## Безопасность

- **JWT в HttpOnly cookies** — токены не доступны из JavaScript
- **SameSite=strict** — защита от CSRF
- **Bcrypt (cost=12)** — хэширование паролей
- **Rate limiting** — 5 запросов/мин на `/api/v1/auth/`
- **Token blacklist** — in-memory с автоочисткой по TTL
- **Refresh token rotation** — при обновлении старый токен аннулируется
- **Access token: 30 мин** / **Refresh token: 7 дней**

---

## Важные изменения

### pgAdmin перенесён

pgAdmin теперь доступен по адресу `/pgadmin/` вместо `/admin/` (чтобы освободить `/admin/` для панели управления).

### Новые зависимости

**Backend:** `PyJWT`, `passlib[bcrypt]`, `bcrypt`

**Frontend:** `react-router-dom`, `zustand`, `date-fns`
