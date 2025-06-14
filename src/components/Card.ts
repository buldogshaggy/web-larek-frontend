import { ensureElement } from '../utils/utils';
import { IProduct, ProductCategory } from '../types';
import { CDN_URL } from '../utils/constants';

export class Card {
    protected _title: HTMLElement;
    protected _image: HTMLImageElement;
    protected _category: HTMLElement;
    protected _price: HTMLElement;
    protected _button?: HTMLButtonElement;
    protected _container: HTMLElement;

    constructor(
        protected template: HTMLTemplateElement, 
        protected item: IProduct,
        protected onClick?: (item: IProduct) => void
    ) {
        this._container = template.content.cloneNode(true) as HTMLElement;
        this._title = ensureElement<HTMLElement>('.card__title', this._container);
        this._image = ensureElement<HTMLImageElement>('.card__image', this._container);
        this._category = ensureElement<HTMLElement>('.card__category', this._container);
        this._price = ensureElement<HTMLElement>('.card__price', this._container);

        this._title.textContent = item.title;
        this._image.src = `${CDN_URL}${item.image}`;
        this._image.alt = item.title;
        this._price.textContent = item.price ? `${item.price} синапсов` : 'Бесценно';
        
        this.setCategory(item.category);
        
        // Назначаем обработчик клика напрямую
        this._container.addEventListener('click', () => {
            console.log('Card clicked:', item.title); // Отладочное сообщение
            this.onClick?.(item);
        });
    }

    private setCategory(category: ProductCategory): void {
        this._category.textContent = category;
        const categoryClass = this.mapCategoryToClass(category);
        this._category.className = `card__category card__category_${categoryClass}`;
    }

    private mapCategoryToClass(category: ProductCategory): string {
        const mapping: Record<ProductCategory, string> = {
            'софт-скил': 'soft',
            'хард-скил': 'hard',
            'дополнительное': 'additional',
            'другое': 'other',
            'кнопка': 'button'
        };
        return mapping[category];
    }

    render(): HTMLElement {
        return this._container;
    }
}