import { IProduct, IOrder, IOrderResult } from '../types';

export class AppData {
    private _products: IProduct[] = [];
    private _basket: IProduct[] = [];
    private _order: Partial<IOrder> = {};

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

    // Получение списка товаров
    get products(): IProduct[] {
        return this._products;
    }

    set products(items: IProduct[]) {
        this._products = items.map(item => ({
            ...item,
            price: item.price ?? 0,
            image: item.image.replace('.svg', '.png')
        }));
    }

    // Работа с корзиной
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

    // Работа с заказом
    get order(): Partial<IOrder> {
        return this._order;
    }

    updateOrder(fields: Partial<IOrder>): void {
        this._order = { ...this._order, ...fields };
    }

    // Валидация
    validateOrder(): boolean {
        return !!this._order.payment && !!this._order.address;
    }

    validateContacts(): boolean {
        return !!this._order.email && !!this._order.phone;
    }

    // Подсчет стоимости
    getTotalPrice(): number {
        return this._basket.reduce((sum, item) => sum + (item.price || 0), 0);
    }
}