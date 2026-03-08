# AutoVIP Backend

FastAPI-бэкенд для системы сбора лидов. Работает только через Nginx — прямых внешних портов нет.

## Архитектура

```
backend/
├── app/
│   ├── main.py          # Точка входа, подключение роутов
│   ├── core/
│   │   ├── config.py    # Настройки из .env
│   │   └── database.py  # Async SQLAlchemy engine
│   ├── models/          # SQLAlchemy ORM модели
│   ├── schemas/         # Pydantic схемы валидации
│   ├── crud/            # CRUD операции
│   └── routes/          # FastAPI роуты
├── requirements.txt
├── Dockerfile
├── init.sql             # Fallback SQL для ручной инициализации
└── .env.example
```

## Модели данных

| Таблица        | Назначение                       |
|----------------|----------------------------------|
| `leads`        | Заявки клиентов                  |
| `analytics`    | Поведение пользователя (1:1 → leads) |
| `admin_configs`| Конфигурация для фронтенда       |

## API Endpoints

Все эндпоинты доступны через Nginx по адресу `/api/...`

### Leads (`/api/leads`)
| Метод  | Путь              | Описание            |
|--------|--------------------|---------------------|
| POST   | `/api/leads/`      | Создать заявку      |
| GET    | `/api/leads/`      | Список заявок       |
| GET    | `/api/leads/{id}`  | Получить заявку     |
| PATCH  | `/api/leads/{id}`  | Обновить заявку     |
| DELETE | `/api/leads/{id}`  | Удалить заявку      |

### Analytics (`/api/analytics`)
| Метод  | Путь                          | Описание                  |
|--------|-------------------------------|---------------------------|
| POST   | `/api/analytics/`             | Создать запись             |
| GET    | `/api/analytics/`             | Список записей             |
| GET    | `/api/analytics/{id}`         | Получить по ID             |
| GET    | `/api/analytics/by-lead/{id}` | Получить по lead_id        |
| PATCH  | `/api/analytics/{id}`         | Обновить запись             |
| DELETE | `/api/analytics/{id}`         | Удалить запись              |

### Admin Configs (`/api/admin/configs`)
| Метод  | Путь                              | Описание               |
|--------|-----------------------------------|------------------------|
| POST   | `/api/admin/configs/`             | Создать конфиг         |
| GET    | `/api/admin/configs/`             | Список конфигов        |
| GET    | `/api/admin/configs/{id}`         | Получить по ID         |
| GET    | `/api/admin/configs/by-key/{key}` | Получить по ключу      |
| PATCH  | `/api/admin/configs/{id}`         | Обновить конфиг        |
| DELETE | `/api/admin/configs/{id}`         | Удалить конфиг         |

### Health Check
| Метод | Путь           | Описание          |
|-------|----------------|-------------------|
| GET   | `/api/health`  | Статус сервиса    |

## Запуск

### Через Docker Compose (рекомендуется)

```bash
# Из корня проекта
docker compose build backend
docker compose up -d backend
```

### Проверка

```bash
# Health check
curl http://localhost/api/health

# Создание заявки
curl -X POST http://localhost/api/leads/ \
  -H "Content-Type: application/json" \
  -d '{
    "contact_phone": "+79001234567",
    "business_niche": "IT",
    "company_size": "10-50",
    "task_volume": "Средний",
    "client_role": "Руководитель",
    "budget": "100000-500000",
    "preferred_contact_method": "Telegram",
    "preferred_contact_time": "10:00-18:00",
    "product_interest": "Автоматизация",
    "task_type": "Разработка",
    "result_deadline": "1 месяц"
  }'

# Получение всех заявок
curl http://localhost/api/leads/
```

### Fallback: ручная инициализация БД

Если ORM `create_tables()` не сработал:

```bash
docker exec -i autovip-postgres psql -U autovip -d autovip < backend/init.sql
```

## Переменные окружения

| Переменная       | Описание                        | По умолчанию   |
|------------------|---------------------------------|-----------------|
| `DATABASE_URL`   | Строка подключения к PostgreSQL | обязательно     |
| `SECRET_KEY`     | Секретный ключ приложения       | обязательно     |
| `APP_ENV`        | Окружение (production/dev)      | `production`    |
| `DB_POOL_SIZE`   | Размер пула подключений         | `5`             |
| `DB_MAX_OVERFLOW`| Макс. доп. подключений          | `3`             |
| `DB_POOL_RECYCLE`| Время жизни подключения (сек)   | `1800`          |
| `CORS_ORIGINS`   | Разрешённые origins (JSON list) | `["*"]`         |

## Оптимизации для низких ресурсов

- Multi-stage Docker build (минимальный размер образа)
- 1 uvicorn worker, лимит 10000 запросов до рестарта
- Connection pooling: 5 подключений + 3 overflow
- Без тяжёлых зависимостей (pandas, numpy, etc.)
- `--limit-max-requests` для предотвращения утечек памяти
