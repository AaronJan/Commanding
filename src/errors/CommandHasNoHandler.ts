import { Command } from "../interfaces";


export class CommandHasNoHandler extends Error {
  constructor(command: Command) {
    super(`You should specify a handler for command "${command.getName()}".`);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
