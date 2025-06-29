# Описание проекта
WebLarek - это интернет-магазин цифровых товаров с функционалом корзины и оформления заказов. Проект реализован на TypeScript с использованием паттерна EventEmitter для управления событиями между компонентами.

# Структура проекта
src/
├── components/         - Основные компоненты приложения
│   ├── base/           - Базовые классы
│   │   ├── api.ts      - Класс для работы с API
│   │   └── events.ts   - Реализация EventEmitter
│   ├── AppData.ts      - Модель данных приложения
│   ├── Basket.ts       - Компонент корзины
│   ├── BasketItem.ts   - Элемент корзины
│   ├── Card.ts         - Компонент карточки товара
│   ├── Contacts.ts     - Компонент формы контактов
│   ├── Modal.ts        - Модальное окно
│   ├── Order.ts        - Компонент формы заказа
│   ├── Page.ts         - Главная страница
│   └── Success.ts      - Успешное оформление заказа
├── scss/               - Стили проекта
├── types.ts            - Типы данных
├── utils/              - Вспомогательные утилиты
│   ├── constants.ts    - Константы приложения
│   └── utils.ts        - Утилиты для работы с DOM
└── index.ts            - Точка входа в приложение  

# Типы данных (types.ts)
Основные интерфейсы данных:
```
interface IProduct {
    id: string;
    description: string;
    image: string;
    title: string;
    category: ProductCategory;
    price: number | null;
}

interface IOrder {
    email: string;
    phone: string;
    address: string;
    payment: string;
    items: string[];
    total: number;
}

interface IOrderResult {
    id: string;
    total: number;
}
```
# Архитектура (MVP)

## Model (Модель данных)
**Классы:** `AppData`, `Basket`

### AppData
**Назначение:** Центральное хранилище состояния приложения  
**Данные:**
- `_products: IProduct[]` - список товаров
- `_basket: IProduct[]` - товары в корзине
- `_order: Partial<IOrder>` - данные заказа

**Методы:**
- Работа с корзиной (`addToBasket`, `removeFromBasket`, `clearBasket`)
- Валидация (`validateOrder`, `validateEmail`, `_validatePhone`)
- Подсчет стоимости (`getTotalPrice`)
- Обновление данных заказа (`updateOrder`)

### Basket
**Назначение:** Логика работы корзины  
**Данные:**
- `_items: IProduct[]` - товары в корзине
- `_total: number` - общая стоимость

**События:**
- `basket:changed` - при изменении состава корзины  
- `basket:open` - открытие корзины  
- `basket:remove` - удаление товара из корзины  

## View (Представление)
**Классы:** `Card`, `Order`, `Contacts`, `BasketItem`, `Modal`, `Success`

### Card
**Назначение:** Отображение карточки товара  
**События:**
- `card:open` - открытие деталей товара
- `card:add` - добавление в корзину

**Поля:**
- `_button: HTMLButtonElement` - кнопка "В корзину"
- `_image: HTMLImageElement` - изображение товара

### Order
**Назначение:** Форма заказа (адрес и оплата)  
**События:**
- `order:submit` - отправка формы
- `order.payment:changed` - смена способа оплаты  
- `order.address:change` - изменение адреса

**Поля:**
- `_addressInput: HTMLInputElement` - поле адреса
- `_paymentButtons: HTMLButtonElement[]` - кнопки оплаты

### Contacts
**Назначение:** Форма контактных данных  
**События:**
- `contacts:submit` - отправка формы
- `input:changed` - изменение полей ввода

## Presenter (Посредник)
**Классы:** `EventEmitter`, Главный `index.ts`

### EventEmitter
**Назначение:** Централизованная система событий  
**Методы:**
- `on()` - подписка на события
- `emit()` - генерация событий
- `off()` - отписка от событий

# Взаимодействие слоев

1. **View → Presenter**:
   - Компоненты генерируют события через `EventEmitter`
   ```typescript
   // Пример в Card.ts
   this._button.addEventListener('click', () => {
       this.events.emit('card:add', this.item);
   });

2. **Presenter → Model**:
    - Главный файл (index.ts) обрабатывает события и изменяет модель
    ```typescript
    events.on('card:add', (item) => {
    appData.addToBasket(item);
});

3. **Model → View**:
    - При изменении данных модель уведомляет представление
    ```typescript
    // В Basket.ts
    this.events.emit('basket:changed', this._items);

# Особенности реализации

1. **Строгая типизация**:
    - Все события имеют четко описанные типы данных
    ```events.on<{id: string}>('basket:remove', (data) => {...});```

2. **Инкапсуляция DOM**:
    - Каждый компонент управляет своим участком DOM
    - Нет глобальных поисков элементов

3. **Однонаправленный поток данных**:  
    Пользователь → View → Event → Model → Обновление View

# Запуск проекта
Установите зависимости:  
```npm install```  
Запустите проект:  
```npm start```  
Откройте в браузере:  
```http://localhost:3000```
