# 📘 ПОЛНЫЙ КОНТЕКСТ ПРОЕКТА «КОНСПЕКТ» И ЭКОСИСТЕМЫ SSSKKKLIIEEE.BOND
> **Документ предназначен для ChatGPT / Claude / LLM**  
> Этот файл содержит исчерпывающее описание архитектуры, репозиториев, настроек облака, баз данных, почтовых серверов, фронтенда, бэкенда и решённых проблем. Передавайте этот файл модели при начале новой сессии для мгновенного введения в курс дела.

---

## 1. Общие сведения и данные владельца

- **Владелец / Разработчик**: `ssskkkliieee`
- **Основной email / Супер-админ**: `timt5938@gmail.com`
- **Официальный домен**: `https://ssskkkliieee.bond` *(обратите внимание на точное написание: 3 буквы `s`, 3 буквы `k`, 1 буква `l`, 2 буквы `i`, 3 буквы `e`)*
- **Маршрут проекта «Конспект»**: `https://ssskkkliieee.bond/conspect`
- **Брендинг и правила оформления**:
  - Строгое текстовое название: **«КОНСПЕКТ»** (заглавными буквами).
  - **Запрещено** использовать круглый значок «К» или надписи «v2.0».
  - Везде присутствует авторская плашка: **«Сделано ssskkkliieee»**.
  - Эстетика: Dark Liquid Chrome (черный фон `#000000`, хромированные металлические градиенты, зеркальные блики, стеклянные карточки `backdrop-blur`).

---

## 2. Репозитории проекта

Проект состоит из двух связанных репозиториев на GitHub:

### Репозиторий 1: `timt5938-cyber/sait` (Production Frontend & Portfolio)
- **URL**: [https://github.com/timt5938-cyber/sait](https://github.com/timt5938-cyber/sait)
- **Деплой**: Cloudflare Pages (привязан к домену `ssskkkliieee.bond`).
- **Стек**: Vite 6, React 19, TypeScript, Tailwind CSS 4, Lucide Icons, Canvas API.
- **Ключевой функционал**:
  1. Главная страница-портфолио со списком проектов и интерактивным переключателем под «Каталогом проектов»: `[ TGclear ]` и `[ Конспект ]`.
  2. Выделенный маршрут `/conspect` (полноэкранный режим без перезагрузки страниц).
  3. Кинетическое 3D-интро с жидкостно-хромовым логотипом `LiquidChromeLogo.tsx` и кнопкой «В СТУДИЮ».
  4. Полнофункциональная студия конспектов `ConspectusStudio.tsx`.
  5. Интерактивная песочница `InteractiveSandbox.tsx` (живая тетрадная клетка 5 мм, поля 25 мм, выбор пасты, дрожание почерка).
  6. Инструкция по свободной калибровке почерка с чистого листа А4 `HandwritingGuide.tsx`.
  7. Авторизация через Supabase Auth (`AuthModal.tsx`).
  8. Закрытая панель администратора `AdminDashboard.tsx`, доступная исключительно для `timt5938@gmail.com`.

### Репозиторий 2: `timt5938-cyber/conspect` (Fullstack Core & CV Engine)
- **URL**: [https://github.com/timt5938-cyber/conspect](https://github.com/timt5938-cyber/conspect)
- **Локальный путь**: `c:\фф`
- **Стек**:
  - **Backend**: Python 3.12+, FastAPI, Uvicorn, OpenCV (cv2), NumPy, ReportLab, Supabase Python SDK.
  - **Worker**: Cloudflare Worker (`worker/src/index.ts`) на TypeScript для бессерверной обработки и Gemini AI.
  - **Frontend**: Автономная Vite-версия студии (`frontend/`).
- **Ключевой функционал**:
  - Полный отказ от Telegram-ботов (`aiogram` и Webhook удалены).
  - Компьютерное зрение: детектор листа бумаги по контурам, гомография (перспективное выравнивание), сегментация строк и выделение глифов символов (Оцу-бинаризация).
  - Генерация реалистичных рукописных конспектов в векторе (PDF) и растре (JPEG/PNG) с эмуляцией натуральных дефектов человеческой руки (дрожание, наклон, неравномерность нажима).
  - Интеграция с Google Gemini API для умного сокращения и конспектирования лекций.

---

## 3. Облачная инфраструктура и сервисы

```
               [ Пользователь / Браузер ]
                           │
                           ▼
          [ Cloudflare DNS & Pages / Workers ]
                (ssskkkliieee.bond)
                 │                 │
                 │ /conspect       │ DNS SPF/DKIM/DMARC
                 ▼                 ▼
     [ React 19 SPA Frontend ]  [ Resend SMTP ]
          │              │      (auth@ssskkkliieee.bond)
          │ Supabase SDK │
          ▼              ▼
     [ Supabase Cloud (Frankfurt eu-central-1) ]
       ├── Auth (Email + Password, STARTTLS)
       ├── Postgres DB (profiles, user_fonts, conspectuses)
       └── Storage S3 Bucket (conspectus-assets)
          │
          ▼
     [ FastAPI / OpenCV Backend ] (c:\фф)
       ├── Гомография листа А4
       ├── Экстракция глифов алфавита
       └── ReportLab PDF генератор
```

### 3.1. Supabase Cloud
- **Project ID**: `ddvzcqeunaappryvbuov`
- **Project Name**: `conspect`
- **Регион**: Frankfurt (`eu-central-1`), Статус: `ACTIVE_HEALTHY`
- **URL**: `https://ddvzcqeunaappryvbuov.supabase.co`
- **Anon Public Key**:
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdnpjcWV1bmFhcHByeXZidW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyODg2OTEsImV4cCI6MjEwNjg2NDY5MX0.BEmdtY1kQFusiCnsmtGrXYTMIwmpUY2cD0PilLje6tU
  ```
- **Site URL & Redirects**:
  - Site URL: `https://ssskkkliieee.bond`
  - Additional Redirect URLs: `https://ssskkkliieee.bond/conspect`, `http://localhost:5173`, `http://localhost:3000`

#### Схема базы данных (PostgreSQL):
1. **`public.profiles`**:
   - `id`: `uuid` (Primary Key, ссылка на `auth.users.id` с каскадным удалением).
   - `email`: `text`.
   - `created_at`: `timestamptz`.
2. **`public.user_fonts`**:
   - `id`: `uuid` (Primary Key, default `gen_random_uuid()`).
   - `user_id`: `uuid` (ссылка на `auth.users.id`).
   - `font_name`: `text`.
   - `glyphs`: `jsonb` (словарь координат, контуров и базовых линий букв).
   - `created_at`: `timestamptz`.
3. **`public.conspectuses`**:
   - `id`: `uuid` (Primary Key, default `gen_random_uuid()`).
   - `user_id`: `uuid` (ссылка на `auth.users.id`).
   - `title`: `text`.
   - `mode`: `text` (`smart` или `verbatim`).
   - `page_count`: `int4`.
   - `pdf_url`: `text`.
   - `preview_url`: `text`.
   - `created_at`: `timestamptz`.

#### Хранилище (Supabase Storage):
- **Bucket**: `conspectus-assets`
- **Доступ**: Public read.
- **Структура путей**:
  - `users/{user_id}/conspectus_{timestamp}_{hash}.pdf`
  - `users/{user_id}/preview_{timestamp}_{hash}.jpg`
  - `users/guests/{guest_id}/...` (для неавторизованных пользователей)

### 3.2. Настройка SMTP и почты (Resend)
Для отправки писем подтверждения регистрации настроен провайдер **Resend**:
- **SMTP Host**: `smtp.resend.com`
- **Port**: `587` *(Внимание: порт 465 в Supabase GoTrue давал таймаут 504, рабочий порт строго 587 со STARTTLS)*
- **User**: `resend`
- **Sender Address**: `auth@ssskkkliieee.bond`
- **Sender Name**: `КОНСПЕКТ`

### 3.3. Настройка Cloudflare DNS (Защита от СПАМА)
Для домена `ssskkkliieee.bond` прописаны следующие записи:
1. **SPF Record**:
   - Type: `TXT`
   - Name: `@`
   - Content: `v=spf1 include:amazonses.com ~all`
   - Proxy: `DNS only`
2. **DKIM Record**:
   - Type: `TXT`
   - Name: `resend._domainkey`
   - Content: Открытый ключ из панели Resend
   - Proxy: `DNS only`
3. **DMARC Record** *(Критично для прохождения фильтров Google/Gmail)*:
   - Type: `TXT`
   - Name: `_dmarc`
   - Content: `v=DMARC1; p=none; rua=mailto:auth@ssskkkliieee.bond;`
   - Proxy: `DNS only`
4. **Маршрутизация Cloudflare Pages**:
   - В `wrangler.toml`: `not_found_handling = "single-page-application"` (чтобы переход по прямым ссылкам вида `/conspect` не возвращал ошибку 404).

---

## 4. Архитектура и компоненты фронтенда (`sait`)

Расположение: `C:\Users\lapin\.gemini\antigravity\brain\b6586d63-3064-4260-bee1-2f438ed60e83\scratch\sait`  
GitHub: [timt5938-cyber/sait](https://github.com/timt5938-cyber/sait)

### 4.1. Маршрутизация (`src/App.tsx`)
- Перехватывает `window.location.pathname`:
  - При `/conspect`: монтируется компонент `<ConspectusPage />`.
  - При `/`: отображается основное портфолио с интерактивной секцией `<ConspectusSection />` под каталогом проектов.
- Переключение между проектами осуществляется мгновенно без потери состояния.

### 4.2. Интро и кинетический герой (`LiquidChromeLogo.tsx`)
- Canvas с шейдером хромированной жидкости и физикой затухающих колебаний.
- Рендерит надпись `КОНСПЕКТ` с металлическими бликами, реагирующими на перемещение курсора мыши / тача.
- Авторский бейдж: `Сделано ssskkkliieee • Без шаблонов • Чистый А4`.
- Кнопка «В СТУДИЮ» со скроллом к рабочей области.

### 4.3. Студия конспектирования (`ConspectusStudio.tsx`)
- **Режимы конспектирования**:
  1. `Smart Conspectus` (Умный): суммаризация с помощью Gemini AI, вычленение ключевых тезисов, автоматическое создание формул и определений.
  2. `Verbatim` (Дословный): точный рукописный перенос введенного текста.
- **Настройки бумаги**:
  - Тетрадная клетка 5 мм (стандарт ГОСТ).
  - Линейка.
  - Чистый белый лист.
  - Красные вертикальные поля слева (25 мм).
- **Настройки чернил и почерка**:
  - Цвета: Классический синий, темно-синий, черный, фиолетовый, красный.
  - Слайдер «Наклон» (-15° до +25°).
  - Слайдер «Дрожание руки (Jitter)» — эмулирует естественную микронеровность линий.
  - Слайдер «Размер строки».
- **Экспорт**: генерация многостраничного PDF и моментальное скачивание.

### 4.4. Интерактивная песочница (`InteractiveSandbox.tsx`)
- Встроена в Bento Grid на главной странице.
- Позволяет посетителю опробовать отрисовку текста на тетрадном листе 5 мм прямо в реальном времени до авторизации.

### 4.5. Калибровка почерка по листу А4 (`HandwritingGuide.tsx` & `CalibrationModal.tsx`)
- **Уникальная механика**: не требует распечатки специальных координатных сеток или трафаретов.
- **Инструкция для пользователя**:
  1. Взять чистый лист А4 и синюю/черную ручку.
  2. В верхней части написать заглавные буквы алфавита (А-Я).
  3. В средней части написать строчные буквы (а-я).
  4. В нижней части написать цифры (0-9).
  5. Сфотографировать лист прямо при хорошем освещении и загрузить.
- Алгоритм в бэкенде автоматически выравнивает перспективу и нарезает символы в персональную библиотеку глифов.

### 4.6. Админ-панель (`AdminDashboard.tsx`)
- **Защита доступа**:
  ```typescript
  const ADMIN_EMAIL = 'timt5938@gmail.com';
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;
  ```
- Для любого другого пользователя админка полностью скрыта и недоступна.
- **Возможности админки**:
  1. Живой счетчик метрик: количество пользователей, сгенерированных PDF и обученных шрифтов.
  2. Таблица сгенерированных файлов с прямыми ссылками на скачивание из Supabase Storage.
  3. Кнопка «Тест SMTP» для проверки доставляемости писем с домена `ssskkkliieee.bond`.
  4. Мониторинг статуса микросервисов: Supabase Frankfurt, Gemini AI, Resend SMTP.

---

## 5. Бэкенд и ядро компьютерного зрения (`conspect` / `c:\фф`)

Расположение: `c:\фф`  
GitHub: [timt5938-cyber/conspect](https://github.com/timt5938-cyber/conspect)

### 5.1. Структура каталогов
```
c:\фф\
├── backend/
│   └── app/
│       ├── api/
│       │   └── routes_studio.py      # REST-эндпоинты студии
│       ├── cv/
│       │   ├── sheet_detector.py     # Поиск листа А4, гомография
│       │   └── glyph_extractor.py    # Нарезка букв, Оцу, базовые линии
│       ├── gemini/
│       │   ├── client.py             # Интеграция с Google Gemini
│       │   └── prompts.py            # Промпты для конспектирования
│       ├── rendering/
│       │   ├── handwriting_engine.py # Дрожание, наклон, шум чернил
│       │   ├── paper_canvas.py       # Генератор тетрадной клетки 5 мм и полей
│       │   └── pdf_builder.py        # Сборка многостраничного PDF (ReportLab)
│       ├── storage/
│       │   └── supabase_client.py    # Загрузка ассетов в S3 бакет
│       ├── config.py                 # Pydantic настройки и переменные среды
│       └── main.py                   # Точка входа FastAPI
├── worker/
│   ├── src/index.ts                  # Cloudflare Worker API
│   └── wrangler.toml                 # Конфигурация воркера
├── frontend/                         # Автономный React-интерфейс
├── run.py                            # Локальный лаунчер сервисов
└── pyproject.toml / requirements.txt
```

### 5.2. API эндпоинты (`backend/app/api/routes_studio.py`)
- `POST /api/preview` — быстрый рендеринг первой страницы для мгновенного предпросмотра.
- `POST /api/generate` — сборка полного PDF, заливка в бакет Supabase и запись в таблицу `conspectuses`.
- `POST /api/calibrate` — загрузка фотографии листа А4, запуск пайплайна OpenCV, сохранение глифов в `user_fonts`.
- `GET /api/presets` — готовые стандартные почерки (студенческий, аккуратный, размашистый, технический).
- `GET /api/health` — проверка работоспособности системы.

### 5.3. Решенные критические баги и нюансы
1. **Ошибка S3 InvalidKey при кириллических названиях**:
   - *Проблема*: Если пользователь вводил тему конспекта на русском (например, `конспект_история.pdf`), Supabase S3 возвращал ошибку `400 InvalidKey` из-за не-ASCII символов в ключе.
   - *Решение*: В `routes_studio.py` формирование ключа переведено на безопасный ASCII-суффикс с меткой времени и UUID-хешем:
     ```python
     safe_ascii_suffix = f"{int(_time.time())}_{_uuid.uuid4().hex[:6]}"
     remote_filename = f"users/{safe_user_path}/conspectus_{safe_ascii_suffix}.pdf"
     ```
2. **Ошибка валидации Postgres UUID для гостей**:
   - *Проблема*: Неавторизованные пользователи отправляли строку `guest-xxxx`, что приводило к ошибке базы данных `22P02 invalid input syntax for type uuid`.
   - *Решение*: Добавлена функция `_is_valid_uuid(req.user_id)`. Гостевые сессии сохраняют файлы в путь `guests/` без падения базы данных.
3. **Таймаут SMTP порта 465**:
   - Порт 465 вызывал 504 Gateway Timeout в Supabase GoTrue. Использован порт **587** (STARTTLS), решивший проблему мгновенно.
4. **Попадание писем в СПАМ в Gmail**:
   - Было устранено добавлением записи `_dmarc` со строгой политикой и установкой канонического Site URL `https://ssskkkliieee.bond`.

---

## 6. Памятка для ChatGPT: Как продолжать разработку

Если пользователь просит:
1. **Доработать дизайн или интерфейс**:
   - Вносить изменения в `scratch/sait/src/components/conspect/` (или соответствующий компонент в репозитории `sait`).
   - Соблюдать цветовую схему: глубокий черный фон (`bg-black`), хром, белые и серебряные акценты, стеклянные панели `backdrop-blur-md bg-white/[0.03] border border-white/10`.
   - Обязательно сохранять плашку «Сделано ssskkkliieee».
2. **Изменить логику админки**:
   - Смотреть `AdminDashboard.tsx`. Помнить, что почта админа — строго `timt5938@gmail.com`.
3. **Изменить алгоритмы генерации почерка или клеток**:
   - Смотреть `backend/app/rendering/handwriting_engine.py` и `paper_canvas.py`.
   - Шаг сетки клетки строго равен 5 мм (при 300 DPI это ~59 пикселей).
4. **Собрать и запушить изменения**:
   - Для фронтенда `sait`: `npm run build` -> `git add .` -> `git commit -m "..."` -> `git push origin main`. Cloudflare Pages обновится автоматически.
   - Для бэкенда `conspect`: коммит в ветку `main` репозитория `timt5938-cyber/conspect`.
