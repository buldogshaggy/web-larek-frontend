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
import { Success } from './components/Success';
import { Page } from './components/Page';

const events = new EventEmitter();
const api = new Api(API_URL);
const appData = new AppData(events);

//Инициализация модального окна
const modalContainer = ensureElement<HTMLElement>('#modal-container');
const modal = new Modal(modalContainer);

//Шаблоны
const templates = {
    cardCatalog: ensureElement<HTMLTemplateElement>('#card-catalog'),
    cardPreview: ensureElement<HTMLTemplateElement>('#card-preview'),
    basket: ensureElement<HTMLTemplateElement>('#basket'),
    basketItem: ensureElement<HTMLTemplateElement>('#card-basket'),
    order: ensureElement<HTMLTemplateElement>('#order'),
    contacts: ensureElement<HTMLTemplateElement>('#contacts'),
    success: ensureElement<HTMLTemplateElement>('#success')
};

//Компоненты
const basket = new Basket(cloneTemplate(templates.basket), events);
const order = new Order(cloneTemplate(templates.order), events);
const contacts = new Contacts(cloneTemplate(templates.contacts), events);
const success = new Success(cloneTemplate(templates.success), events);
const page = new Page();

//Загрузка товаров
api.get('/product')
    .then((data: { items: IProduct[] }) => {
        appData.products = data.items;
    })
    .catch(console.error);

//Обработчики событий
events.on('items:changed', (items: IProduct[]) => {
    const cards = items.map(item => {
        const card = new Card(templates.cardCatalog, item, (product) => {
            events.emit('card:open', product);
        });
        return card.render();
    });
    page.renderCatalog(cards);
});

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
    events.emit('basket:change');
});

events.on('basket:open', () => {
    const basketItems = appData.basket.map((item, index) => {
        return new BasketItem(templates.basketItem, item, index, events).container;
    });

    //Обновляем корзину
    basket.setItems(basketItems);
    basket.setTotal(appData.getTotalPrice());
    basket.setButtonState(appData.basket.length === 0);

    modal.content = basket.getContainer();
    modal.open();
});

events.on('basket:change', () => {
    const basketItems = appData.basket.map((item, index) => {
        return new BasketItem(templates.basketItem, item, index, events).container;
    });

    //Обновляем корзину
    basket.setItems(basketItems);
    basket.setTotal(appData.getTotalPrice());
    basket.setButtonState(appData.basket.length === 0);
    basket.setCounter(appData.basket.length);
});

events.on('basket:remove', (data: { id: string }) => {
    appData.removeFromBasket(data.id);
    events.emit('basket:change');
});

events.on('order:open', () => {
    modal.content = order.render();
    modal.open();
});

events.on('order:submit', (order: Partial<IOrder>) => {
    appData.updateOrder(order);
    modal.content = contacts.render();
    events.emit('contacts:validation', {
        email: contacts.elements.emailInput.value,
        phone: contacts.elements.phoneInput.value
    });
    modal.open();
});

events.on('order:validation', (data: { errors: Record<string, string>, valid: boolean }) => {
    order.setErrors(data.errors);
    order.setValid(data.valid);
});

events.on('order.payment:change', (data: { value: string }) => {
    order.setPaymentMethod(data.value);
});

events.on('order:success', () => {
    modal.close();
    appData.clearBasket();
    events.emit('basket:change');
});

events.on('contacts:validated', (data: { errors: Record<string, string>, valid: boolean }) => {
    contacts.setErrors(data.errors);
    contacts.setValid(data.valid);
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
            success.total = result.total;
            events.emit('order:success');
            modal.content = success.render();
            modal.open();
        })
        .catch(console.error);
});