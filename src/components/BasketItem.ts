import { ensureElement } from '../utils/utils';
import { IProduct } from '../types';

export class BasketItem {
    protected _container: HTMLElement;
    protected _index: HTMLElement;
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _deleteButton: HTMLButtonElement;

    constructor(template: HTMLTemplateElement, protected item: IProduct, index: number) {
        this._container = template.content.firstElementChild.cloneNode(true) as HTMLElement;
        
        this._index = ensureElement<HTMLElement>('.basket__item-index', this._container);
        this._title = ensureElement<HTMLElement>('.card__title', this._container);
        this._price = ensureElement<HTMLElement>('.card__price', this._container);
        this._deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', this._container);

        this._index.textContent = (index + 1).toString();
        this._title.textContent = item.title;
        this._price.textContent = `${item.price?.toLocaleString('ru-RU') ?? 0} синапсов`;
        this._deleteButton.dataset.id = item.id;
    }

    get container(): HTMLElement {
        return this._container;
    }
}