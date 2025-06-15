import { ensureElement } from '../utils/utils';
import { EventEmitter } from './base/events';
import { IProduct } from '../types';

export class Basket {
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLButtonElement;
    protected _basketItems: IProduct[] = [];

    constructor(protected container: HTMLElement, protected events: EventEmitter) {
        if (!container) throw new Error('Basket container not found');
        
        this._list = ensureElement<HTMLElement>('.basket__list', container);
        this._total = ensureElement<HTMLElement>('.basket__price', container);
        this._button = ensureElement<HTMLButtonElement>('.basket__button', container);

        this._button.addEventListener('click', () => {
            events.emit('order:open');
        });
    }

    // Добавляем товар в корзину
    addItem(item: IProduct) {
        this._basketItems.push(item);
        this.refresh();
        this.events.emit('basket:changed');
        this.updateHeaderCounter(this._basketItems.length);
    }

    // Обновляем отображение корзины
    protected refresh() {
        this._list.innerHTML = '';
        this._basketItems.forEach((item, index) => {
            const itemElement = document.createElement('li');
            itemElement.className = 'basket__item card card_compact';
            itemElement.innerHTML = `
                    <span class="basket__item-index">${index + 1}</span>
                    <span class="card__title">${item.title}</span>
                    <span class="card__price">${item.price.toLocaleString('ru-RU')} синапсов</span>
                    <button class="basket__item-delete" data-id="${item.id}" aria-label="Удалить"></button>`;
            this._list.appendChild(itemElement);
        });

        this.total = this._basketItems.reduce((sum, item) => sum + (item.price || 0), 0);
    }

    // Удаляем товар из корзины
    removeItem(id: string) {
        this._basketItems = this._basketItems.filter(item => item.id !== id);
        this.refresh();
        this.events.emit('basket:changed');
        this.updateHeaderCounter(this._basketItems.length);
    }

    // Геттер для элементов DOM корзины
    get items(): HTMLElement[] {
        return Array.from(this._list.children) as HTMLElement[];
    }

    // Геттер для товаров в корзине
    get products(): IProduct[] {
        return this._basketItems;
    }

    set items(items: HTMLElement[]) {
        this._list.replaceChildren(...items);
    }

    set total(total: number) {
        this._total.textContent = `${total} синапсов`;
    }

    toggleButton(state: boolean) {
        this._button.disabled = !state;
    }

    updateHeaderCounter(count: number) {
    const counter = document.querySelector('.header__basket-counter');
    if (counter) {
        counter.textContent = count.toString();
    }
}
}