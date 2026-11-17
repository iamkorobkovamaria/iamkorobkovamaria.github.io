// ===========================
// Supabase: чтение, добавление и удаление записей
// Таблица: students (id, name, specialty, grad_year)
// ===========================
(function () {
    'use strict';

    var TABLE = 'students';
    var client = null;
    var els = {};

    // Состояние сортировки
    var sortColumn = 'id';
    var sortAsc = true;

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

        // Кнопки сортировки по столбцам
        document.querySelectorAll('.sort-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var col = btn.getAttribute('data-sort');
                if (sortColumn === col) {
                    sortAsc = !sortAsc;
                } else {
                    sortColumn = col;
                    sortAsc = true;
                }
                updateSortButtons();
                loadStudents();
            });
        });

        loadStudents();
    }

    function updateSortButtons() {
        document.querySelectorAll('.sort-btn').forEach(function (btn) {
            var col = btn.getAttribute('data-sort');
            var dirSpan = btn.querySelector('.sort-dir');
            if (col === sortColumn) {
                dirSpan.textContent = sortAsc ? ' ▲' : ' ▼';
                btn.classList.add('active');
            } else {
                dirSpan.textContent = '';
                btn.classList.remove('active');
            }
        });
    }

    /**
     * SELECT: получить все записи таблицы с текущей сортировкой.
     */
    function loadStudents() {
        window.DemoUI.setStatus(els.status, 'Загружаем список...');

        client
            .from(TABLE)
            .select('*')
            .order(sortColumn, { ascending: sortAsc })
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
     * DELETE: удалить запись по id (только для роли admin).
     */
    function removeStudent(id) {
        if (!window.Auth || !window.Auth.isAdmin()) {
            window.DemoUI.setStatus(
                els.status,
                'Удалять записи может только администратор',
                'error'
            );
            return;
        }

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
        window.DemoUI.renderStudents(
            els.students,
            els.empty,
            rows,
            removeStudent,
            window.Auth && window.Auth.isAdmin()
        );
    }

    function setBusy(busy) {
        els.addBtn.disabled = busy;
        els.reloadBtn.disabled = busy;
    }
})();
