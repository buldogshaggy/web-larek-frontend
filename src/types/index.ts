export type ApiListResponse<Type> = {
    total: number,
    items: Type[]
};

export type ProductCategory = 
    'софт-скил' | 
    'хард-скил' | 
    'дополнительное' | 
    'другое' | 
    'кнопка';

export interface IProduct {
    id: string;
    description: string;
    image: string;
    title: string;
    category: ProductCategory;
    price: number | null;
}

export interface IOrderForm {
    email: string;
    phone: string;
    address: string;
    payment: string;
}

export interface IOrder extends IOrderForm {
    items: string[];
    total: number;
}

export interface IOrderResult {
    id: string;
    total: number;
}