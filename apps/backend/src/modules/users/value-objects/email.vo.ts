import { ValidationError } from '../../../common/exceptions/validation.exception';
export class Email {
  private readonly value: string;

  constructor(value: string) {
    const normalizedValue = value.trim().toLowerCase();

    if (!this.isValid(normalizedValue)) {
      throw new ValidationError('Invalid email format');
    }

    this.value = normalizedValue;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  private isValid(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(value);
  }
}
