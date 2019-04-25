import { Sanitizer } from '../interfaces';

export class FakeSanitizer implements Sanitizer {
  sanitize(value: any) {
    return value;
  }
}