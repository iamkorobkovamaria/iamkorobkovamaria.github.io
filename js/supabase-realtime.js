// ===========================
// Supabase Realtime: insert, select и подписка на изменения
// Таблица: students (id, name, specialty, grad_year)
// ===========================
(function () {
    'use strict';

    // Отдельная таблица проекта Марии: данные не пересекаются с моим.
    var TABLE = 'students_masha';
    var client = null;
    var channel = null;
    var els = {};

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        els = {
            notice: document.getElementById('configNotice'),
            name: document.getElementById('name'),
            specialty: document.getElementById('specialty'),
            gradYear: document.getElementById('gradYear'),
            addBtn: document.getElementById('addBtn'),
            reloadBtn: document.getElementById('reloadBtn'),
            status: document.getElementById('status'),
            students: document.getElementById('students'),
            empty: document.getElementById('empty'),
            badge: document.getElementById('realtimeBadge'),
            log: document.getElementById('log'),
            logEmpty: document.getElementById('logEmpty')
        };

        var configured = window.isSupabaseConfigured();
        window.DemoUI.showConfigNotice(els.notice, configured, 'js/supabase-config.js');

        if (typeof window.supabase === 'undefined') {
            window.DemoUI.setStatus(
                els.status,
                'Не удалось загрузить библиотеку Supabase. Проверьте доступ к cdn.jsdelivr.net.',
                'error'
            );
            return;
        }

        if (!configured) {
            window.DemoUI.setStatus(
                els.status,
                'Укажите Project URL и публичный ключ в js/supabase-config.js',
                'error'
            );
            return;
        }

        client = window.supabase.createClient(
            window.SUPABASE_CONFIG.url,
            window.SUPABASE_CONFIG.anonKey
        );

        els.addBtn.addEventListener('click', addStudent);
        els.reloadBtn.addEventListener('click', loadStudents);

        loadStudents();
        subscribe();
    }

    /**
     * SELECT: получить все записи таблицы.
     */
    function loadStudents() {
        client
            .from(TABLE)
            .select('*')
            .order('id', { ascending: true })
            .then(function (result) {
                if (result.error) {
                    window.DemoUI.setStatus(
                        els.status,
                        'Ошибка чтения: ' + result.error.message,
                        'error'
                    );
                    return;
                }

                window.DemoUI.renderStudents(
                    els.students,
                    els.empty,
                    result.data,
                    removeStudent
                );
            });
    }

    /**
     * Realtime: подписка на события INSERT, UPDATE, DELETE таблицы students.
     */
    function subscribe() {
        channel = client
            .channel('students-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: TABLE },
                handleChange
            )
            .subscribe(function (status) {
                if (status === 'SUBSCRIBED') {
                    els.badge.textContent = 'подключено';
                    els.badge.style.background = '#dcfce7';
                    els.badge.style.color = '#15803d';
                    window.DemoUI.setStatus(
                        els.status,
                        'Realtime подключён: изменения таблицы приходят автоматически',
                        'ok'
                    );
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    els.badge.textContent = 'нет связи';
                    els.badge.style.background = '#fee2e2';
                    els.badge.style.color = '#b91c1c';
                    window.DemoUI.setStatus(
                        els.status,
                        'Realtime недоступен. Включите его для таблицы students в Supabase.',
                        'error'
                    );
                }
            });
    }

    function handleChange(payload) {
        var row = payload.new && Object.keys(payload.new).length
            ? payload.new
            : payload.old;
        var name = (row && row.name) || '(без имени)';

        addLogEntry(payload.eventType, name);
        loadStudents();
    }

    function addLogEntry(eventType, name) {
        var titles = { INSERT: 'добавлена', UPDATE: 'изменена', DELETE: 'удалена' };

        var li = document.createElement('li');
        var info = document.createElement('div');

        var title = document.createElement('div');
        title.className = 'student-name';
        title.textContent = 'Запись ' + (titles[eventType] || eventType.toLowerCase());

        var meta = document.createElement('div');
        meta.className = 'student-meta';
        meta.textContent = name + ' · ' + new Date().toLocaleTimeString('ru-RU');

        info.appendChild(title);
        info.appendChild(meta);
        li.appendChild(info);

        els.log.insertBefore(li, els.log.firstChild);
        els.logEmpty.hidden = true;

        // Держим журнал коротким.
        while (els.log.children.length > 20) {
            els.log.removeChild(els.log.lastChild);
        }
    }

    /**
     * INSERT: добавить запись.
     */
    function addStudent() {
        var student = window.DemoUI.readStudentForm(
            els.name,
            els.specialty,
            els.gradYear
        );

        if (!student) {
            window.DemoUI.setStatus(
                els.status,
                'Заполните все поля, год выпуска — число от 1900 до 2100',
                'error'
            );
            return;
        }

        setBusy(true);
        window.DemoUI.setStatus(els.status, 'Отправляем запись...');

        client
            .from(TABLE)
            .insert([student])
            .then(function (result) {
                setBusy(false);

                if (result.error) {
                    window.DemoUI.setStatus(
                        els.status,
                        'Ошибка записи: ' + result.error.message,
                        'error'
                    );
                    return;
                }

                els.name.value = '';
                els.specialty.value = '';
                els.gradYear.value = '';

                window.DemoUI.setStatus(
                    els.status,
                    'Студент добавлен: ' + student.name,
                    'ok'
                );
                // Список обновится и по realtime-событию, и здесь — на случай задержки.
                loadStudents();
            });
    }

    /**
     * DELETE: удалить запись по id.
     */
    function removeStudent(id) {
        client
            .from(TABLE)
            .delete()
            .eq('id', id)
            .then(function (result) {
                if (result.error) {
                    window.DemoUI.setStatus(
                        els.status,
                        'Ошибка удаления: ' + result.error.message,
                        'error'
                    );
                    return;
                }

                window.DemoUI.setStatus(els.status, 'Запись удалена', 'ok');
                loadStudents();
            });
    }

    function setBusy(busy) {
        els.addBtn.disabled = busy;
        els.reloadBtn.disabled = busy;
    }
})();
