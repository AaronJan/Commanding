

export class CommandNotFound extends Error {
  constructor(commandName: string) {
    super(`Command "${commandName}" not found.`);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
