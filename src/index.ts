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

//Модифицируем обработчик открытия карточки
events.on('card:open', (item: IProduct) => {
    //Блокировка прокрутки страницы
    document.body.style.overflow = 'hidden';

    modalContent.innerHTML = '';
    const previewCard = new Card(cardPreviewTemplate, item);
    
    //Добавляем кнопку "В корзину"
    const addButton = previewCard.render().querySelector('.card__button');
    if (addButton) {
        addButton.addEventListener('click', (e) => {
            //e.stopPropagation();
            events.emit('card:add', item);
            modalContainer.classList.remove('modal_active');

            //Разблокировка прокрутки при закрытии через крестик
            document.body.style.overflow = '';
        });
    }
    
    modalContent.appendChild(previewCard.render());
    modalContainer.classList.add('modal_active');

    
    //Обработчик закрытия
    const closeButton = ensureElement<HTMLButtonElement>('.modal__close', modalContainer);
    closeButton.onclick = (e) => {
        e.stopPropagation();
        modalContainer.classList.remove('modal_active');

        //Разблокировка прокрутки при закрытии через крестик
        document.body.style.overflow = '';
    };

    //Дополнительно: обработчик закрытия при клике на оверлей
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
    //Блокировка прокрутки страницы
    document.body.style.overflow = 'hidden';
    
    //Очищаем и заполняем модальное окно содержимым корзины
    modalContent.innerHTML = '';
    modalContent.appendChild(basketElement);
    modalContainer.classList.add('modal_active');

    //Обработчик закрытия
    const closeButton = ensureElement<HTMLButtonElement>('.modal__close', modalContainer);
    closeButton.onclick = (e) => {
        e.stopPropagation();
        modalContainer.classList.remove('modal_active');
        document.body.style.overflow = '';
    };

    //Обработчик закрытия при клике на оверлей
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            e.stopPropagation();
            modalContainer.classList.remove('modal_active');
            document.body.style.overflow = '';
        }
    });
});

events.on('order:open', () => {
  try {
    document.body.style.overflow = 'hidden';
    modalContent.innerHTML = '';

    // Клонируем шаблон
    const orderElement = cloneTemplate(orderTemplate);

    // Создаем Order - передаем клонированный элемент
    const order = new Order(orderElement as HTMLFormElement, events);
    
    // Добавляем элемент в modalContent
    modalContent.appendChild(orderElement);
    
    modalContainer.classList.add('modal_active');
  } catch (error) {
    console.error('Ошибка инициализации формы:', error);
    modalContainer.classList.remove('modal_active');
    document.body.style.overflow = '';
  }
});

// Добавим после инициализации Order:

events.on('order:submit', (order: IOrder) => {
    try {
        // Добавляем товары из корзины в заказ
        order.items = basket.products.map(item => item.id);
        order.total = basket.products.reduce((sum, item) => sum + (item.price || 0), 0);

        // Переходим к форме контактов
        document.body.style.overflow = 'hidden';
        modalContent.innerHTML = '';
        
        // Получаем и клонируем шаблон
        const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
        const contactsElement = cloneTemplate(contactsTemplate);
        
        // Создаем экземпляр Contacts
        const contacts = new Contacts(contactsElement, events);
        
        // Добавляем в DOM
        modalContent.appendChild(contactsElement);
        modalContainer.classList.add('modal_active');

        // Обработчик отправки формы
        // Обновлённый обработчик contacts:submit
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

    console.log('Отправка заказа:', orderData); // Лог для отладки

    appData.createOrder(orderData)
        .then(result => {
            console.log('Ответ сервера:', result); // Лог для отладки
            if (result) {
                // 1. Сначала готовим success-окно
                const successTemplate = ensureElement<HTMLTemplateElement>('#success');
                const successElement = cloneTemplate(successTemplate);
                
                // Заполняем данными
                const description = successElement.querySelector('.order-success__description');
                if (description) {
                    description.textContent = `Списано ${result.total} синапсов`;
                }

                // 2. Затем закрываем текущее окно
                modalContainer.classList.remove('modal_active');
                
                // 3. И открываем success-окно
                modalContent.innerHTML = '';
                modalContent.appendChild(successElement);
                modalContainer.classList.add('modal_active');
                document.body.style.overflow = 'hidden';

                // Обработчики для нового окна
                const closeButton = successElement.querySelector('.order-success__close');
                if (closeButton) {
                    closeButton.addEventListener('click', () => {
                        modalContainer.classList.remove('modal_active');
                        document.body.style.overflow = '';
                    });
                }

                modalContainer.addEventListener('click', (e) => {
                    if (e.target === modalContainer) {
                        modalContainer.classList.remove('modal_active');
                        document.body.style.overflow = '';
                    }
                }, { once: true });

                // Очищаем корзину
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

        modalContainer.addEventListener('click', (e) => {
            if (e.target === modalContainer) {
                e.stopPropagation();
                modalContainer.classList.remove('modal_active');
                document.body.style.overflow = '';
            }
        });

    } catch (error) {
        console.error('Ошибка при открытии формы контактов:', error);
        modalContent.innerHTML = '<p>Произошла ошибка при загрузке формы. Пожалуйста, попробуйте позже.</p>';
    }
});

events.on('order:success', (result: IOrderResult) => {
    try {
        // Сначала закрываем текущее модальное окно (форму контактов)
        modalContainer.classList.remove('modal_active');
        
        // Затем открываем новое модальное окно с успешным заказом
        document.body.style.overflow = 'hidden';
        modalContent.innerHTML = '';

        const successTemplate = ensureElement<HTMLTemplateElement>('#success');
        console.log(successTemplate);
        const successElement = cloneTemplate(successTemplate);

        const description = successElement.querySelector('.order-success__description');
        if (description) {
            description.textContent = `Списано ${result.total} синапсов`;
        }

        modalContent.appendChild(successElement);
        modalContainer.classList.add('modal_active');

        const closeButton = successElement.querySelector('.order-success__close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                modalContainer.classList.remove('modal_active');
                document.body.style.overflow = '';
            });
        }

        modalContainer.addEventListener('click', (e) => {
            if (e.target === modalContainer) {
                modalContainer.classList.remove('modal_active');
                document.body.style.overflow = '';
            }
        });

    } catch (error) {
        console.error('Ошибка при отображении успешного заказа:', error);
        modalContent.innerHTML = '<p>Произошла ошибка при отображении информации о заказе.</p>';
    }
});