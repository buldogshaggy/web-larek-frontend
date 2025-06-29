import { ensureElement } from "../utils/utils";

export class Page {
    protected _galleryContainer: HTMLElement;

    constructor() {
        this._galleryContainer = ensureElement<HTMLElement>('.gallery');
    }

    renderCatalog(items: HTMLElement[]) {
        this._galleryContainer.innerHTML = '';
        this._galleryContainer.append(...items);
    }
}