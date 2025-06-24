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
    modalContent.appendChild(orderElement); // Используем appendChild вместо innerHTML
    
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
        //Добавляем товары из корзины в заказ
        order.items = basket.products.map(item => item.id);
        order.total = basket.products.reduce((sum, item) => sum + (item.price || 0), 0);

        //Переходим к форме контактов
        document.body.style.overflow = 'hidden';
        modalContent.innerHTML = '';
        
        //Получаем и клонируем шаблон
        const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
        const contactsElement = cloneTemplate(contactsTemplate);
        
        //Добавляем в DOM
        modalContent.appendChild(contactsElement);
        modalContainer.classList.add('modal_active');

        //Находим форму после добавления в DOM
        const contactsForm = modalContent.querySelector('form[name="contacts"]');


        // Обработчик отправки формы
        contactsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(contactsForm as HTMLFormElement);
            
            const orderData: IOrder = {
                ...order,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                address: order.address,
                payment: order.payment,
                items: order.items,
                total: order.total
            };

            appData.createOrder(orderData)
                .then(result => {
                    events.emit('order:success', result);
                    basket.clear();
                })
                .catch(err => console.error('Ошибка оформления заказа:', err));
        });

        // Обработчики закрытия
        const closeButton = ensureElement<HTMLButtonElement>('.modal__close', modalContainer);
        closeButton.onclick = (e) => {
            e.stopPropagation();
            modalContainer.classList.remove('modal_active');
            document.body.style.overflow = '';
        };

        modalContainer.addEventListener('click', (e) => {
            if (e.target === modalContainer) {
                e.stopPropagation();
                modalContainer.classList.remove('modal_active');
                document.body.style.overflow = '';
            }
        });

    } catch (error) {
        console.error('Ошибка при открытии формы контактов:', error);
        // Показываем пользователю сообщение об ошибке
        modalContent.innerHTML = '<p>Произошла ошибка при загрузке формы. Пожалуйста, попробуйте позже.</p>';
    }
});

events.on('order:success', (result: IOrderResult) => {
    //Блокировка прокрутки страницы
    document.body.style.overflow = 'hidden';
    
    //Очищаем и заполняем модальное окно сообщением об успехе
    modalContent.innerHTML = '';
    const successTemplate = ensureElement<HTMLTemplateElement>('#success');
    const successElement = cloneTemplate(successTemplate);
    successElement.querySelector('.order-success__description')!.textContent = 
        `Списано ${result.total} синапсов`;
    
    modalContent.appendChild(successElement);
    modalContainer.classList.add('modal_active');

    // Обработчик закрытия
    const closeButton = ensureElement<HTMLButtonElement>('.order-success__close', successElement);
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