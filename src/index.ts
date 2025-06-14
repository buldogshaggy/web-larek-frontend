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
document.body.appendChild(basketElement);
const basket = new Basket(basketElement, events);

// Инициализация заказа
const orderElement = cloneTemplate(orderTemplate);
document.body.appendChild(orderElement);
const order = new Order(orderElement, events);

// Загрузка товаров
appData.getProducts()
    .then(products => {
        galleryContainer.innerHTML = '';
        products.forEach(item => {
            const card = new Card(cardCatalogTemplate, item, (item) => {
                console.log('Card clicked, emitting event'); // Отладочное сообщение
                events.emit('card:open', item);
            });
            galleryContainer.appendChild(card.render());
        });
    })
    .catch(err => {
        console.error('Ошибка загрузки товаров:', err);
    });

// Обработчик открытия карточки
events.on('card:open', (item: IProduct) => {
    console.log('Opening card:', item); // Отладочное сообщение

    // Очищаем содержимое модального окна
    modalContent.innerHTML = '';
    
    // Создаем карточку для превью
    const previewCard = new Card(cardPreviewTemplate, item);
    modalContent.appendChild(previewCard.render());
    
    // Показываем модальное окно
    modalContainer.classList.add('modal_active');
    
    // Добавляем обработчик закрытия
    const closeButton = ensureElement<HTMLButtonElement>('.modal__close', modalContainer);
    closeButton.onclick = () => {
        console.log('Closing modal'); // Отладочное сообщение
        modalContainer.classList.remove('modal_active');
    };
});

// Другие обработчики событий
events.on('basket:changed', () => {
    basket.toggleButton(basket.items.length > 0);
});

events.on('order:submit', (order: IOrder) => {
    appData.createOrder(order)
        .then(result => {
            events.emit('order:success', result);
        });
});