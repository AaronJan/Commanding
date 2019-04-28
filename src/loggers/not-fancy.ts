import chalk from 'chalk';

import { Logger } from '../interfaces';
import { LogLevel } from './constant';

export class NotFancyLogger implements Logger {
  constructor(
    protected level: LogLevel,
    protected colorEnabled = true,
    protected standardOutput: NodeJS.WriteStream = process.stdout,
    protected errorOutput: NodeJS.WriteStream = process.stderr,
  ) { }

  setLevel(level: LogLevel) {
    this.level = level;
  }

  setColor(enabled: boolean) {
    this.colorEnabled = enabled;
  }

  protected write(level: LogLevel, message: string, colorFunc: Function) {
    if (level < this.level) {
      return;
    }

    let target = level < LogLevel.ERROR ? this.standardOutput : this.errorOutput;
    const content = this.colorEnabled ? colorFunc(message) : message;
    target.write(content);
  }

  debug(message: string): void {
    this.write(LogLevel.DEBUG, message, chalk.bgCyan);
  }

  info(message: string): void {
    this.write(LogLevel.INFO, message, chalk.blue);
  }

  warn(message: string): void {
    this.write(LogLevel.WARN, message, chalk.bgYellow);
  }

  error(message: string): void {
    this.write(LogLevel.ERROR, message, chalk.bgRed);
  }
}
