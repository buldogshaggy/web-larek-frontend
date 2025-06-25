import './scss/styles.scss';
import { Api } from './components/base/api';
import { AppData } from './components/AppData';
import { Card } from './components/Card';
import { Basket } from './components/Basket';
import { Order } from './components/Order';
import { EventEmitter } from './components/base/events';
import { API_URL } from './utils/constants';
import { IProduct, IOrder, IOrderResult } from './types';
import { ensureElement, cloneTemplate } from './utils/utils';
import { Contacts } from './components/Contacts';

const events = new EventEmitter();
const api = new Api(API_URL);
const appData = new AppData(api);

//Шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');

//Контейнеры
const galleryContainer = ensureElement<HTMLElement>('.gallery');
const modalContainer = ensureElement<HTMLElement>('#modal-container');
const modalContent = ensureElement('.modal__content', modalContainer);

//Инициализация корзины
const basketElement = cloneTemplate(basketTemplate);
const basket = new Basket(basketElement, events);
const headerBasket = ensureElement<HTMLElement>('.header__basket');

//Функции для работы с модальным окном
function openModal(content?: HTMLElement) {
    document.body.style.overflow = 'hidden';
    modalContent.innerHTML = '';
    if (content) {
        modalContent.appendChild(content);
    }
    modalContainer.classList.add('modal_active');
    setupModalCloseHandlers();
}

function closeModal() {
    modalContainer.classList.remove('modal_active');
    document.body.style.overflow = '';
}

function setupModalCloseHandlers() {
    //Обработчик закрытия через крестик
    const closeButton = ensureElement<HTMLButtonElement>('.modal__close', modalContainer);
    closeButton.onclick = (e) => {
        e.stopPropagation();
        closeModal();
    };

    //Обработчик закрытия при клике на оверлей
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            e.stopPropagation();
            closeModal();
        }
    }, { once: true });
}

//Загрузка товаров
appData.getProducts()
    .then(products => {
        galleryContainer.innerHTML = '';
        products.forEach(item => {
            const card = new Card(cardCatalogTemplate, item, (product) => {
                events.emit('card:open', product);
            });
            
            //Добавляем карточку в DOM
            galleryContainer.appendChild(card.render());
        });
    })
    .catch(err => console.error('Ошибка загрузки товаров:', err));

//Обработчик открытия карточки
events.on('card:open', (item: IProduct) => {
    const previewCard = new Card(cardPreviewTemplate, item);
    
    //Добавляем кнопку "В корзину"
    const addButton = previewCard.render().querySelector('.card__button');
    if (addButton) {
        addButton.addEventListener('click', (e) => {
            events.emit('card:add', item);
            closeModal();
        });
    }
    
    openModal(previewCard.render());
});

events.on('basket:changed', () => {
    basket.toggleButton(basket.items.length > 0);
});

//Обработчик добавления в корзину
events.on('card:add', (item: IProduct) => {
    basket.addItem(item);
});

//Обработчик удаления из корзины
basketElement.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('basket__item-delete')) {
        const id = target.dataset.id;
        if (id) basket.removeItem(id);
    }
});

headerBasket.addEventListener('click', () => {
    openModal(basketElement);
});

events.on('order:open', () => {
    try {
        //Клонируем шаблон
        const orderElement = cloneTemplate(orderTemplate);

        //Создаем Order - передаем клонированный элемент
        const order = new Order(orderElement as HTMLFormElement, events);
        
        openModal(orderElement);
    } catch (error) {
        console.error('Ошибка инициализации формы:', error);
        closeModal();
    }
});

//Обработчик отправки формы заказа
events.on('order:submit', (order: IOrder) => {
    try {
        //Добавляем товары из корзины в заказ
        order.items = basket.products.map(item => item.id);
        order.total = basket.products.reduce((sum, item) => sum + (item.price || 0), 0);

        //Переходим к форме контактов
        const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
        const contactsElement = cloneTemplate(contactsTemplate);
        
        //Создаем экземпляр Contacts
        const contacts = new Contacts(contactsElement, events);
        
        openModal(contactsElement);

        //Обработчик отправки формы контактов
        events.on('contacts:submit', (data: { email: string; phone: string }) => {
            const orderData: IOrder = {
                ...order,
                email: data.email,
                phone: data.phone,
                address: order.address,
                payment: order.payment,
                items: basket.products.map(item => item.id),
                total: basket.products.reduce((sum, item) => sum + (item.price || 0), 0)
            };

            console.log('Отправка заказа:', orderData);

            appData.createOrder(orderData)
                .then(result => {
                    console.log('Ответ сервера:', result);
                    if (result) {
                        //Подготавливаем success-окно
                        const successTemplate = ensureElement<HTMLTemplateElement>('#success');
                        const successElement = cloneTemplate(successTemplate);
                        
                        //Заполняем данными
                        const description = successElement.querySelector('.order-success__description');
                        if (description) {
                            description.textContent = `Списано ${result.total} синапсов`;
                        }

                        //Закрываем текущее окно и открываем success-окно
                        closeModal();
                        openModal(successElement);

                        //Обработчики для нового окна
                        const closeButton = successElement.querySelector('.order-success__close');
                        if (closeButton) {
                            closeButton.addEventListener('click', closeModal);
                        }

                        //Очищаем корзину
                        basket.clear();
                    }
                })
                .catch(err => {
                    console.error('Ошибка оформления заказа:', err);
                    const errorsElement = modalContent.querySelector('.form__errors');
                    if (errorsElement) {
                        errorsElement.innerHTML = '<span class="form__error">Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте еще раз.</span>';
                    }
                });
        });
    } catch (error) {
        console.error('Ошибка при открытии формы контактов:', error);
        modalContent.innerHTML = '<p>Произошла ошибка при загрузке формы. Пожалуйста, попробуйте позже.</p>';
    }
});

events.on('order:success', (result: IOrderResult) => {
    try {
        //Подготавливаем success-окно
        const successTemplate = ensureElement<HTMLTemplateElement>('#success');
        const successElement = cloneTemplate(successTemplate);

        const description = successElement.querySelector('.order-success__description');
        if (description) {
            description.textContent = `Списано ${result.total} синапсов`;
        }

        //Закрываем текущее окно и открываем success-окно
        closeModal();
        openModal(successElement);

        //Обработчик закрытия
        const closeButton = successElement.querySelector('.order-success__close');
        if (closeButton) {
            closeButton.addEventListener('click', closeModal);
        }
    } catch (error) {
        console.error('Ошибка при отображении успешного заказа:', error);
        modalContent.innerHTML = '<p>Произошла ошибка при отображении информации о заказе.</p>';
    }
});