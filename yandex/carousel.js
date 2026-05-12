const createCarousel = (containerId, config) => {
    // Приватные переменные для каждой карусели
    let state = {
        currentPage: 0,
        totalPages: 0,
        currentSlidesToShow: config.slidesToShow || 1,
        autoTimer: null,
        track: null,
        prevBtn: null,
        nextBtn: null,
        indicatorsContainer: null,
        currentCountOfSlidesDiv: null,
        slidesCountDiv: null
    };

    const container = document.getElementById(containerId);
    const totalSlides = container.children.length;
    if (!container) return null;

    const carousel = {

// Конфигурация
        config: {
            slidesToShow: config.slidesToShow || 3,
            slidesToShowTablet: config.slidesToShowTablet || 2,
            slidesToShowMobile: config.slidesToShowMobile || 1,
            trackClassName: config.trackClassName || null,
            autoPlay: config.autoPlay !== false,
            indicatorsClassName: config.indicatorsClassName || null,
            slidesCountClassName: config.slidesCountClassName || null,
            nextBtnClassName: config.nextBtnClassName || null,
            prevBtnClassName: config.prevBtnClassName || null,
            currentCountOfSlidesClassName: config.currentCountOfSlidesClassName || null,
            autoPlayInterval: config.autoPlayInterval || 4000,
            loop: config.loop || false,
            gap: config.gap || 20,
            withIndicators: config.withIndicators || false,
            setWidthIsCarouselDisplay: config.setWidthIsCarouselDisplay || 0
        },

// Инициализация карусели
        init() {
            const width = window.innerWidth;
            state.indicatorsContainer = document.querySelector(this.config.indicatorsClassName);
            state.track = document.querySelector(this.config.trackClassName);
            state.slidesCountDiv = document.querySelector(this.config.slidesCountClassName);
            state.currentCountOfSlidesDiv = document.querySelector(this.config.currentCountOfSlidesClassName);
            state.prevBtn = document.querySelector(this.config.prevBtnClassName);
            state.nextBtn = document.querySelector(this.config.nextBtnClassName); 
            
            this.updateSlidesToShow();
            this.updateInfo();
            this.startAutoPlay();
            this.setupEventListeners();

            if (this.config.withIndicators) {
                this.renderIndicators();
            }

            window.addEventListener('resize', () => {
                this.handleResize();
            });
        },


// Обновление количества видимых слайдов
        updateSlidesToShow() {
            const width = window.innerWidth;

            if (this.config.setWidthIsCarouselDisplay !== 0 && width > this.config.setWidthIsCarouselDisplay) {
                this.destroy();
                return;
            }

            let newSlidesToShow;
            
            if (width <= 650) {
                newSlidesToShow = this.config.slidesToShowMobile;  // Мобильные устройства
            } else if (width <= 1024) {
                newSlidesToShow = this.config.slidesToShowTablet;  // Планшеты
            } else {
                newSlidesToShow = this.config.slidesToShow;  // Десктоп
            }
            
            if (state.currentSlidesToShow !== newSlidesToShow) {
                state.currentSlidesToShow = newSlidesToShow;
                state.totalPages = Math.ceil(totalSlides / state.currentSlidesToShow);

                if (state.currentPage >= state.totalPages) {
                    state.currentPage = state.totalPages - 1;
                }
                if (state.currentPage < 0) state.currentPage = 0;
                
                this.updateSlideWidth();
                this.goToPage(state.currentPage);
                this.updateInfo();
            
                if (!this.config.loop) {
                    this.updateButtonsState();
                }

                if (this.config.withIndicators) {
                    this.updateIndicators();
                }
            } else {
                state.totalPages = Math.ceil(totalSlides / state.currentSlidesToShow);
                this.updateSlideWidth();
            }
        },

// Обновление ширины слайдов
        updateSlideWidth() {
           if (!container || totalSlides === 0) return;
            
            const containerEl = state.track;
            const containerWidth = containerEl.clientWidth;
            const slideWidth = (containerWidth - (this.config.gap * (state.currentSlidesToShow - 1))) / state.currentSlidesToShow;
            const slides = container.children;

            for (let i = 0; i < slides.length; i++) {
                slides[i].style.width = `${slideWidth}px`;
            }
                    
            const trackWidth = (slideWidth + this.config.gap) * totalSlides - this.config.gap;
            container.style.width = `${trackWidth}px`;
        },

// Переход на страницу
        goToPage(page) {
            if (page < 0) page = 0;
            if (page >= state.totalPages) page = state.totalPages - 1;
            
            state.currentPage = page;
            let slideWidth = 0;
            
            if (totalSlides > 0) {
                slideWidth = container.children[0].offsetWidth;
            }
            
            const startIndex = page * state.currentSlidesToShow;
            const translateX = -startIndex * (slideWidth + this.config.gap);
            container.style.transform = `translateX(${translateX}px)`;
            
            if (!this.config.loop) {
                this.updateButtonsState();
            }

            if (this.config.withIndicators) {
                this.updateIndicators();
            }
        },

// Следующая страница
        nextPage() {
            if (state.currentPage < state.totalPages - 1) {
                this.goToPage(state.currentPage + 1);
                this.resetAutoPlay();
            } else if (this.config.loop && state.currentPage === state.totalPages - 1) {
                // Зацикливание: переход на первую страницу
                this.goToPage(0);
                this.resetAutoPlay();
            }
        },
            
// Предыдущая страница
        prevPage() {
            if (state.currentPage > 0) {
                this.goToPage(state.currentPage - 1);
                this.resetAutoPlay();
            } else if (this.config.loop && state.currentPage === 0) {
                // Зацикливание: переход на последнюю страницу
                this.goToPage(state.totalPages - 1);
                this.resetAutoPlay();
            }
        },

// Рендер индикаторов
        renderIndicators() {
            state.indicatorsContainer.innerHTML = '';
           
            for (let i = 0; i < state.totalPages; i++) {
                const dot = document.createElement('div');
                dot.className = `indicator ${i === state.currentPage ? 'active' : ''}`;
                dot.addEventListener('click', () => {
                    this.goToPage(i);
                    this.resetAutoPlay();
                });
                state.indicatorsContainer.appendChild(dot);
            }
        },

// Обновление состояния кнопок        
        updateButtonsState() {
            // Проверка для кнопки PREV
            if (state.currentPage === 0) {
                state.prevBtn.classList.add('disabled');
            } else {
                state.prevBtn.classList.remove('disabled');
            }
            
            // Проверка для кнопки NEXT
            if (state.currentPage === totalSlides - 1) {
                state.nextBtn.classList.add('disabled');
            } else {
                state.nextBtn.classList.remove('disabled');
            }
        },

// Обновление индикаторов
        updateIndicators() {
            const indicators = state.indicatorsContainer.querySelectorAll('.indicator');
            indicators.forEach((ind, i) => {
                if (i === state.currentPage) {
                    ind.classList.add('active');
                } else {
                    ind.classList.remove('active');
                }
            });
        },       

// Обновление информации
        updateInfo() {
            if (state.slidesCountDiv) {
                state.slidesCountDiv.textContent = totalSlides;
            }

            if (state.currentCountOfSlidesDiv) {
                state.currentCountOfSlidesDiv.textContent = state.currentSlidesToShow;
            }
        },

// Автопрокрутка
        startAutoPlay() {
            if (!this.config.autoPlay) return;
            if (state.autoTimer) clearInterval(state.autoTimer);
                    state.autoTimer = setInterval(() => {
                            this.nextPage();
                    }, this.config.autoPlayInterval);
        },

// Сброс автопрокрутки
        resetAutoPlay() {
            if (this.config.autoPlay) {
                if (state.autoTimer) {
                    clearInterval(state.autoTimer);
                    this.startAutoPlay();
                }
            }
        },

// Остановка автопрокрутки
        stopAutoPlay() {
            if (state.autoTimer) {
                clearInterval(state.autoTimer);
                state.autoTimer = null;
            }
        },

// Обработка ресайза
        handleResize() {
            setTimeout(() => {
                this.updateSlidesToShow();
            }, 100);
        },

// Прикрепление обработчиков событий
        setupEventListeners() {
            state.prevBtn.addEventListener('click', () => this.prevPage());
            state.nextBtn.addEventListener('click', () => this.nextPage());
        },        

        destroy() {
            const slides = container.children;

            for (let i = 0; i < slides.length; i++) {
                slides[i].removeAttribute('style');
            }
            this.stopAutoPlay();
            window.removeEventListener('resize', this.handleResize);
            container.removeAttribute('style');
        },
    };

    carousel.init();
    return carousel;
};

// Запуск карусели после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {

    const cardsCarousel = createCarousel('carouselCards', {
        slidesToShow: 3,
        slidesToShowTablet: 2,
        slidesToShowMobile: 1,
        autoPlay: true,
        autoPlayInterval: 4000,
        loop: true,
        gap: 20,
        pauseOnHover: true,
        trackClassName: '.tournament_participants__slider__wrap',
        slidesCountClassName: '.tournament_participants__slider__total',
        nextBtnClassName: '.tournament_participants__slider__next',
        prevBtnClassName: '.tournament_participants__slider__prev',
        currentCountOfSlidesClassName: '.tournament_participants__slider__number_of_cards'
    });

    const stagesCarousel = createCarousel('carouselStages', {
            slidesToShow: 1,
            autoPlay: false,
            gap: 0,
            nextBtnClassName: '.stages__next',
            prevBtnClassName: '.stages__prev',
            trackClassName: '.stages__wrap',
            withIndicators: true,
            setWidthIsCarouselDisplay: 375,
            indicatorsClassName: '.stages__indicators'
    });
});