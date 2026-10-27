// ===========================
// Firebase: чтение и добавление записей
// Realtime Database, узел: students/{key} = {name, specialty, grad_year}
// ===========================
(function () {
    'use strict';

    // Отдельный узел проекта Марии: данные не пересекаются с моим.
    var PATH = 'students_masha';
    var db = null;
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

        loadStudents();
    }

    /**
     * SELECT: одноразовое чтение узла students.
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

                window.DemoUI.renderStudents(
                    els.students,
                    els.empty,
                    rows,
                    removeStudent
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
     * DELETE: удалить запись по ключу.
     */
    function removeStudent(id) {
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
