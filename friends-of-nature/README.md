# Friends of Nature

15 экологических игр для детей. Статика (HTML/CSS/JS без сборки) + маленький API для комнат.

## Запуск

- **Посмотреть быстро:** открой `index.html`. Сервера нет, поэтому включится демо-режим (комнаты только в этом браузере).
- **С сервером (Node 18+, без зависимостей):** `node server/server.js` и открой http://localhost:3000. Данные пишутся в `server/data.json`. Переменные: `PORT`, `DB_FILE`, `CORS_ORIGIN`, `BOARD_MULT`.

## Режимы комнаты

Режим выбирается при создании комнаты и потом не меняется.

- **Интерактивная доска** (`board`): весь класс играет вместе на одном экране, интерфейс крупнее, игры мягче. Телефоны не нужны. Очки умножаются на `BOARD_MULT` (по умолчанию 8), потому что играет один экран вместо многих телефонов.
- **Телефоны** (`phones`): каждый ученик входит по коду и играет сам.

В обоих режимах очки идут в общий **лес класса** из 4 фаз. Пороги: `FOREST_STEPS` в `js/config.js` (по умолчанию 4000, 12000, 25000 очков). После каждой игры очки с анимацией «улетают» в лес. Учитель может вернуться к своему лесу в любой день: «Учитель» → «Открыть комнату» → код.

## Свой бэкенд

Сайт ходит на сервер только через `js/api.js`; адрес в `js/config.js` (`API_BASE`). На проде поставь `ALLOW_DEMO: false`.

| Запрос | Тело | Ответ |
|---|---|---|
| `POST /api/rooms` | `{group: 0..2, mode: "board"\|"phones"}` | `{code, group, mode, total, players}` |
| `GET /api/rooms/:code` | | то же самое, или **404 с JSON** |
| `POST /api/rooms/:code/join` | `{name}` | `{playerId, group, mode}` или 404 |
| `POST /api/rooms/:code/score` | `{playerId?, game, score}` | `{ok, gained, total}` |

Правила `score`: бэкенд сам умножает `score` на `BOARD_MULT`, если комната в режиме `board`, прибавляет к `total` комнаты и возвращает `gained` (сколько прибавилось) и новый `total`. В режиме `board` `playerId` не нужен, в `phones` обязателен. `players` в ответах: количество учеников. 404 должен приходить с `Content-Type: application/json`, иначе сайт решит, что сервера нет, и уйдёт в демо-режим. Код комнаты: 5 символов `A–Z2–9`. Игры (`game`): `trash, ocean, zerowaste, water, power, forest, rescue, firewatch, bee, survival, city, puzzle, explorer, planet, evolution`.

Безопасность минимальная: у кого есть код, тот может зайти в комнату.

## Картинки

Все картинки перечислены в `js/manifest.js` (157 штук). Страница `assets.html` показывает, чего не хватает, и даёт промпты с кнопкой копирования; то же самое в `IMAGES.md`. Файл `trash/bottle` кладётся как `assets/img/trash-bottle.png` (можно jpg или webp). Нет файла, показывается цветная заглушка с подписью.

## Группы игр

1. **Отходы и ресурсы:** Trash Rush, Clean the Ocean, Zero Waste, Water Crisis, Power Grid
2. **Дикая природа:** Forest Guardian, Wildlife Rescue, Firewatch, Bee Empire, Survival: Wild
3. **Планета и города:** Eco City, Ecosystem Puzzle, Nature Explorer, Restore the Planet, Eco Evolution

## Структура

    index.html, assets.html
    css/style.css
    js/config.js       настройки (API, множитель доски, пороги леса)
    js/api.js          сервер + демо-режим
    js/i18n.js         тексты RU/EN
    js/manifest.js     список картинок и промптов
    js/pics.js         загрузка картинок и заглушки
    js/forest.js       лес и анимация очков
    js/goals.js        «что нужно делать» в каждой игре
    js/games-*.js      игры; js/app.js — экраны
    server/server.js   референс-бэкенд

Новая игра: `FON.register({id, group, name:[ru,en], desc:[ru,en], start(ctx){...}})`, цель в `FON.goals[id]`; `ctx.end(score, win, note)` завершает игру и отправляет очки.
