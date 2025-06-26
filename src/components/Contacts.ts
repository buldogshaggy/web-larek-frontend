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
    private _email: string = '';
    private _phone: string = '';
    private _valid: boolean = false;

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
        this._elements.emailInput.addEventListener('input', () => {
            this._email = this._elements.emailInput.value;
            this._validateForm();
        });

        this._elements.phoneInput.addEventListener('input', () => {
            this._phone = this._elements.phoneInput.value;
            this._validateForm();
        });

        this._elements.form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this._valid) {
                this.events.emit('contacts:submit', {
                    email: this._email,
                    phone: this._phone
                });
            }
        });
    }

    private _validateForm(): boolean {
        const errors: string[] = [];
        
        // Проверка email
        if (!this._validateEmail(this._email)) {
            errors.push('Укажите корректный email');
        }
        
        // Проверка телефона (минимум 10 цифр)
        if (!this._validatePhone(this._phone)) {
            errors.push('Укажите корректный телефон (минимум 10 цифр)');
        }

        this._valid = errors.length === 0;
        this._elements.submitButton.disabled = !this._valid;
        
        this._elements.errors.innerHTML = errors.length > 0 
            ? errors.map(error => `<span class="form__error">${error}</span>`).join('<br>')
            : '';

        return this._valid;
    }

    private _validateEmail(email: string): boolean {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    private _validatePhone(phone: string): boolean {
        // Удаляем все нецифровые символы и проверяем длину
        const digits = phone.replace(/\D/g, '');
        return digits.length >= 10;
    }

    render(): HTMLElement {
        return this._container;
    }
}