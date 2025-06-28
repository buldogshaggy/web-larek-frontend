import { ensureElement } from '../utils/utils';
import { EventEmitter } from './base/events';
import { IOrder } from '../types';

interface IOrderElements {
    form: HTMLFormElement;
    onlineButton: HTMLButtonElement;
    offlineButton: HTMLButtonElement;
    addressInput: HTMLInputElement;
    submitButton: HTMLButtonElement;
    errors: HTMLElement;
}

export class Order {
    private _elements: IOrderElements;
    public container: HTMLElement;

    constructor(
        container: HTMLElement,
        protected events: EventEmitter
    ) {
        this.container = container;
        if (!container) throw new Error('Order container is required');
        
        this._elements = {
            form: container as HTMLFormElement,
            onlineButton: this._ensureElement<HTMLButtonElement>('button[name="card"]'),
            offlineButton: this._ensureElement<HTMLButtonElement>('button[name="cash"]'),
            addressInput: this._ensureElement<HTMLInputElement>('input[name="address"]'),
            submitButton: this._ensureElement<HTMLButtonElement>('button[type="submit"]'),
            errors: this._ensureElement<HTMLElement>('.form__errors')
        };

        this._initEvents();
    }

    private _ensureElement<T extends HTMLElement>(selector: string): T {
        const element = this.container.querySelector(selector);
        if (!element) {
            throw new Error(`Element ${selector} not found in order form`);
        }
        return element as T;
    }

    private _initEvents(): void {
        this._elements.onlineButton.addEventListener('click', () => {
            this.events.emit('order.payment:change', { value: 'online' });
        });
        
        this._elements.offlineButton.addEventListener('click', () => {
            this.events.emit('order.payment:change', { value: 'offline' });
        });

        this._elements.addressInput.addEventListener('input', () => {
            this.events.emit('order.address:change', { 
                value: this._elements.addressInput.value 
            });
        });

        this._elements.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.events.emit('order:submit');
        });
    }

    setPaymentMethod(value: string): void {
        this._elements.onlineButton.classList.toggle('button_alt-active', value === 'online');
        this._elements.offlineButton.classList.toggle('button_alt-active', value === 'offline');
    }

    setAddress(value: string): void {
        this._elements.addressInput.value = value;
    }

    setErrors(errors: Partial<Record<keyof IOrder, string>>): void {
        const errorMessages = Object.values(errors).filter(Boolean);
        this._elements.errors.innerHTML = errorMessages.length > 0 
            ? errorMessages.map(error => `<span class="form__error">${error}</span>`).join('<br>')
            : '';
    }

    setValid(state: boolean): void {
        this._elements.submitButton.disabled = !state;
    }

    render(): HTMLElement {
        return this.container;
    }
}