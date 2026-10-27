// ===========================
// Общие функции интерфейса для демо-страниц
// ===========================
(function () {
    'use strict';

    /**
     * Выводит сообщение о состоянии операции.
     * @param {HTMLElement} el
     * @param {string} message
     * @param {'info'|'ok'|'error'} [kind]
     */
    function setStatus(el, message, kind) {
        if (!el) return;
        el.textContent = message || '';
        el.className = 'status' + (kind ? ' ' + kind : '');
    }

    /**
     * Показывает предупреждение, если конфигурация не заполнена.
     * @param {HTMLElement} el
     * @param {boolean} configured
     * @param {string} fileName
     */
    function showConfigNotice(el, configured, fileName) {
        if (!el) return;
        el.hidden = configured;
        if (!configured) {
            el.textContent =
                'Конфигурация не заполнена. Откройте ' + fileName +
                ' и укажите данные вашего проекта.';
        }
    }

    /**
     * Создаёт элемент списка студентов.
     * Текст вставляется через textContent, поэтому HTML из базы не исполняется.
     */
    function createStudentItem(student, onRemove) {
        const li = document.createElement('li');

        const info = document.createElement('div');

        const name = document.createElement('div');
        name.className = 'student-name';
        name.textContent = student.name || '(без имени)';

        const meta = document.createElement('div');
        meta.className = 'student-meta';
        meta.textContent =
            (student.specialty || '—') + ' · выпуск ' + (student.grad_year || '—');

        info.appendChild(name);
        info.appendChild(meta);
        li.appendChild(info);

        if (onRemove && student.id !== undefined && student.id !== null) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'remove';
            button.textContent = 'Удалить';
            button.addEventListener('click', function () {
                onRemove(student.id);
            });
            button.setAttribute(
                'aria-label',
                'Удалить запись: ' + (student.name || 'без имени')
            );
            li.appendChild(button);
        }

        return li;
    }

    /**
     * Перерисовывает список студентов.
     */
    function renderStudents(listEl, emptyEl, students, onRemove) {
        if (!listEl) return;
        listEl.textContent = '';

        const items = students || [];
        if (emptyEl) {
            emptyEl.hidden = items.length > 0;
        }

        items.forEach(function (student) {
            listEl.appendChild(createStudentItem(student, onRemove));
        });
    }

    /**
     * Проверяет данные формы. Возвращает объект или null.
     */
    function readStudentForm(nameInput, specialtyInput, yearInput) {
        const name = (nameInput.value || '').trim();
        const specialty = (specialtyInput.value || '').trim();
        const year = parseInt(yearInput.value, 10);

        if (!name || !specialty || !Number.isInteger(year)) {
            return null;
        }
        if (year < 1900 || year > 2100) {
            return null;
        }

        return { name: name, specialty: specialty, grad_year: year };
    }

    window.DemoUI = {
        setStatus: setStatus,
        showConfigNotice: showConfigNotice,
        renderStudents: renderStudents,
        readStudentForm: readStudentForm
    };
})();
