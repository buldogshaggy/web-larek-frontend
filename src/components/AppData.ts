import { Api } from './base/api';
import { IProduct, IOrder, IOrderResult } from '../types';

export class AppData {
    private _api: Api;
    private _products: IProduct[] = [];

    constructor(api: Api) {
        this._api = api;
    }

    //Получаем массив товаров
    async getProducts(): Promise<IProduct[]> {
        if (this._products.length) {
            return this._products;
        }

        const response = await this._api.get('/product');
        this._products = (response as { items: IProduct[] }).items.map(item => ({
            ...item,
            price: item.price ?? 0,
            image: item.image.replace('.svg', '.png')
        }));
        return this._products;
    }

    async createOrder(order: IOrder): Promise<IOrderResult> {
        const result = await this._api.post('/order', order);
        return {
            id: (result as { id: string }).id,
            total: (result as { total: number }).total
        };
    }
}