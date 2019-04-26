import _ from 'lodash';
import path from 'path';

import {
  ParsedArgs,
  ParsedOptions,
  MappedOptions,
  OptionRequirement,
  ParsedOptionContent,
  MappedOptionValue,
  ParsedOptionValue,
  Sanitizer,
  MappedArgs,
  ArgRequirement,
  MappedArgValue,
} from '../interfaces';
import { InvalidInput } from '../errors/InvalidInput';
import { MissingOption } from '../errors/MissingOption';
import { FakeSanitizer } from '../sanitizers/fake';
import { MissingArgument } from '../errors/MissingArgument';

const SINGLE_QUOTE = '\'';
const DOUBLE_QUOTE = '"';

export const isStartWithQuote = _.flow([
  _.overSome([
    str => _.endsWith(str, SINGLE_QUOTE),
    str => _.endsWith(str, DOUBLE_QUOTE),
  ]),
]);

export const isEndWithQuote = _.flow([
  _.overSome([
    str => _.endsWith(str, SINGLE_QUOTE),
    str => _.endsWith(str, DOUBLE_QUOTE),
  ]),
]);

export function parseOptionStr(option: string): [string, string | boolean] {
  const matched = /^(--?[^-= ][^= ]*?)(?:(?:=| )(.+)?)?$/i.exec(option);
  if (matched === null) {
    throw new InvalidInput(`Invalid options "${option}"`);
  }
  const [, name, value] = matched;

  return (value === undefined) ?
    [name, true] :
    [name, value];
}

export function parseArgv(argv: string[]): [ParsedArgs, ParsedOptions] {
  const [options, args] = _.partition(argv, (part) => _.startsWith(part, '-'));

  const parsedArgs = args.map(arg => arg.trim());
  const parsedOptions: ParsedOptions = options
    .map(option => option.trim())
    .reduce<ParsedOptions>((carry, option, index) => {
      const [name, value] = parseOptionStr(option);
      const previousContents = _.has(carry, name) ? [...carry[name]] : [];
      const currentContent: ParsedOptionContent = { value, order: index };
      return {
        ...carry,
        [name]: [...previousContents, currentContent],
      };
    }, {});

  return [parsedArgs, parsedOptions];
}

export function extractExecutableNameFromArgv(argv: string[]): string {
  return path.basename(argv[1]);
}

export function mergeParsedOptionContentValues(contents: ParsedOptionContent[]): ParsedOptionValue[] {
  return _.flatten(contents.map(content => content.value));
}

export function getLatestValueFromParsedOptionContents(contents: ParsedOptionContent[]): ParsedOptionValue | undefined {
  const latestContent = _.first(_.sortBy(contents, ['order'], 'desc'));

  return _.get(latestContent, 'value');
}

export function splitCsvStr(str: any): string[] {
  return `${str}`.split(',');
}

export function makeSplitAndSanitizeFunc(isCsv: boolean, optionSanitizer?: Sanitizer):
  (value: undefined | ParsedOptionValue | ParsedOptionValue[]) => undefined | MappedOptionValue | MappedOptionValue[] {
  const sanitizer = optionSanitizer ? optionSanitizer : new FakeSanitizer();

  const splitAndSanitize = (parsedOptionValue: ParsedOptionValue) => {
    if (isCsv) {
      return splitCsvStr(parsedOptionValue).map(value => sanitizer.sanitize(value));
    }

    return sanitizer.sanitize(parsedOptionValue);
  };

  return (parsedOptionValue: undefined | ParsedOptionValue | ParsedOptionValue[]) => {
    if (parsedOptionValue === undefined) {
      return parsedOptionValue;
    }

    return Array.isArray(parsedOptionValue) ?
      parsedOptionValue.map(splitAndSanitize) :
      splitAndSanitize(parsedOptionValue);
  };
}

export function mapArguments(parsedArgs: ParsedArgs, argRequirements: ArgRequirement[]): MappedArgs {
  return _.sortBy(argRequirements, 'position', 'asc')
    .map<[ArgRequirement, MappedArgValue]>(requirement => {
      let value: MappedArgValue = _.get(parsedArgs, requirement.position);

      if (value === undefined) {
        if (requirement.required) {
          throw new MissingArgument(requirement);
        }

        if (requirement.defaultValue) {
          value = requirement.defaultValue;
        }
      }

      if (requirement.sanitizer) {
        value = requirement.sanitizer.sanitize(value);
      }

      return [requirement, value];
    })
    .reduce<MappedArgs>((mapped, [requirement, value]) => {
      mapped[requirement.name] = value;

      return mapped;
    }, {});
}

export function mapOptions(parsedOptions: ParsedOptions, optionRequirements: OptionRequirement[]): MappedOptions {
  type Pair = [OptionRequirement, undefined | MappedOptionValue | MappedOptionValue[]];

  const mapped: MappedOptions = {};

  return optionRequirements
    .map<Pair>(requirement => {
      const mergedContents = _.merge(
        (requirement.shorthand ? _.get(parsedOptions, requirement.shorthand, []) : []),
        (requirement.longhand ? _.get(parsedOptions, requirement.longhand, []) : []),
      );

      let parsedOptionValue: ParsedOptionValue | ParsedOptionValue[] | undefined = requirement.repeatable ?
        mergeParsedOptionContentValues(mergedContents) :
        getLatestValueFromParsedOptionContents(mergedContents);

      if (parsedOptionValue === undefined) {
        if (requirement.required) {
          throw new MissingOption(requirement);
        }

        if (requirement.defaultValue) {
          parsedOptionValue = requirement.defaultValue;
        }
      }

      let mappedOptionValue = makeSplitAndSanitizeFunc(requirement.csv, requirement.sanitizer)(parsedOptionValue);

      return [
        requirement,
        mappedOptionValue,
      ];
    })
    // .filter((pair): pair is Pair => pair !== undefined)
    .reduce<MappedOptions>((mapped: MappedOptions, [requirement, value]:
      [OptionRequirement, MappedOptionValue | MappedOptionValue[]]) => {
      if (requirement.shorthand) {
        mapped[requirement.shorthand] = value;
      }
      if (requirement.longhand) {
        mapped[requirement.longhand] = value;
      }

      return mapped;
    }, {});
}

export function isShorthandOptionName(name: string): boolean {
  return /^-[^-]$/.test(name);
}

export function isLonghandOptionName(name: string): boolean {
  return /^--[^-]+$/.test(name);
}

export function normalizeOptionNames(inputFullName: string): ({
  fullName: string,
  shorthand?: string,
  longhand?: string,
}) {
  if (inputFullName.trim() === '') {
    throw new InvalidInput(`You should specify the option name.`);
  }

  const names = splitCsvStr(inputFullName.trim())
    .map(name => name.trim());

  if (names.length > 2) {
    throw new InvalidInput(`Option can only have most two names.`);
  }

  const normalized = names.reduce<{ shorthand: string | undefined, longhand: string | undefined }>((normalized, name) => {
    if (isShorthandOptionName(name)) {
      if (normalized.shorthand !== undefined) {
        throw new InvalidInput(`You can not assign more than one shorthand-name for a option.`);
      }
      normalized.shorthand = name;
    }
    if (isLonghandOptionName(name)) {
      if (normalized.longhand !== undefined) {
        throw new InvalidInput(`You can not assign more than one longhand-name for a option.`);
      }
      normalized.longhand = name;
    }

    return normalized;
  }, { shorthand: undefined, longhand: undefined });

  if (_.valuesIn(normalized).every(_.isUndefined)) {
    throw new InvalidInput(`Option name error: "${inputFullName}", should be "-o", "--option" or "-o, --option".`);
  }

  const fullName: string = [normalized.shorthand, normalized.longhand]
    .filter(name => name !== undefined).join(', ');

  return {
    fullName,
    shorthand: normalized.shorthand,
    longhand: normalized.longhand,
  };
}
