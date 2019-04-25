import _ from 'lodash';

import {
  Command as CommandInterface,
  ApplicationInfo,
} from './interfaces';
import { Application } from './application';
import { Command } from './command';

export function gether(
  commands: CommandInterface[],
  defaultCommand?: CommandInterface,
  applicationInfo?: ApplicationInfo,
) {
  return new Application(
    _.get(applicationInfo, 'name'),
    _.get(applicationInfo, 'description'),
    _.get(applicationInfo, 'version'),
    commands,
    defaultCommand
  );
}

export function solo(
  defaultCommand?: CommandInterface,
  applicationInfo?: ApplicationInfo,
) {
  return new Application(
    _.get(applicationInfo, 'name'),
    _.get(applicationInfo, 'description'),
    _.get(applicationInfo, 'version'),
    [],
    defaultCommand
  );
}

export function command(name?: string) {
  return new Command(name ? name : 'default');
}
