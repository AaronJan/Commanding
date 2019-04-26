import { OptionRequirement } from "../interfaces";

export class MissingOption extends Error {
  constructor(protected requirement: OptionRequirement) {
    super(`Required options "${requirement.sign}" is missing.`);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
