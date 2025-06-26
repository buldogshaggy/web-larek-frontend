import { ensureElement } from '../utils/utils';

export class Modal {
    protected _content: HTMLElement;
    protected _closeButton: HTMLButtonElement;

    constructor(protected container: HTMLElement) {
        this._content = ensureElement<HTMLElement>('.modal__content', container);
        this._closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);

        this._closeButton.addEventListener('click', this.close.bind(this));
        container.addEventListener('click', (e) => {
            if (e.target === container) this.close();
        });
    }

    set content(value: HTMLElement) {
        this._content.replaceChildren(value);
    }

    open(): void {
        document.body.style.overflow = 'hidden';
        this.container.classList.add('modal_active');
    }

    close(): void {
        document.body.style.overflow = '';
        this.container.classList.remove('modal_active');
    }
}