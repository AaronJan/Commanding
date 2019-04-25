import _ from 'lodash';

import {
  Application as ApplicationInterface,
  Presenter,
  Command,
  ParsedOptions,
  MappedOptions,
  OptionRequirement,
  Logger,
  ParsedArgs,
} from './interfaces';
import { parseArgv, extractExecutableNameFromArgv, mapOptions } from './helpers/parser';
import { TerminalLogger } from './loggers/terminal';
import { LogLevel } from './loggers/constant';
import { TerminalPresenter } from './presenters/terminal';

const GLOBAL_OPTION_REQUIREMENTS: OptionRequirement[] = [
  {
    fullName: '-h, --help',
    shorthand: '-h',
    longhand: '--help',
    description: 'Display help',
    required: false,
    isRepeatable: false,
    isCsv: false,
  },
  {
    fullName: '-V, --version',
    shorthand: '-V',
    longhand: '--version',
    description: 'Display version',
    required: false,
    isRepeatable: false,
    isCsv: false,
  },
  {
    fullName: '--no-color',
    longhand: '--no-color',
    description: 'Disable colors',
    required: false,
    isRepeatable: false,
    isCsv: false,
  },
  {
    fullName: '--quiet',
    longhand: '--quiet',
    description: 'Quiet mode - only displays `warn` and `error` level messages',
    required: false,
    isRepeatable: false,
    isCsv: false,
  },
  {
    fullName: '-v, --verbose',
    longhand: '--verbose',
    description: 'Verbose mode - displays `debug` level messages',
    required: false,
    isRepeatable: false,
    isCsv: false,
  },
];

export class Application implements ApplicationInterface {
  protected commandMap: { [name: string]: Command };

  constructor(
    protected name: string | undefined,
    protected description: string | undefined,
    protected version: string | undefined,
    protected commands: Command[],
    protected defaultCommand?: Command
  ) {
    this.commandMap = _.keyBy(commands, command => command.getName());
  }

  protected hasCommand() {
    return this.commands.length !== 0 || this.defaultCommand !== undefined;
  }

  protected hasSubCommand(): boolean {
    return this.commands.length !== 0;
  }

  protected hasDefaultCommand(): boolean {
    return this.defaultCommand !== undefined;
  }

  protected matchCommand(name: string): Command | undefined {
    return this.commandMap[name];
  }

  protected getGlobalOptionRequirements(): OptionRequirement[] {
    return GLOBAL_OPTION_REQUIREMENTS;
  }

  protected makeDefaultPresenter(): Presenter {
    return new TerminalPresenter();
  }

  protected makeDefaultLogger(): Logger {
    return new TerminalLogger(LogLevel.INFO);
  }

  protected getGlobalOptions(parsedOptions: ParsedOptions): MappedOptions {
    return mapOptions(parsedOptions, this.getGlobalOptionRequirements());
  }

  execute(
    executable: string,
    parsedArgs: ParsedArgs,
    parsedOptions: ParsedOptions,
    presenter: Presenter,
    logger: Logger
  ) {
    const globalOptions = this.getGlobalOptions(parsedOptions);

    if (globalOptions['--verbose']) {
      logger.setLevel(LogLevel.DEBUG);
    }
    if (globalOptions['--quiet']) {
      logger.setLevel(LogLevel.WARN);
    }

    if (globalOptions['--no-color']) {
      presenter.setColor(false);
    }

    // Matching sub-command first.
    if (this.hasSubCommand() && parsedArgs.length > 0) {
      const commandName = <string>_.first(parsedArgs);
      const command = this.matchCommand(commandName);

      if (command !== undefined) {
        if (this.shouldShowHelp(parsedArgs.slice(1), globalOptions)) {
          return this.showCommandHelp(executable, command, presenter);
        }

        return command.execute(parsedArgs.slice(1), parsedOptions, presenter, logger);
      }
    }

    if (
      this.shouldShowHelp(parsedArgs, globalOptions) === false &&
      this.defaultCommand
    ) {
      return this.defaultCommand.execute(parsedArgs, parsedOptions, presenter, logger);
    }

    if (globalOptions['--version']) {
      return this.showVersion(presenter);
    }

    return this.showHelp(executable, presenter);
  }

  parse(argv: string[], customPresenter?: Presenter, customLogger?: Logger) {
    const presenter = customPresenter ? customPresenter : this.makeDefaultPresenter();
    const logger = customLogger ? customLogger : this.makeDefaultLogger();
    const executable = extractExecutableNameFromArgv(argv);

    try {
      const [parsedArgs, parsedOptions] = parseArgv(argv.slice(2));

      this.execute(
        executable,
        parsedArgs,
        parsedOptions,
        presenter,
        logger
      );
    } catch (err) {
      presenter.renderError(err instanceof Error ? err.message : `${err}`);

      return this.showHelp(executable, presenter);
    }
  }

  renderApplication(executable: string, presenter: Presenter): void {
    presenter.renderApplication(
      executable,
      this.commands,
      this.defaultCommand,
      this.name,
      this.description,
      this.version
    );
  }

  protected shouldShowHelp(parsedArgs: ParsedArgs, globalOptions: MappedOptions): boolean {
    if (parsedArgs.length > 0) {
      return false;
    }

    return globalOptions['--help'] == true;
  }

  showHelp(executable: string, presenter: Presenter): void {
    this.renderApplication(executable, presenter);

    presenter.renderCommandList(this.commands);

    presenter.renderGlobalOptions(this.getGlobalOptionRequirements());

    presenter.renderEnding();
  }

  showCommandHelp(executable: string, command: Command, presenter: Presenter): void {
    this.renderApplication(executable, presenter);

    command.showHelp(executable, presenter);
  }

  showVersion(presenter: Presenter): void {
    presenter.renderVersion(_.defaultTo(this.version, ''));
    presenter.renderEnding();
  }
}
