import { ensureElement } from '../utils/utils';
import { IProduct, ProductCategory } from '../types';
import { CDN_URL } from '../utils/constants';

export class Card {
    protected _container: HTMLElement;
    protected _title: HTMLElement;
    protected _image: HTMLImageElement;
    protected _category: HTMLElement;
    protected _price: HTMLElement;

    constructor(
        protected template: HTMLTemplateElement,
        protected item: IProduct,
        protected onClick?: (item: IProduct) => void
    ) {
        //Создаём элемент из шаблона
        this._container = template.content.firstElementChild?.cloneNode(true) as HTMLElement;
        
        if (!this._container) {
            throw new Error('Не удалось создать карточку из шаблона');
        }

        //Инициализация элементов
        this._title = ensureElement<HTMLElement>('.card__title', this._container);
        this._image = ensureElement<HTMLImageElement>('.card__image', this._container);
        this._category = ensureElement<HTMLElement>('.card__category', this._container);
        this._price = ensureElement<HTMLElement>('.card__price', this._container);

        //Заполняем данные
        this._title.textContent = item.title;
        this._image.src = `${CDN_URL}${item.image}`;
        this._image.alt = item.title;
        this._price.textContent = item.price ? `${item.price} синапсов` : 'Бесценно';
        this.setCategory(item.category);

        //Добавляем обработчик клика
        this._container.style.cursor = 'pointer';
        this._container.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.onClick?.(this.item);
        });
    }

    //Устанавливаем категорию товара карточке
    private setCategory(category: ProductCategory): void {
        this._category.textContent = category;
        this._category.className = `card__category card__category_${this.mapCategoryToClass(category)}`;
    }

    //Преобразуем название категории в класс
    private mapCategoryToClass(category: ProductCategory): string {
        const mapping = {
            'софт-скил': 'soft',
            'хард-скил': 'hard',
            'дополнительное': 'additional',
            'другое': 'other',
            'кнопка': 'button'
        };
        return mapping[category] || 'other';
    }

    render(): HTMLElement {
        return this._container;
    }
}