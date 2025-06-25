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
│   ├── Card.ts         - Компонент карточки товара  
│   ├── Contacts.ts     - Компонент формы контактов  
│   └── Order.ts        - Компонент формы заказа  
├── scss/               - Стили проекта  
├── types.ts            - Типы данных  
├── utils/              - Вспомогательные утилиты  
│   ├── constants.ts    - Константы приложения  
│   └── utils.ts        - Утилиты для работы с DOM  
└── index.ts            - Точка входа в приложение  

# Архитектура
Проект использует архитектурный паттерн Event-Driven Architecture с элементами MVP (Model-View-Presenter):
## Model:
**AppData** - управляет данными приложения и взаимодействием с API
**Basket** - содержит логику работы с корзиной

## View:
**Card** - отображает карточки товаров
**Order** и **Contacts** - формы для ввода данных пользователя

## Presenter:
**EventEmitter** - централизованный обработчик событий
Главный файл **index.ts** связывает все компоненты через события

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
