import { Sanitizer, SanitizeOptions } from '../interfaces';

export class StringSanitizer implements Sanitizer {
  constructor(protected options?: SanitizeOptions) { }

  sanitize(value: any) {
    return `${value}`;
  }
}
