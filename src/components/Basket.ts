import { ensureElement } from '../utils/utils';
import { EventEmitter } from './base/events';
import { IProduct } from '../types';
import { BasketItem } from './BasketItem';

export class Basket {
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLButtonElement;
    protected _basketButton: HTMLButtonElement;
    protected _counter: HTMLElement;

    constructor(
        protected container: HTMLElement,
        protected events: EventEmitter
    ) {
        this._list = ensureElement<HTMLElement>('.basket__list', container);
        this._total = ensureElement<HTMLElement>('.basket__price', container);
        this._button = ensureElement<HTMLButtonElement>('.basket__button', container);
        
        this._basketButton = ensureElement<HTMLButtonElement>('.header__basket');
        this._counter = ensureElement<HTMLElement>('.header__basket-counter');

        this._button.addEventListener('click', () => {
            events.emit('order:open');
        });

        this._basketButton.addEventListener('click', () => {
            events.emit('basket:open');
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

    setCounter(value: number): void {
        this._counter.textContent = String(value);
    }
}