## Что есть в системе (сущности):

Note - заметки
User — владелец игр, автор, голосующий
Game — игра (может быть приватным или публичным)
Tag — метки (многие-ко-многим с Game)
Vote — голос пользователя за публичный промт (уникально: один пользователь → один голос на игру)
(опционально) Collection / Folder — папки/коллекции для организации
(опционально) GameVersion — версии игры (история изменений)

## Ключевые правила:

* Публичность — это свойство Game (visibility)
* Голосовать ( to vote)  можно только по публичным (проверяется на уровне приложения; можно усилить триггером/констрейнтом позже)
* Голос(vote)  уникален: (userId, GameId) — уникальный индекс

## Схема базы данных

* Note: id, ownerId -> User, title, createdAt
* User: id (cuid), email unique, name optional, createdAt
* Game: id, ownerId -> User, title, content, description optional, categoryId -> Category,
  visibility (PRIVATE|PUBLIC, default PRIVATE), createdAt, updatedAt, publishedAt nullable
* Vote: id, userId -> User, GameId -> Game, value int default 1, createdAt
* Category: id, category
* Ограничение: один пользователь может проголосовать за Game только один раз:
  UNIQUE(userId, GameId)
* Индексы:
  Game(ownerId, updatedAt)
  Game(visibility, createdAt)
  Vote(GameId)
  Vote(userId)
* onDelete: Cascade для связей
