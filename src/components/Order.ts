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
    private _payment: string = '';
    private _address: string = '';
    private _valid: boolean = false;
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
        this._validateForm();
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
            this._setPayment('online');
        });
        
        this._elements.offlineButton.addEventListener('click', () => {
            this._setPayment('offline');
        });
        
        this._elements.addressInput.addEventListener('input', () => {
            this._address = this._elements.addressInput.value;
            this._validateForm();
        });

        this._elements.form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this._valid) {
                this.events.emit('order:submit', {
                    payment: this._payment,
                    address: this._address
                });
            }
        });
    }

    private _setPayment(method: string): void {
        this._payment = method;
        this._elements.onlineButton.classList.toggle('button_alt-active', method === 'online');
        this._elements.offlineButton.classList.toggle('button_alt-active', method === 'offline');
        this._validateForm();
    }

    private _validateForm(): boolean {
        const errors: string[] = [];
        
        if (!this._payment) {
            errors.push('Выберите способ оплаты');
        }
        
        if (!this._address.trim()) {
            errors.push('Укажите адрес доставки');
        }

        this._valid = errors.length === 0;
        this._elements.submitButton.disabled = !this._valid;
        
        this._elements.errors.innerHTML = errors.length > 0 
            ? errors.map(error => `<span class="form__error">${error}</span>`).join('<br>')
            : '';

        return this._valid;
    }

    // Добавляем метод render
    render(): HTMLElement {
        return this.container;
    }
}