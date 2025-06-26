import { ensureElement } from '../utils/utils';
import { EventEmitter } from './base/events';
import { IProduct } from '../types';
import { BasketItem } from './BasketItem';

export class Basket {
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLButtonElement;
    protected _itemTemplate: HTMLTemplateElement;

    constructor(
        protected container: HTMLElement,
        protected events: EventEmitter,
        itemTemplate: HTMLTemplateElement
    ) {
        this._itemTemplate = itemTemplate;
        this._list = ensureElement<HTMLElement>('.basket__list', container);
        this._total = ensureElement<HTMLElement>('.basket__price', container);
        this._button = ensureElement<HTMLButtonElement>('.basket__button', container);

        this._button.addEventListener('click', () => {
            events.emit('order:open');
        });
    }

    public getContainer(): HTMLElement {
        return this.container;
    }

    render(items: IProduct[]): void {
        this._list.innerHTML = '';
        items.forEach((item, index) => {
            const basketItem = new BasketItem(this._itemTemplate, item, index);
            basketItem.container.querySelector('.basket__item-delete')?.addEventListener('click', () => {
                this.events.emit('basket:remove', { id: item.id });
            });
            this._list.appendChild(basketItem.container);
        });
        this._total.textContent = `${this.calculateTotal(items)} синапсов`;
        this._button.disabled = items.length === 0;
    }

    private calculateTotal(items: IProduct[]): number {
        return items.reduce((sum, item) => sum + (item.price || 0), 0);
    }
}