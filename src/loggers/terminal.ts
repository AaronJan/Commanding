import chalk from 'chalk';

import { Logger } from '../interfaces';
import { LogLevel } from './constant';

export class TerminalLogger implements Logger {

  constructor(
    protected level: LogLevel,
    protected colorEnabled = true,
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

    let target = level < LogLevel.ERROR ? process.stdout : process.stderr;
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
