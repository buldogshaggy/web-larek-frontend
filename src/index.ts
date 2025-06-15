import './scss/styles.scss';
import { Api } from './components/base/api';
import { AppData } from './components/AppData';
import { Card } from './components/Card';
import { Basket } from './components/Basket';
import { Order } from './components/Order';
import { EventEmitter } from './components/base/events';
import { API_URL } from './utils/constants';
import { IProduct, IOrder } from './types';
import { ensureElement, cloneTemplate } from './utils/utils';

const events = new EventEmitter();
const api = new Api(API_URL);
const appData = new AppData(api);

// Шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');

// Контейнеры
const galleryContainer = ensureElement<HTMLElement>('.gallery');
const modalContainer = ensureElement<HTMLElement>('#modal-container');
const modalContent = ensureElement('.modal__content', modalContainer);

// Инициализация корзины
const basketElement = cloneTemplate(basketTemplate);
const basket = new Basket(basketElement, events);
const headerBasket = ensureElement<HTMLElement>('.header__basket');

// Инициализация заказа
const orderElement = cloneTemplate(orderTemplate);
const order = new Order(orderElement, events);

// Загрузка товаров
appData.getProducts()
    .then(products => {
        galleryContainer.innerHTML = '';
        products.forEach(item => {
            const card = new Card(cardCatalogTemplate, item, (product) => {
                events.emit('card:open', product);
            });
            
            // Добавляем карточку в DOM
            galleryContainer.appendChild(card.render());
        });
    })
    .catch(err => console.error('Ошибка загрузки товаров:', err));

// Модифицируем обработчик открытия карточки
events.on('card:open', (item: IProduct) => {
    //Блокировка прокрутки страницы
    document.body.style.overflow = 'hidden';

    modalContent.innerHTML = '';
    const previewCard = new Card(cardPreviewTemplate, item);
    
    // Добавляем кнопку "В корзину"
    const addButton = previewCard.render().querySelector('.card__button');
    if (addButton) {
        addButton.addEventListener('click', (e) => {
            // e.stopPropagation();
            events.emit('card:add', item);
            modalContainer.classList.remove('modal_active');

            // Разблокировка прокрутки при закрытии через крестик
            document.body.style.overflow = '';
        });
    }
    
    modalContent.appendChild(previewCard.render());
    modalContainer.classList.add('modal_active');

    
    // Обработчик закрытия
    const closeButton = ensureElement<HTMLButtonElement>('.modal__close', modalContainer);
    closeButton.onclick = (e) => {
        e.stopPropagation();
        modalContainer.classList.remove('modal_active');
        // Разблокировка прокрутки при закрытии через крестик
        document.body.style.overflow = '';
    };

    // Дополнительно: обработчик закрытия при клике на оверлей
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            e.stopPropagation();
            modalContainer.classList.remove('modal_active');
            // Разблокировка прокрутки при закрытии по оверлею
            document.body.style.overflow = '';
        }
    });
});

events.on('basket:changed', () => {
    basket.toggleButton(basket.items.length > 0);
});

events.on('order:submit', (order: IOrder) => {
    appData.createOrder(order)
        .then(result => {
            events.emit('order:success', result);
        });
});

// Обработчик добавления в корзину
events.on('card:add', (item: IProduct) => {
    basket.addItem(item);
});

// Обработчик удаления из корзины
basketElement.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('basket__item-delete')) {
        const id = target.dataset.id;
        if (id) basket.removeItem(id);
    }
});

headerBasket.addEventListener('click', () => {
    // Блокировка прокрутки страницы
    document.body.style.overflow = 'hidden';
    
    // Очищаем и заполняем модальное окно содержимым корзины
    modalContent.innerHTML = '';
    modalContent.appendChild(basketElement); // Используем basketElement вместо basket.render()
    modalContainer.classList.add('modal_active');

    // Обработчик закрытия
    const closeButton = ensureElement<HTMLButtonElement>('.modal__close', modalContainer);
    closeButton.onclick = (e) => {
        e.stopPropagation();
        modalContainer.classList.remove('modal_active');
        document.body.style.overflow = '';
    };

    // Обработчик закрытия при клике на оверлей
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            e.stopPropagation();
            modalContainer.classList.remove('modal_active');
            document.body.style.overflow = '';
        }
    });
});