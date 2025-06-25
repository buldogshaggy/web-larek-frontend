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

    constructor(
        protected container: HTMLElement,
        protected events: EventEmitter
    ) {
        if (!container) throw new Error('Order container is required');
        
        this._elements = {
            form: container as HTMLFormElement,
            onlineButton: this._ensureElement<HTMLButtonElement>('button[name="card"]'),
            offlineButton: this._ensureElement<HTMLButtonElement>('button[name="cash"]'),
            addressInput: this._ensureElement<HTMLInputElement>('input[name="address"]'),
            submitButton: this._ensureElement<HTMLButtonElement>('button[type="submit"]'),
            errors: this._ensureElement<HTMLElement>('.form__errors')
        };

        this._elements.onlineButton.classList.add('button_alt');
        this._elements.offlineButton.classList.add('button_alt');

        this._initEvents();
        this._validateForm();
    }

    private _ensureElement<T extends HTMLElement>(selector: string): T {
        const element = this.container.querySelector(selector);
        if (!element) {
            console.error(`Element ${selector} not found. Container content:`, this.container.innerHTML);
            throw new Error(`Element ${selector} not found in order form`);
        }
        return element as T;
    }

    private _initEvents(): void {
        this._elements.onlineButton.addEventListener('click', () => {
            this._setPayment('online');
            this._validateForm();
        });
        
        this._elements.offlineButton.addEventListener('click', () => {
            this._setPayment('offline');
            this._validateForm();
        });
        
        this._elements.addressInput.addEventListener('input', () => {
            this._address = this._elements.addressInput.value;
            this._validateForm();
        });

        this._elements.form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this._validateForm()) {
                this.events.emit('order:submit', {
                    payment: this._payment,
                    address: this._address,
                    items: [],
                    total: 0
                } as IOrder);
            }
        });
    }

    private _setPayment(method: string): void {
        this._payment = method;

        this._elements.onlineButton.classList.remove('button_alt-active');
        this._elements.offlineButton.classList.remove('button_alt-active');

        if (method === 'online') {
            this._elements.onlineButton.classList.add('button_alt-active');
        } else if (method === 'offline') {
            this._elements.offlineButton.classList.add('button_alt-active');
        }
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
        
        // Отображаем ошибки или скрываем блок, если ошибок нет
        if (errors.length > 0) {
            this._elements.errors.innerHTML = errors.map(error => 
                `<span class="form__error">${error}</span>`
            ).join('<br>');
        } else {
            this._elements.errors.innerHTML = '';
        }

        return this._valid;
    }

    get payment(): string {
        return this._payment;
    }

    get address(): string {
        return this._address;
    }

    get valid(): boolean {
        return this._valid;
    }

    setAddress(value: string): void {
        this._elements.addressInput.value = value;
        this._address = value;
        this._validateForm();
    }
}