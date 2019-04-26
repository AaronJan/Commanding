import _ from 'lodash';

import { Sanitizer, SanitizeOptions } from '../interfaces';
import { SanitizationError } from '../errors/SanitizationError';

export class RegexpSanitizer implements Sanitizer {
  constructor(
    protected regexp: RegExp,
    protected options?: SanitizeOptions
  ) { }

  sanitize(value: any) {
    const stringified = `${value}`;
    const passed = this.regexp.test(stringified);
    const message = _.get(
      this.options,
      'failedMessage',
      `"${value}" is not valid, validation regexp is "${this.regexp}"`
    );

    if (passed) {
      return stringified;
    }

    throw new SanitizationError(message);
  }
}
