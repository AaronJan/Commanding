import { Sanitizer, SanitizeOptions } from '../interfaces';

export class IntegerSanitizer implements Sanitizer {
  constructor(protected options?: SanitizeOptions) { }

  sanitize(value: any) {
    return parseInt(value);
  }
}
