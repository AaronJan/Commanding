import { SanitizeOptions } from "./interfaces";
import { BooleanSanitizer } from "./sanitizers/boolean";
import { IntegerSanitizer } from "./sanitizers/integer";
import { StringSanitizer } from "./sanitizers/string";
import { RegexpSanitizer } from "./sanitizers/regexp";

export class SanitizerMaker {

  integer(options?: SanitizeOptions) {
    return new IntegerSanitizer(options);
  }

  string(options?: SanitizeOptions) {
    return new StringSanitizer(options);
  }

  boolean(options?: SanitizeOptions) {
    return new BooleanSanitizer(options);
  }

  regexp(regexp: RegExp, options?: SanitizeOptions) {
    return new RegexpSanitizer(regexp, options);
  }
}
