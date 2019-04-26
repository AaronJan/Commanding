import _ from 'lodash';

import {
  Command as CommandInterface,
  ArgDetails,
  OptionDetails,
  CommandHandler,
  ParsedOptions,
  Presenter,
  Logger,
  ArgRequirement,
  OptionRequirement,
} from './interfaces';
import { normalizeOptionNames, mapArguments, mapOptions } from './helpers/parser';
import { CommandHasNoHandler } from './errors/CommandHasNoHandler';

export class Command implements CommandInterface {
  protected argRequirements: ArgRequirement[] = [];
  protected optionRequirements: OptionRequirement[] = [];
  protected handler?: CommandHandler;
  protected commandDescription?: string;

  protected currentArgPosition = 0;

  constructor(
    protected commandName: string
  ) {

  }

  getDescrption() {
    return this.commandDescription;
  }

  description(description: string) {
    this.commandDescription = description;
    
    return this;
  }

  getArgRequirements() {
    return this.argRequirements;
  }

  getOptionRequirements() {
    return this.optionRequirements;
  }

  argument(name: string, inputDetails?: ArgDetails): CommandInterface {
    const details = inputDetails ? inputDetails : {};

    const requirement: ArgRequirement = {
      name,
      position: this.currentArgPosition,
      required: _.defaultTo(details.required, false),
      description: _.defaultTo(details.description, undefined),
      defaultValue: _.defaultTo(details.default, undefined),
      sanitizer: _.defaultTo(details.sanitizer, undefined),
    };
    this.argRequirements.push(requirement);

    this.currentArgPosition++;

    return this;
  }

  option(fullName: string, inputDetails?: OptionDetails): CommandInterface {
    const details = inputDetails ? inputDetails : {};
    const normalizedNames = normalizeOptionNames(fullName);

    const requirement: OptionRequirement = {
      sign: normalizedNames.fullName,
      shorthand: normalizedNames.shorthand,
      longhand: normalizedNames.longhand,
      name: _.get(details, 'name'),
      csv: _.defaultTo(details.csv, false),
      repeatable: _.defaultTo(details.repeatable, false),
      required: _.defaultTo(details.required, false),
      description: _.defaultTo(details.description, undefined),
      defaultValue: _.defaultTo(details.default, undefined),
      sanitizer: _.defaultTo(details.sanitizer, undefined),
    };
    this.optionRequirements.push(requirement);

    return this;
  }

  handle(handler: CommandHandler): CommandInterface {
    this.handler = handler;

    return this;
  }

  match(name: string): boolean {
    return this.commandName === name;
  }

  getName(): string {
    return this.commandName;
  }

  execute(parsedArgs: string[], parsedOptions: ParsedOptions, presenter: Presenter, logger: Logger): void {
    const mappedArgs = mapArguments(parsedArgs, this.argRequirements);
    const mappedOptions = mapOptions(parsedOptions, this.optionRequirements);

    if (this.handler === undefined) {
      throw new CommandHasNoHandler(this);
    }

    this.handler(mappedArgs, mappedOptions, logger);
  }

  showHelp(executable: string, presenter: Presenter): void {
    presenter.renderCommandHelp(executable, this);
  }
}
