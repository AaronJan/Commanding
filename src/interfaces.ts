import { LogLevel } from "./loggers/constant";

export type InputArgv = string[];

export type ParsedArgs = string[];

export type ParsedOptionValue = string | boolean | number;

export interface ParsedOptionContent {
  value: ParsedOptionValue,
  order: number,
}

export interface ParsedOptions {
  [name: string]: ParsedOptionContent[],
}

export type MappedArgValue = (string | boolean | number | undefined);

export interface MappedArgs {
  [name: string]: MappedArgValue;
}

export type MappedOptionValue = string | boolean | number | undefined;

export interface MappedOptions {
  [name: string]: MappedOptionValue | MappedOptionValue[];
}

export interface ArgRequirement {
  name: string,
  description?: string;
  defaultValue?: MappedOptionValue;
  required: boolean,
  position: number,
  sanitizer?: Sanitizer,
}

export interface OptionRequirement {
  fullName: string,
  shorthand?: string;
  longhand?: string;
  description?: string;
  defaultValue?: MappedOptionValue;
  required: boolean,
  isCsv: boolean,
  isRepeatable: boolean,
  sanitizer?: Sanitizer,
}

export interface Sanitizer {
  sanitize<T, R>(value: T): R;
}

export interface ApplicationInfo {
  name?: string,
  description?: string,
  version?: string,
}

export interface Presenter {

  setColor(enable: boolean): void;

  renderApplicationInfo(
    executable: string,
    name?: string,
    description?: string,
    version?: string
  ): void;

  renderApplicationUsage(
    executable: string,
    commands: Command[],
    defaultCommand?: Command,
  ): void;

  renderCommandList(commands: Command[]): void;

  renderCommandHelp(executable: string, command: Command): void;

  renderGlobalOptions(optionRequirements: OptionRequirement[]): void;

  renderEnding(): void;

  renderVersion(version: string): void;

  renderError(message: string): void;

  renderSplit(): void;
}

export interface Logger {

  setLevel(level: LogLevel): void;

  debug(message: string): void;

  info(message: string): void;

  warn(message: string): void;

  error(message: string): void;
}

export interface Application {

  parse(args: InputArgv, presenter: Presenter): void;

  execute(
    executable: string,
    parsedArgs: ParsedArgs,
    parsedOptions: ParsedOptions,
    presenter: Presenter,
    logger: Logger
  ): void;

  showHelp(executable: string, presenter: Presenter): void;

  showCommandHelp(executable: string, command: Command, presenter: Presenter): void;

  showVersion(presenter: Presenter): void;
}

export interface ArgDetails {
  required?: boolean,
  description?: string,
  defaultValue?: MappedArgValue,
  sanitizer?: Sanitizer,
}

export interface OptionDetails {
  required?: boolean,
  description?: string,
  defaultValue?: MappedOptionValue,
  repeatable?: boolean,
  csv?: boolean,
  sanitizer?: Sanitizer,
}

export interface CommandHandler {
  (args: MappedArgs, options: MappedOptions, logger: Logger): void;
}

export interface Command {

  argument<T>(name: string, details?: ArgDetails): Command;

  option(fullName: string, details?: OptionDetails): Command;

  handle(handler: CommandHandler): Command;

  match(name: string): boolean;

  getName(): string;

  getDescrption(): string | undefined;

  getArgRequirements(): ArgRequirement[];

  getOptionRequirements(): OptionRequirement[];

  execute(args: ParsedArgs, options: ParsedOptions, presenter: Presenter, logger: Logger): void;

  showHelp(executable: string, presenter: Presenter): void;
}
