// ===========================
// Firebase: чтение, добавление и удаление записей
// Realtime Database, узел: students/{key} = {name, specialty, grad_year}
// ===========================
(function () {
    'use strict';

    var PATH = 'students';
    var db = null;
    var els = {};

    // Состояние сортировки (сортировка выполняется на клиенте после загрузки)
    var sortColumn = 'name';
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

        var configured = window.isFirebaseConfigured();
        window.DemoUI.showConfigNotice(els.notice, configured, 'js/firebase-config.js');

        if (typeof window.firebase === 'undefined') {
            window.DemoUI.setStatus(
                els.status,
                'Не удалось загрузить библиотеку Firebase. Проверьте доступ к gstatic.com.',
                'error'
            );
            return;
        }

        if (!configured) {
            window.DemoUI.setStatus(
                els.status,
                'Укажите firebaseConfig (включая databaseURL) в js/firebase-config.js',
                'error'
            );
            return;
        }

        try {
            if (!window.firebase.apps.length) {
                window.firebase.initializeApp(window.FIREBASE_CONFIG);
            }
            db = window.firebase.database();
        } catch (error) {
            window.DemoUI.setStatus(
                els.status,
                'Ошибка инициализации Firebase: ' + error.message,
                'error'
            );
            return;
        }

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

    function sortRows(rows) {
        return rows.slice().sort(function (a, b) {
            var av = a[sortColumn];
            var bv = b[sortColumn];
            if (av === bv) return 0;
            if (av === null || av === undefined) return sortAsc ? 1 : -1;
            if (bv === null || bv === undefined) return sortAsc ? -1 : 1;
            return sortAsc
                ? String(av).localeCompare(String(bv))
                : String(bv).localeCompare(String(av));
        });
    }

    /**
     * SELECT: одноразовое чтение узла students с клиентской сортировкой.
     */
    function loadStudents() {
        window.DemoUI.setStatus(els.status, 'Загружаем список...');

        db.ref(PATH)
            .once('value')
            .then(function (snapshot) {
                var rows = [];
                snapshot.forEach(function (child) {
                    var value = child.val() || {};
                    rows.push({
                        id: child.key,
                        name: value.name,
                        specialty: value.specialty,
                        grad_year: value.grad_year
                    });
                });

                rows = sortRows(rows);

                window.DemoUI.renderStudents(
                    els.students,
                    els.empty,
                    rows,
                    removeStudent,
                    window.Auth && window.Auth.isAdmin()
                );
                window.DemoUI.setStatus(
                    els.status,
                    'Загружено записей: ' + rows.length,
                    'ok'
                );
            })
            .catch(function (error) {
                window.DemoUI.setStatus(
                    els.status,
                    'Ошибка чтения: ' + error.message,
                    'error'
                );
            });
    }

    /**
     * INSERT: добавить запись с автоматическим ключом.
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

        db.ref(PATH)
            .push({
                name: student.name,
                specialty: student.specialty,
                grad_year: student.grad_year
            })
            .then(function () {
                setBusy(false);
                els.name.value = '';
                els.specialty.value = '';
                els.gradYear.value = '';

                window.DemoUI.setStatus(
                    els.status,
                    'Студент добавлен: ' + student.name,
                    'ok'
                );
                loadStudents();
            })
            .catch(function (error) {
                setBusy(false);
                window.DemoUI.setStatus(
                    els.status,
                    'Ошибка записи: ' + error.message,
                    'error'
                );
            });
    }

    /**
     * DELETE: удалить запись по ключу (только для роли admin).
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

        db.ref(PATH + '/' + id)
            .remove()
            .then(function () {
                window.DemoUI.setStatus(els.status, 'Запись удалена', 'ok');
                loadStudents();
            })
            .catch(function (error) {
                window.DemoUI.setStatus(
                    els.status,
                    'Ошибка удаления: ' + error.message,
                    'error'
                );
            });
    }

    function setBusy(busy) {
        els.addBtn.disabled = busy;
        els.reloadBtn.disabled = busy;
    }
})();
