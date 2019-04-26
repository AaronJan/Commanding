import { ArgRequirement } from "../interfaces";

export class MissingArgument extends Error {
  constructor(requirement: ArgRequirement) {
    super(`Required argument "${requirement.name}" is missing.`);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
