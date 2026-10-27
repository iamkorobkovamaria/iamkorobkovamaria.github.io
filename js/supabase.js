// ===========================
// Supabase: чтение и добавление записей
// Таблица: students (id, name, specialty, grad_year)
// ===========================
(function () {
    'use strict';

    // Отдельная таблица проекта Марии: данные не пересекаются с моим.
    var TABLE = 'students_masha';
    var client = null;
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
            empty: document.getElementById('empty')
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
    }

    /**
     * SELECT: получить все записи таблицы.
     */
    function loadStudents() {
        window.DemoUI.setStatus(els.status, 'Загружаем список...');

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

                render(result.data);
                window.DemoUI.setStatus(
                    els.status,
                    'Загружено записей: ' + result.data.length,
                    'ok'
                );
            });
    }

    /**
     * INSERT: добавить запись и перечитать список.
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
                loadStudents();
            });
    }

    /**
     * DELETE: удалить запись по id.
     */
    function removeStudent(id) {
        window.DemoUI.setStatus(els.status, 'Удаляем запись...');

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

    function render(rows) {
        window.DemoUI.renderStudents(els.students, els.empty, rows, removeStudent);
    }

    function setBusy(busy) {
        els.addBtn.disabled = busy;
        els.reloadBtn.disabled = busy;
    }
})();
