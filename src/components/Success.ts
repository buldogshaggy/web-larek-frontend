import { EventEmitter } from './base/events';
import { ensureElement } from '../utils/utils';

export class Success {
    protected _container: HTMLElement;
    protected _description: HTMLElement;
    protected _closeButton: HTMLButtonElement;

    constructor(container: HTMLElement, events: EventEmitter) {
        this._container = container;
        this._description = ensureElement<HTMLElement>('.order-success__description', container);
        this._closeButton = ensureElement<HTMLButtonElement>('.order-success__close', container);

        this._closeButton.addEventListener('click', () => {
            events.emit('order:success');
        });
    }

    set total(value: number) {
        this._description.textContent = `Списано ${value} синапсов`;
    }

    render(): HTMLElement {
        return this._container;
    }
}