import { ensureElement } from '../utils/utils';
import { EventEmitter } from './base/events';
import { IProduct } from '../types';
import { BasketItem } from './BasketItem';

export class Basket {
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(
        protected container: HTMLElement,
        protected events: EventEmitter
    ) {
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

    setItems(items: HTMLElement[]): void {
        this._list.replaceChildren(...items);
    }

    setTotal(total: number): void {
        this._total.textContent = `${total} синапсов`;
    }

    setButtonState(disabled: boolean): void {
        this._button.disabled = disabled;
    }
}