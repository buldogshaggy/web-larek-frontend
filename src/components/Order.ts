import { ensureElement } from '../utils/utils';
import { EventEmitter } from './base/events';

export class Order {
    protected _onlineButton: HTMLButtonElement;
    protected _offlineButton: HTMLButtonElement;
    protected _addressInput: HTMLInputElement;
    protected _submitButton: HTMLButtonElement;

    constructor(protected container: HTMLElement, protected events: EventEmitter) {
        this._onlineButton = ensureElement<HTMLButtonElement>('button[name="card"]', container);
        this._offlineButton = ensureElement<HTMLButtonElement>('button[name="cash"]', container);
        this._addressInput = ensureElement<HTMLInputElement>('input[name="address"]', container);
        this._submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', container);

        this._onlineButton.addEventListener('click', () => this.togglePayment('online'));
        this._offlineButton.addEventListener('click', () => this.togglePayment('offline'));
        
        container.addEventListener('submit', (e) => {
            e.preventDefault();
            events.emit('contacts:open');
        });
    }

    togglePayment(method: string) {
        this._onlineButton.classList.toggle('button_alt-active', method === 'online');
        this._offlineButton.classList.toggle('button_alt-active', method === 'offline');
        this._submitButton.disabled = false;
    }

    set address(value: string) {
        this._addressInput.value = value;
    }
}