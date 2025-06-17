import { ensureElement } from '../utils/utils';
import { EventEmitter } from './base/events';
import { IOrder } from '../types';

interface IOrderElements {
    form: HTMLFormElement;
    onlineButton: HTMLButtonElement;
    offlineButton: HTMLButtonElement;
    addressInput: HTMLInputElement;
    submitButton: HTMLButtonElement;
}

export class Order {
    private _elements: IOrderElements;
    private _payment: string = '';
    private _address: string = '';

    constructor(
        protected container: HTMLElement,
        protected events: EventEmitter
    ) {
        // Проверяем, что контейнер существует
        if (!container) throw new Error('Order container is required');
        
        // Ищем элементы внутри переданного контейнера
        this._elements = {
            form: this._ensureElement<HTMLFormElement>('form[name="order"]'),
            onlineButton: this._ensureElement<HTMLButtonElement>('button[name="card"]'),
            offlineButton: this._ensureElement<HTMLButtonElement>('button[name="cash"]'),
            addressInput: this._ensureElement<HTMLInputElement>('input[name="address"]'),
            submitButton: this._ensureElement<HTMLButtonElement>('button[type="submit"]')
        };

        this._initEvents();
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
        this._elements.onlineButton.addEventListener('click', () => this._setPayment('online'));
        this._elements.offlineButton.addEventListener('click', () => this._setPayment('offline'));
        
        this._elements.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this._address = this._elements.addressInput.value;
            this.events.emit('order:submit', {
                payment: this._payment,
                address: this._address,
                items: [],
                total: 0
            } as IOrder);
        });
    }

    private _setPayment(method: string): void {
        this._payment = method;
        this._elements.onlineButton.classList.toggle('button_alt-active', method === 'online');
        this._elements.offlineButton.classList.toggle('button_alt-active', method === 'offline');
    }

    get payment(): string {
        return this._payment;
    }

    get address(): string {
        return this._address;
    }

    setAddress(value: string): void {
        this._elements.addressInput.value = value;
        this._address = value;
    }
}