// ===========================
// Конфигурация Supabase
// ===========================
// Откуда взять значения:
//   1. Откройте проект на https://supabase.com/dashboard
//   2. Project Settings -> API Keys
//   3. Скопируйте Project URL и publishable (anon) key
//
// ВАЖНО: здесь допустим только публичный ключ (anon / publishable).
// Ключ service_role нельзя вставлять в код сайта: он даёт полный доступ к базе.
window.SUPABASE_CONFIG = {
    url: 'https://lkndnxxwgqexlxkqupyv.supabase.co',
    anonKey: 'sb_publishable_rjoP-kJaXyOPArjnIlKtMg_vkz0mhqx'
};

/**
 * Проверяет, что конфигурация заменена на реальную.
 */
window.isSupabaseConfigured = function () {
    var config = window.SUPABASE_CONFIG || {};
    var url = config.url || '';
    var key = config.anonKey || '';

    if (!url || !key) return false;
    if (url.indexOf('ВАШ') !== -1 || key.indexOf('ВАШ') !== -1) return false;

    return url.indexOf('https://') === 0;
};
