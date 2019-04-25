jest.mock('./application');
jest.mock('./command');

import { Application } from './application';
import { Command } from './command';
import * as index from './index';

beforeEach(() => {
  (<any>Application).mockClear();
  (<any>Command).mockClear();
});

describe('gether', () => {
  it('should create an Application instance', () => {
    const name = 'myapp';
    const description = 'Awesome app that does nothing at all.';
    const version = '1.0.1';
    const commands: any[] = [];
    const defaultCommand = undefined;

    const app = index.gether(
      commands,
      defaultCommand,
      {
        name,
        version,
        description,
      }
    );

    expect(Application).toHaveBeenCalledTimes(1);
    expect(Application).toBeCalledWith(
      name,
      description,
      version,
      commands,
      defaultCommand
    );
    expect(app).toBeInstanceOf(Application);
  });
});

describe('solo', () => {
  it('should create an Application instance', () => {
    const name = 'myapp';
    const description = 'Awesome app that does nothing at all.';
    const version = '1.0.1';
    const defaultCommand: any = {};

    const app = index.solo(
      defaultCommand,
      {
        name,
        version,
        description,
      }
    );

    expect(Application).toHaveBeenCalledTimes(1);
    expect(Application).toBeCalledWith(
      name,
      description,
      version,
      [],
      defaultCommand
    );
    expect(app).toBeInstanceOf(Application);
  });
});

describe('command', () => {
  it('should create a Command with custom name', () => {
    const name = 'mycommand';
    const command = index.command(name);

    expect(Command).toHaveBeenCalledTimes(1);
    expect(Command).toBeCalledWith(name);
    expect(command).toBeInstanceOf(Command);
  });

  it('should create a Command with default name when name is not provided', () => {
    const command = index.command();

    expect(Command).toHaveBeenCalledTimes(1);
    expect(Command).toBeCalledWith('default');
    expect(command).toBeInstanceOf(Command);
  });
});
