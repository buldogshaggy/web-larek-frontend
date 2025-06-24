// Contacts.ts
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
    private _email: string = '';
    private _phone: string = '';
    private _valid: boolean = false;

    constructor(
        protected container: HTMLElement,
        protected events: EventEmitter
    ) {
        if (!container) throw new Error('Contacts container is required');
        
        this._elements = {
            form: container as HTMLFormElement,
            emailInput: this._ensureElement<HTMLInputElement>('input[name="email"]'),
            phoneInput: this._ensureElement<HTMLInputElement>('input[name="phone"]'),
            submitButton: this._ensureElement<HTMLButtonElement>('button[type="submit"]'),
            errors: this._ensureElement<HTMLElement>('.form__errors')
        };

        this._initEvents();
        this._validateForm();
    }

    private _ensureElement<T extends HTMLElement>(selector: string): T {
        const element = this.container.querySelector(selector);
        if (!element) {
            console.error(`Element ${selector} not found. Container content:`, this.container.innerHTML);
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
            if (this._validateForm()) {
                this.events.emit('contacts:submit', {
                    email: this._email,
                    phone: this._phone
                });
            }
        });
    }

    private _validateForm(): boolean {
        const errors: string[] = [];
        
        if (!this._email.trim()) {
            errors.push('Укажите email');
        } else if (!this._validateEmail(this._email)) {
            errors.push('Укажите корректный email');
        }
        
        if (!this._phone.trim()) {
            errors.push('Укажите телефон');
        } else if (!this._validatePhone(this._phone)) {
            errors.push('Укажите корректный телефон');
        }

        this._valid = errors.length === 0;
        this._elements.submitButton.disabled = !this._valid;
        
        if (errors.length > 0) {
            this._elements.errors.innerHTML = errors.map(error => 
                `<span class="form__error">${error}</span>`
            ).join('<br>');
        } else {
            this._elements.errors.innerHTML = '';
        }

        return this._valid;
    }

    private _validateEmail(email: string): boolean {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    private _validatePhone(phone: string): boolean {
        const re = /^\+?[\d\s\-\(\)]+$/;
        return re.test(phone);
    }

    get email(): string {
        return this._email;
    }

    get phone(): string {
        return this._phone;
    }

    get valid(): boolean {
        return this._valid;
    }
}