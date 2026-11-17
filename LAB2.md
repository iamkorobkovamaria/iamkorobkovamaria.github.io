# Лабораторная работа — ответы на вопросы

Этот файл содержит ответы на все пункты задания и пошаговую инструкцию по проверке.

---

## 1. Авторизация через Google и GitHub

**Сделано.** Страница: `auth.html` (ссылка с главной и из навигации).

- Кнопки «Войти через Google» и «Войти через GitHub» используют Firebase Auth (`signInWithPopup`).
- После успешного входа отображается: аватар (если есть), имя, почта, роль (`Администратор` или `Зритель`).
- Появляется кнопка **«Выйти»**, которая завершает сессию через `signOut()`.

### Что нужно сделать преподавателю в консоли Firebase (один раз)

1. Открыть https://console.firebase.google.com → проект → **Authentication → Sign-in method**.
2. Включить **Google** (указать support email).
3. Включить **GitHub**:
   - Создать OAuth App на https://github.com/settings/developers.
   - Callback URL: `https://<твой-проект>.firebaseapp.com/__/auth/handler`.
   - Вставить Client ID и Client Secret в Firebase.
4. **Authentication → Settings → Authorized domains** — добавить домены сайтов: `mikhail-69.github.io`, `nastya6376.github.io`, `iamkorobkovamaria.github.io`, `localhost`.
5. В `js/firebase-config.js` должны быть реальные значения `apiKey`, `authDomain`, `databaseURL`, `projectId` (публичные ключи — не секрет).

### Что показывает страница после входа

```
Имя:          Mikhail
Почта:        mikhail@mail.ru
Роль:         Администратор (или Зритель)
UID:          <уникальный идентификатор Firebase>
Создан:       2026-… (время создания аккаунта)
Последний вход: 2026-… (обновляется при каждом входе)
```

---

## 2. Сортировка по столбцу и удаление по роли

**Сделано.** На страницах `supabase.html` и `firebase.html`:

- Над списком кнопки «Имя», «Специальность», «Год выпуска». Клик — сортировка по возрастанию, повторный клик — по убыванию. Текущий столбец и направление подсвечиваются.
- Кнопка **«Удалить»** у каждой записи показывается **только пользователю с ролью admin**.
- Для роли viewer кнопка удаления не отображается, а при попытке программного удаления — сообщение об ошибке.

---

## 3. Как сделаны роли

Две роли: `viewer` и `admin`.

- Роли хранятся в Realtime Database по адресу `roles/{uid}`:
  ```json
  {
    "roles": {
      "<uid>": {
        "role": "admin",      // или "viewer"
        "email": "…@mail.ru",
        "name": "Имя",
        "createdAt": 173…     // серверное время создания
      }
    }
  }
  ```
- При **первом входе** пользователя в пустую базу: проверяется узел `roles`. Если он пуст — присваивается роль `admin`, иначе `viewer`.
- При **последующих входах**: роль подгружается из существующего узла `roles/{uid}`, новая запись не создаётся.
- Проверка роли в коде: `window.Auth.isAdmin()` возвращает `true` только для `admin`.

---

## 4. Что происходит при авторизации — первый и последующие входы

### Первый вход (регистрация)

1. Пользователь нажимает «Войти через Google/GitHub».
2. Firebase Auth создаёт аккаунт в **Authentication** (если почта nouvelle) — видно в консоли Firebase → Authentication → Users.
3. Наш код пишет запись в `roles/{uid}` с ролью (`admin` — если база пуста, иначе `viewer`).
4. На странице отображается значок «Первый вход — вам назначена роль …».

### Последующие входы

1. Аккаунт в **Authentication** уже есть — Firebase просто восстанавливает сессию.
2. Поле `lastSignInTime` в профиле пользователя обновляется.
3. В базе данных **ничего нового не создаётся** — роль читается из существующего `roles/{uid}`.
4. На странице отображаются актуальные даты создания и последнего входа.

---

## 5. Можно ли добавить картинки/файлы в Firebase

**Да, но с оговоркой.** Firebase Storage (хранилище файлов) требует тарифного плана **Blaze** — привязка банковской карты. На бесплатном плане Spark создать bucket нельзя.

### Бесплатный вариант (используем мы)

Картинки можно хранить одним из двух способов без Storage:

- **Supabase Storage** — бесплатный тариф включает 1 ГБ хранения. Подходит для загрузки файлов из веба и Flutter.
- **Base64 в Realtime Database** — маленькие картинки (до нескольких КБ) можно кодировать в строку и хранить прямо в узле. Только для демо, не для продакшена.

В этом проекте файлы не добавляются, чтобы не требовать карту. Если понадобится — подключаем Supabase Storage (проект уже есть).

---

## 6. Что необходимо для входа через Apple (Sign in with Apple)

Apple не даёт возможность протестировать вход бесплатно. Нужно:

1. **Оплаченный аккаунт Apple Developer Program** (99 $/год).
2. В Apple Developer Console:
   - Создать **Services ID** с включённым Sign in with Apple.
   - Создать **Private Key** (`.p8`) — скачать один раз, Verluste не восстанавливается.
   - Получить **Team ID**, **Key ID**, **Issuer ID**.
   - Настроить **Return URL** и **Bundle ID** приложения.
3. В Xcode / Flutter: добавить `Sign In with Apple` в capabilities, плагин `sign_in_with_apple`.
4. Для загрузки в TestFlight (см. пункт 9): `.p12` сертификат distribution, `.mobileprovision`, `ExportOptions.plist`, `.p8` ключ App Store Connect API.

**Статус нашего аккаунта:** заявка подана, соглашение подписано, доступ в App Store Connect пока заблокирован («Информация отправлена, ждём проверки»). Когда Apple одобрит — прислать Team ID, Key ID, Issuer ID, bundle ID.

---

## 7. ElevatedButton, SizedBox, Text — чьи дети?

- **`ElevatedButton`** — один ребёнок (`child`). Обычно передают `Text` или `Icon`.
- **`SizedBox`** — один ребёнок (`child`). Используется как пустая обёртка с фиксированной высотой/шириной.
- **`Text`** — **детей не имеет**, это лист дерева виджетов. Текст передаётся в `data` (строка) или `TextSpan` (для форматирования частей текста).

---

## 8. MainAxisAlignment — значения

Скриншот в задании показывает подсказку IDE:

- `start` — дети прижаты к началу главной оси (влево/вверх).
- `end` — к концу главной оси.
- `center` — по центру.
- `spaceBetween` — первый и последний ребёнок у краёв, промежутки между детьми равные.
- `spaceAround` — вокруг каждого ребёнка равные отступы (по краям в два раза меньше, чем между детьми).
- `spaceEvenly` — равные промежутки везде, включая края.

---

## 9. Flutter установка

### а) Локальный компьютер

1. Скачать ZIP Flutter с https://docs.flutter.dev/get-started/install.
2. Распаковать, добавить `<путь>/flutter/bin` в PATH.
3. Установить расширение **Flutter** (Dart-Code) в VS Code.
4. Команда проверки: `flutter doctor`.

Установлено у автора: `/home/mikhail/flutter`, команда `flutter doctor` пройдена.

### б) Firebase Studio / GitHub Codespace

- **GitHub Codespace:** добавить в репозиторий `.devcontainer/devcontainer.json` с образом, содержащим Flutter, и запустить `flutter doctor` в терминале браузера.
- **Firebase Studio:** создать проект, добавить веб-приложение Flutter, использовать встроенный терминал для `flutter doctor`.
- В обоих случаях нужен доступ к интернету для `flutter pub get` и загрузки Android SDK.

---

## 10. Workflow загрузки в TestFlight (Apple)

Готовый workflow лежит в задании (файл `.github/workflows/ios-testflight.yml`). Ключевые моменты:

- Раннер: `macos-latest` (только Mac может подписывать iOS-приложения).
- Секретные переменные (в GitHub → Settings → Secrets and variables → Actions):
  - `P12_PASSWORD` — пароль от `.p12` сертификата.
  - `APPLE_API_KEY` — содержимое `.p8` ключа App Store Connect.
  - `APPLE_KEY_ID` — Key ID из имени файла `AuthKey_XXXXXXXXXX.p8`.
  - `APPLE_ISSUER_ID` — Issuer ID из App Store Connect.
- Файлы подписи (`Certificates.p12`, `Profile.mobileprovision`, `ExportOptions.plist`, `AuthKey_*.p8`) **не должны попадать в репозиторий** — только в Secrets или загружаться как артефакты в fermé runner.

### Что прислать владельцу Apple-аккаунта

Когда доступ в App Store Connect откроется:
1. Team ID.
2. Bundle ID приложения.
3. App Store Connect API Key: Key ID, Issuer ID, файл `.p8`.
4. Distribution сертификат `.p12` + пароль.
5. Provisioning Profile `.mobileprovision`.

---

## 11. Бесплатный сервис отлова ошибок

**Рекомендуем: Sentry** (sentry.io).

- Бесплатный тариф: 5 000 событий в месяц, достаточно для студенческой лабораторной.
- Поддерживает Flutter (`sentry_flutter`) и веб (браузерный SDK).
- Ловит необработанные исключения, записывает стек вызовов, модель устройства, версию ОС, релиз приложения.

### Как подключить (Flutter)

1. Зарегистрироваться на sentry.io, создать проект (Flutter/Dart), получить **DSN**.
2. Добавить в `pubspec.yaml`: `sentry_flutter`.
3. В `main.dart` обернуть запуск:

```dart
Future<void> main() async {
  await FlutterError.onError = (details) {
    Sentry.captureException(details.exception, stackTrace: details.stack);
  };
  runZonedGuarded(
    () => runApp(const CollegeApp()),
    (error, stack) => Sentry.captureException(error, stackTrace: stack),
  );
}
```

### Как подключить (веб)

```html
<script src="https://browser.sentry-cdn.com/7.x/bundle.tracing.min.js"></script>
<script>
  Sentry.init({ dsn: "ВАШ_DSN" });
  window.onerror = (msg, url, line) => {
    Sentry.captureException(new Error(msg), { contexts: { url, line } });
    return false;
  };
</script>
```

**Что нужно от преподавателя:** зарегистрироваться на sentry.io, создать проект и прислать DSN. Без DSN сервис не подключится — ошибки некуда отправлять.

---

## 12. Проверочный список для преподавателя

- [ ] Открыть `https://<сайт>.github.io/auth.html` — кнопки входа работают.
- [ ] После входа отображается имя, почта, роль, кнопка «Выйти».
- [ ] Первый вход создаёт запись в `roles/{uid}`; при повторном входе база не меняется.
- [ ] Открыть `supabase.html` / `firebase.html` — сортировка по столбцам работает.
- [ ] Под админом кнопка «Удалить» видна и работает; под viewer — скрыта.
- [ ] APK приложения в разделе Releases GitHub.
- [ ] `flutter doctor` пройден локально (скриншот можно сделать после установки).
