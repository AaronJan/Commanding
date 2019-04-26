import { Sanitizer, SanitizeOptions } from '../interfaces';

export class BooleanSanitizer implements Sanitizer {
  constructor(protected options?: SanitizeOptions) { }

  sanitize(value: any) {
    return Boolean(value);
  }
}
