// Ждем, пока загрузится весь HTML-документ
document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. ГЕНЕРАТОР СЛУЧАЙНЫХ ФАКТОВ
    // ==========================================
    
    const facts = [
        "Корни мыльнянки пенятся в воде, как настоящее мыло, благодаря высокому содержанию сапонинов (до 35%).",
        "В старину её называли «собачьим мылом» и использовали для стирки тонкой шерсти и шелка, чтобы не повредить ткань.",
        "Мыльнянка цветет с июня по сентябрь красивыми бледно-розовыми или белыми цветами с очень приятным ароматом.",
        "В пищевой промышленности экстракт мыльнянки иногда используют при производстве халвы и рахат-лукума для придания воздушной структуры.",
        "Отвар корня этого растения веками применялся в народной медицине как эффективное отхаркивающее средство при кашле.",
        "Растение ядовито в больших количествах, поэтому использовать его внутрь нужно строго дозированно."
    ];

    const factBtn = document.getElementById('factBtn');
    const factDisplay = document.getElementById('factDisplay');

    factBtn.addEventListener('click', () => {
        // Добавляем эффект исчезновения
        factDisplay.style.opacity = 0;
        
        setTimeout(() => {
            // Выбираем случайный факт из массива
            const randomIndex = Math.floor(Math.random() * facts.length);
            factDisplay.textContent = "«" + facts[randomIndex] + "»";
            // Показываем текст обратно
            factDisplay.style.transition = "opacity 0.5s ease";
            factDisplay.style.opacity = 1;
        }, 300); // ждем 300мс пока текст исчезнет
    });

    // ==========================================
    // 2. ГАЛЕРЕЯ (LIGHTBOX - полноэкранный просмотр)
    // ==========================================
    
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("fullImage");
    const captionText = document.getElementById("caption");
    const closeBtn = document.querySelector(".close-modal");
    const galleryImages = document.querySelectorAll(".gallery-img");

    // Перебираем все картинки в галерее и вешаем клик
    galleryImages.forEach(img => {
        img.addEventListener('click', function() {
            modal.style.display = "block";
            // Небольшая задержка для плавного появления (transition в CSS)
            setTimeout(() => modal.classList.add('show'), 10);
            
            modalImg.src = this.src; // Берем ссылку нажатой картинки
            captionText.innerHTML = this.alt; // Берем описание из alt
        });
    });

    // Функция закрытия модалки
    const closeModal = () => {
        modal.classList.remove('show');
        // Ждем окончания анимации перед тем как скрыть элемент
        setTimeout(() => {
            modal.style.display = "none";
        }, 300);
    };

    // Закрытие по крестику
    closeBtn.addEventListener('click', closeModal);

    // Закрытие при клике на темный фон вне картинки
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Закрытие по кнопке ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && modal.style.display === "block") {
            closeModal();
        }
    });
});