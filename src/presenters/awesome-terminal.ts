import chalk from 'chalk';
import _ from 'lodash';

import {
  Presenter,
  Command,
  ArgRequirement,
  OptionRequirement,
} from '../interfaces';
import { alignColumns, marginLeft } from '../helpers/cli';

export class AwesomeTerminalPresenter implements Presenter {
  protected colorEnabled = true;

  static readonly TABLE_PADDING = 6;
  static readonly NEW_LINE_CHAR = "\n";

  constructor() { }

  protected write(content: string) {
    process.stdout.write(content);
  }

  protected writeWithLeftMargin(content: string, margin: number) {
    return this.write(marginLeft(content, margin));
  }

  setColor(enabled: boolean): void {
    this.colorEnabled = enabled;
  }

  protected colorizeIfEnabled(str: string, colorizer?: Function) {
    return this.colorEnabled ? (colorizer ? colorizer(str) : str) : str;
  }

  protected getExecutableRendering(executable: string): string {
    return executable;
  }

  protected getCommandNameRendering(name: string): string {
    return this.colorizeIfEnabled(`${name}`, chalk.yellow);
  }

  protected getRequiredArgNameRendering(name: string): string {
    return this.colorizeIfEnabled(`<${name}>`, chalk.blue);
  }

  protected getOptionalArgNameRendering(name: string): string {
    return this.colorizeIfEnabled(`[${name}]`, chalk.greenBright);
  }

  protected getArgNameRendering(argRequirement: ArgRequirement): string {
    return argRequirement.required ?
      this.getRequiredArgNameRendering(argRequirement.name) :
      this.getOptionalArgNameRendering(argRequirement.name);
  }

  protected getOptionNameRendering(requirement: OptionRequirement): string {
    const strs: string[] = [
      this.colorizeIfEnabled(requirement.sign, chalk.green)
    ];
    if (requirement.name) {
      strs.push(this.colorizeIfEnabled(`<${requirement.name}>`, chalk.blueBright));
    }

    return strs.join(' ');
  }

  protected getUsageArgRequirementsRendering(argRequirements: ArgRequirement[]): string {
    return argRequirements
      .map(requirement => this.getArgNameRendering(requirement))
      .join(' ');
  }

  protected getUsageExampleRendering(
    executable: string,
    argRequirements: ArgRequirement[],
    command?: Command
  ): string {
    const prefix = command ?
      `${this.getExecutableRendering(executable)} ${this.getCommandNameRendering(command.getName())}` :
      this.getExecutableRendering(executable);

    return `  ${prefix} ${this.getUsageArgRequirementsRendering(argRequirements)}`;
  }

  protected getUsageExampleWithCommandRendering(name: string): string {
    return `  ${name} ${this.getCommandNameRendering('<command>')}`;
  }

  protected getRequiredRendering(required: boolean): string {
    if (required === false) {
      return '';
    }

    return this.colorizeIfEnabled('required', chalk.italic);
  }

  protected getArgRequirementsRendering(requirements: ArgRequirement[]): string {
    const table = requirements.map(requirement => ([
      this.getArgNameRendering(requirement),
      this.colorizeIfEnabled(_.defaultTo(requirement.description, '')),
      this.getRequiredRendering(requirement.required),
    ]));

    return alignColumns(table, AwesomeTerminalPresenter.TABLE_PADDING);
  }

  protected getOptionRequirementsRendering(requirements: OptionRequirement[]): string {
    const table = requirements.map(requirement => ([
      this.getOptionNameRendering(requirement),
      this.colorizeIfEnabled(_.defaultTo(requirement.description, '')),
      this.getRequiredRendering(requirement.required),
    ]));

    return alignColumns(table, AwesomeTerminalPresenter.TABLE_PADDING);
  }

  protected getCommandRequirementsRendering(commands: Command[]): string {
    const table = commands.map(command => ([
      `${this.getCommandNameRendering(command.getName())} ${this.getUsageArgRequirementsRendering(command.getArgRequirements())}`,
      this.colorizeIfEnabled(_.defaultTo(command.getDescrption(), '')),
    ]));

    return alignColumns(table, AwesomeTerminalPresenter.TABLE_PADDING);
  }

  getSectionNameRendering(name: string): string {
    return this.colorizeIfEnabled(name, chalk.bold);
  }

  getApplicationNameRendering(name: string): string {
    return this.colorizeIfEnabled(name, chalk.cyan);
  }

  getApplicationVersionRendering(version: string): string {
    return this.colorizeIfEnabled(version);
  }

  protected getCommandArgumentsSectionRendering(command: Command): string {
    let lines: string[] = [];

    lines.push(this.getSectionNameRendering(`ARGUMENTS`));
    lines.push(``);
    lines.push(marginLeft(
      this.getArgRequirementsRendering(command.getArgRequirements()),
      2
    ));
    lines.push(``);

    return lines.join(AwesomeTerminalPresenter.NEW_LINE_CHAR);
  }

  protected getCommandOptionsSectionRendering(command: Command): string {
    let lines: string[] = [];

    lines.push(this.getSectionNameRendering(`OPTIONS`));
    lines.push(``);
    lines.push(marginLeft(
      this.getOptionRequirementsRendering(command.getOptionRequirements()),
      2
    ));
    lines.push(``);

    return lines.join(AwesomeTerminalPresenter.NEW_LINE_CHAR);
  }

  renderApplicationUsage(
    executable: string,
    commands: Command[],
    defaultCommand?: Command,
  ) {
    let lines = [''];

    lines.push(this.getSectionNameRendering(`USAGE`));
    lines.push(``);
    let usageShowed = false;
    if (defaultCommand) {
      lines.push(this.getUsageExampleRendering(executable, defaultCommand.getArgRequirements()));
      usageShowed = true;
    }
    if (commands.length > 0) {
      lines.push(this.getUsageExampleWithCommandRendering(executable));
      usageShowed = true;
    }
    if (usageShowed === false) {
      lines.push(this.getUsageExampleRendering(executable, []));
    }
    lines.push(``);

    if (defaultCommand) {
      // Arguments section.
      if (defaultCommand.getArgRequirements().length > 0) {
        lines.push(this.getCommandArgumentsSectionRendering(defaultCommand));
      }

      // Options section.
      if (defaultCommand.getOptionRequirements().length > 0) {
        lines.push(this.getCommandOptionsSectionRendering(defaultCommand));
      }
    }

    this.writeWithLeftMargin(lines.join(AwesomeTerminalPresenter.NEW_LINE_CHAR), 2);
  }

  renderApplicationInfo(
    executable: string,
    name?: string | undefined,
    description?: string | undefined,
    version?: string | undefined
  ) {
    let lines = [''];

    const mainName = name ? name : executable;
    lines.push(`${this.getApplicationNameRendering(mainName)} ${this.getApplicationVersionRendering(_.defaultTo(version, ''))} `);
    lines.push(``);

    if (description) {
      lines.push(`  ${this.colorizeIfEnabled(description, chalk.gray)}`);
      lines.push(``);
    }

    this.writeWithLeftMargin(lines.join(AwesomeTerminalPresenter.NEW_LINE_CHAR), 2);
  }

  renderCommandList(commands: Command[]) {
    let lines = [''];

    if (commands.length > 0) {
      lines.push(`COMMANDS`);
      lines.push(``);
      lines.push(marginLeft(
        this.getCommandRequirementsRendering(commands),
        2
      ));
      lines.push(``);
    }

    this.writeWithLeftMargin(lines.join(AwesomeTerminalPresenter.NEW_LINE_CHAR), 2);
  }

  renderCommandHelp(executable: string, command: Command) {
    let lines = [''];

    // Usage section.
    lines.push(this.getSectionNameRendering(`USAGE`));
    lines.push(``);
    lines.push(this.getUsageExampleRendering(executable, command.getArgRequirements(), command));
    lines.push(``);

    // Arguments section.
    if (command.getArgRequirements().length > 0) {
      lines.push(this.getCommandArgumentsSectionRendering(command));
    }

    // Options section.
    if (command.getOptionRequirements().length > 0) {
      lines.push(this.getCommandOptionsSectionRendering(command));
    }

    this.writeWithLeftMargin(lines.join(AwesomeTerminalPresenter.NEW_LINE_CHAR), 2);
  }

  renderGlobalOptions(globalOptionRequirements: OptionRequirement[]) {
    let lines = [''];

    lines.push(`GLOBAL OPTIONS`);
    lines.push(``);
    lines.push(marginLeft(
      this.getOptionRequirementsRendering(globalOptionRequirements),
      2
    ));
    lines.push(``);

    this.writeWithLeftMargin(lines.join(AwesomeTerminalPresenter.NEW_LINE_CHAR), 2);
  }

  renderVersion(version?: string) {
    this.write(
      this.getApplicationVersionRendering(_.defaultTo(version, ''))
    );
  }

  renderEnding() {
    this.write(AwesomeTerminalPresenter.NEW_LINE_CHAR);
  }

  renderError(message: string) {
    this.write(`${this.colorizeIfEnabled(message, chalk.redBright)}${AwesomeTerminalPresenter.NEW_LINE_CHAR}`);
  }

  renderSplit() {
    this.write(AwesomeTerminalPresenter.NEW_LINE_CHAR);
  }
} 
