// ===========================
// Конфигурация Firebase
// ===========================
// Откуда взять значения:
//   1. Откройте проект на https://console.firebase.google.com
//   2. Project settings (шестерёнка) -> Your apps -> Web app -> SDK setup and configuration
//   3. Скопируйте объект firebaseConfig целиком
//
// После создания Realtime Database вставьте её URL в databaseURL ниже.
//
// Эти данные не являются секретом: доступ к данным ограничивают правила базы.
window.FIREBASE_CONFIG = {
    apiKey: 'AIzaSyCRXhx_Zh_ILoyfPUhaRC848qtQo2vw4rQ',
    authDomain: 'college-7ceff.firebaseapp.com',
    databaseURL: 'https://college-7ceff-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'college-7ceff',
    storageBucket: 'college-7ceff.firebasestorage.app',
    messagingSenderId: '193708445957',
    appId: '1:193708445957:web:94e467ef70b0c9d8b6276c'
};

/**
 * Проверяет, что конфигурация заменена на реальную.
 */
window.isFirebaseConfigured = function () {
    var config = window.FIREBASE_CONFIG || {};
    var required = ['apiKey', 'databaseURL', 'projectId'];

    for (var i = 0; i < required.length; i++) {
        var value = config[required[i]] || '';
        if (!value || value.indexOf('ВАШ') !== -1) return false;
    }

    return String(config.databaseURL).indexOf('https://') === 0;
};
