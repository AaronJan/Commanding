import { Sanitizer, SanitizeOptions } from '../interfaces';

export class FakeSanitizer implements Sanitizer {
  constructor(protected options?: SanitizeOptions) { }

  sanitize(value: any) {
    return value;
  }
}
