import { ensureElement } from '../utils/utils';
import { EventEmitter } from './base/events';
import { IProduct } from '../types';

export class Basket {
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(protected container: HTMLElement, protected events: EventEmitter) {
        if (!container) throw new Error('Basket container not found');
        
        this._list = ensureElement<HTMLElement>('.basket__list', container);
        this._total = ensureElement<HTMLElement>('.basket__price', container);
        this._button = ensureElement<HTMLButtonElement>('.basket__button', container);

        this._button.addEventListener('click', () => {
            events.emit('order:open');
        });
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
}