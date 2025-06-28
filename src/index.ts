import './scss/styles.scss';
import { Api } from './components/base/api';
import { AppData } from './components/AppData';
import { Card } from './components/Card';
import { Basket } from './components/Basket';
import { Order } from './components/Order';
import { EventEmitter } from './components/base/events';
import { Modal } from './components/Modal';
import { API_URL } from './utils/constants';
import { IProduct, IOrder } from './types';
import { ensureElement, cloneTemplate } from './utils/utils';
import { Contacts } from './components/Contacts';
import { BasketItem } from './components/BasketItem';

const events = new EventEmitter();
const api = new Api(API_URL);
const appData = new AppData();

// Инициализация модального окна
const modalContainer = ensureElement<HTMLElement>('#modal-container');
const modal = new Modal(modalContainer);

// Шаблоны
const templates = {
    cardCatalog: ensureElement<HTMLTemplateElement>('#card-catalog'),
    cardPreview: ensureElement<HTMLTemplateElement>('#card-preview'),
    basket: ensureElement<HTMLTemplateElement>('#basket'),
    basketItem: ensureElement<HTMLTemplateElement>('#card-basket'),
    order: ensureElement<HTMLTemplateElement>('#order'),
    contacts: ensureElement<HTMLTemplateElement>('#contacts'),
    success: ensureElement<HTMLTemplateElement>('#success')
};

// Компоненты
const basket = new Basket(
    cloneTemplate(templates.basket),
    events,
    templates.basketItem
);

const basketButton = ensureElement<HTMLButtonElement>('.header__basket');
basketButton.addEventListener('click', () => {
    events.emit('basket:open', appData.basket);
});

// Загрузка товаров
api.get('/product')
    .then((data: { items: IProduct[] }) => {
        appData.products = data.items;
        renderCatalog(appData.products);
    })
    .catch(console.error);

function renderCatalog(products: IProduct[]) {
    const galleryContainer = ensureElement<HTMLElement>('.gallery');
    galleryContainer.innerHTML = '';
    
    products.forEach(item => {
        const card = new Card(templates.cardCatalog, item, (product) => {
            events.emit('card:open', product);
        });
        galleryContainer.appendChild(card.render());
    });
}

// Обработчики событий
events.on('card:open', (item: IProduct) => {
    const isInBasket = appData.basket.some(product => product.id === item.id);
    const previewCard = new Card(templates.cardPreview, item, () => {
        if (isInBasket) {
            events.emit('basket:remove', { id: item.id });
        } else {
            events.emit('card:add', item);
        }
        modal.close();
    });

    if (previewCard['_button']) {
        previewCard['_button'].textContent = isInBasket ? 'Удалить из корзины' : 'В корзину';
    }

    modal.content = previewCard.render();
    modal.open();
});

events.on('card:add', (item: IProduct) => {
    if (item.price === null || item.price === 0) {
        console.warn('Нельзя добавить товар без цены');
        return;
    }
    appData.addToBasket(item);
    events.emit('basket:update', appData.basket);

    const basketCounter = ensureElement<HTMLElement>('.header__basket-counter');
    basketCounter.textContent = String(appData.basket.length);
});

events.on('basket:open', (items: IProduct[]) => {
    basket.render(items);
    modal.content = basket.getContainer();
    modal.open();
});

events.on('basket:update', (items: IProduct[]) => {
    basket.render(items);
});

events.on('basket:remove', (data: { id: string }) => {
    appData.removeFromBasket(data.id);
    events.emit('basket:update', appData.basket);
    
    const basketCounter = ensureElement<HTMLElement>('.header__basket-counter');
    basketCounter.textContent = String(appData.basket.length);
});

events.on('order:open', () => {
    const order = new Order(cloneTemplate(templates.order), events);
    modal.content = order.render();
    modal.open();
});

events.on('order:submit', (order: Partial<IOrder>) => {
    appData.updateOrder(order);
    const contacts = new Contacts(cloneTemplate(templates.contacts), events);
    modal.content = contacts.render();
    modal.open();
});

events.on('order:success', () => {
    modal.close();
    appData.clearBasket();
    events.emit('basket:update', appData.basket);
    
    //Обновляем счетчик в хедере
    const basketCounter = ensureElement<HTMLElement>('.header__basket-counter');
    basketCounter.textContent = '0';
});

events.on('contacts:submit', (data: { email: string; phone: string }) => {
    appData.updateOrder(data);
    
    const orderData: IOrder = {
        ...appData.order,
        items: appData.basket.map(item => item.id),
        total: appData.getTotalPrice()
    } as IOrder;

    api.post('/order', orderData)
        .then((result: { id: string, total: number }) => {
            const successElement = cloneTemplate(templates.success);
            const description = successElement.querySelector('.order-success__description');
            if (description) {
                description.textContent = `Списано ${result.total} синапсов`;
            }
            
            //Обработчик кнопки "За новыми покупками!"
            const closeButton = successElement.querySelector('.order-success__close');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    modal.close();
                });
            }
            
            modal.content = successElement;
            
            //Очищаем корзину после успешного заказа
            appData.clearBasket();
            events.emit('basket:update', appData.basket);
            
            //Обновляем счетчик в хедере
            const basketCounter = ensureElement<HTMLElement>('.header__basket-counter');
            basketCounter.textContent = '0';
        })
        .catch(console.error);
});