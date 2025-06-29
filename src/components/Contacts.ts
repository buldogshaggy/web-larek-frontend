import { ensureElement } from '../utils/utils';
import { EventEmitter } from './base/events';

interface IContactsElements {
    form: HTMLFormElement;
    emailInput: HTMLInputElement;
    phoneInput: HTMLInputElement;
    submitButton: HTMLButtonElement;
    errors: HTMLElement;
}

export class Contacts {
    private _elements: IContactsElements;
    private _container: HTMLElement;
    private _isTouched = false;

    constructor(
        container: HTMLElement,
        protected events: EventEmitter
    ) {
        this._container = container;
        this._elements = {
            form: container as HTMLFormElement,
            emailInput: this._ensureElement<HTMLInputElement>('input[name="email"]'),
            phoneInput: this._ensureElement<HTMLInputElement>('input[name="phone"]'),
            submitButton: this._ensureElement<HTMLButtonElement>('button[type="submit"]'),
            errors: this._ensureElement<HTMLElement>('.form__errors')
        };

        this._initEvents();
    }

    private _ensureElement<T extends HTMLElement>(selector: string): T {
        const element = this._container.querySelector(selector);
        if (!element) {
            throw new Error(`Element ${selector} not found in contacts form`);
        }
        return element as T;
    }

    private _initEvents(): void {
        //Отправляем данные для валидации при изменении полей
        this._elements.emailInput.addEventListener('blur', () => {
            this._isTouched = true;
            this.events.emit('contacts:validation', {
                email: this._elements.emailInput.value,
                phone: this._elements.phoneInput.value
            });
        });

        this._elements.phoneInput.addEventListener('blur', () => {
            this._isTouched = true;
            this.events.emit('contacts:validation', {
                email: this._elements.emailInput.value,
                phone: this._elements.phoneInput.value
            });
        });

        this._elements.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this._isTouched = true;
            this.events.emit('contacts:submit', {
                email: this._elements.emailInput.value,
                phone: this._elements.phoneInput.value
            });
        });
    }

    //Устанавливаем ошибки валидации
    setErrors(errors: Record<string, string>): void {
        if (!this._isTouched) return;
        const errorMessages = Object.values(errors).filter(Boolean);
        this._elements.errors.innerHTML = errorMessages.length > 0 
            ? errorMessages.map(error => `<span class="form__error">${error}</span>`).join('<br>')
            : '';
    }

    //Устанавливаем состояние валидности формы
    setValid(state: boolean): void {
        this._elements.submitButton.disabled = !state;
    }

    render(): HTMLElement {
        return this._container;
    }

    get elements(): IContactsElements {
        return this._elements;
    }
}