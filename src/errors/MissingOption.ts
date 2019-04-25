import { OptionRequirement } from "../interfaces";

export class MissingOption extends Error {
  constructor(protected requirement: OptionRequirement) {
    super(`Required options "${requirement.fullName}" is missing.`);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
