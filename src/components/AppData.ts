import { IProduct, IOrder, IOrderResult } from '../types';
import { EventEmitter } from './base/events';

export class AppData {
    private _products: IProduct[] = [];
    private _basket: IProduct[] = [];
    private _order: Partial<IOrder> = {};
    private events: EventEmitter;

    constructor(events: EventEmitter) {
        this.events = events;
        this._initEventHandlers();
    }

    private _initEventHandlers(): void {
        this.events.on('order.payment:change', (data: { value: string }) => {
            this.updateOrder({ payment: data.value });
            this._validateOrder();
        });

        this.events.on('order.address:change', (data: { value: string }) => {
            this.updateOrder({ address: data.value });
            this._validateOrder();
        });
    }

    private _validateOrder(): void {
        const errors: Partial<Record<keyof IOrder, string>> = {};
        
        if (!this._order.payment) {
            errors.payment = 'Выберите способ оплаты';
        }
        
        if (!this._order.address?.trim()) {
            errors.address = 'Укажите адрес доставки';
        }

        const isValid = Object.keys(errors).length === 0;
        this.events.emit('order:validation', {
            errors,
            valid: isValid
        });
    }

    updateBasket(action: 'add' | 'remove' | 'clear', item?: IProduct): void {
        switch(action) {
            case 'add':
                if (item) this._basket.push(item);
                break;
            case 'remove':
                if (item) this._basket = this._basket.filter(i => i.id !== item.id);
                break;
            case 'clear':
                this._basket = [];
                break;
        }
    }

    get products(): IProduct[] {
        return this._products;
    }

    set products(items: IProduct[]) {
        this._products = items.map(item => ({
            ...item,
            price: item.price ?? 0,
            image: item.image.replace('.svg', '.png')
        }));
        this.events.emit('items:changed', this._products);
    }

    get basket(): IProduct[] {
        return this._basket;
    }

    addToBasket(item: IProduct): void {
        this._basket.push(item);
    }

    removeFromBasket(id: string): void {
        this._basket = this._basket.filter(item => item.id !== id);
    }

    clearBasket(): void {
        this._basket = [];
    }

    get order(): Partial<IOrder> {
        return this._order;
    }

    updateOrder(fields: Partial<IOrder>): void {
        this._order = { ...this._order, ...fields };
    }

    validateContacts(): boolean {
        return !!this._order.email && !!this._order.phone;
    }

    getTotalPrice(): number {
        return this._basket.reduce((sum, item) => sum + (item.price || 0), 0);
    }
}