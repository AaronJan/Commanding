import * as parser from './parser';
import { ParsedOptions, OptionRequirement, ParsedArgs, ArgRequirement } from '../interfaces';
import { MissingArgument } from '../errors/MissingArgument';
import { MissingOption } from '../errors/MissingOption';
import { InvalidInput } from '../errors/InvalidInput';

describe('isEndWithQuote', () => {
  it('should returns `true`', () => {
    expect(parser.isEndWithQuote('abc"')).toBeTruthy();
    expect(parser.isEndWithQuote('abc\'')).toBeTruthy();
  });

  it('should returns `false`', () => {
    expect(parser.isEndWithQuote('abc" ')).toBeFalsy();
    expect(parser.isEndWithQuote('abc"def')).toBeFalsy();
    expect(parser.isEndWithQuote('')).toBeFalsy();
  });
});


describe('parseOptionString', () => {
  it('shoud parse flag option correctly', () => {
    expect(parser.parseOptionStr('--flag')).toEqual(['--flag', true]);
  });

  it('should parse name and value correctly', () => {
    expect(parser.parseOptionStr('--key=value')).toEqual(['--key', 'value']);
  });

  it('should parse number as string', () => {
    expect(parser.parseOptionStr('-123 321')).toEqual(['-123', '321']);
  });
});

describe('parseArgv', () => {
  it('should parse argv correctly', () => {
    expect(parser.parseArgv([
      'command1',
      'command2',
      '-f',
      '--flag1',
      '--flag2',
      '--key1=value1',
      '-k value2',
      '--key3=value3',
      '--key3 value4',
      'command3',
      '--key-with-dash',
    ])).toEqual([
      [
        'command1',
        'command2',
        'command3',
      ],
      {
        '-f': [{ order: 0, value: true }],
        '--flag1': [{ order: 1, value: true }],
        '--flag2': [{ order: 2, value: true }],
        '--key1': [{ order: 3, value: 'value1' }],
        '-k': [{ order: 4, value: 'value2' }],
        '--key3': [{ order: 5, value: 'value3' }, { order: 6, value: 'value4' }],
        '--key-with-dash': [{order: 7, value: true}],
      },
    ]);
  });
});

describe('extractExecutableNameFromArgv', () => {
  it('should extract the name of executable', () => {
    expect(parser.extractExecutableNameFromArgv([
      'node',
      '/opt/scripts/test.js',
      'argument',
    ]))
      .toBe('test.js');

    expect(parser.extractExecutableNameFromArgv([
      'node',
      '/opt/scripts/subfolder/test',
      'argument',
    ]))
      .toBe('test');
  });
});

describe('mapOptions', () => {
  it('should map flag type options', () => {
    const parsedOptions: ParsedOptions = {
      '--enable-color': [
        { value: true, order: 0 },
      ],
    };
    const optionRequirements: OptionRequirement[] = [
      {
        fullName: '-e, --enable-color',
        shorthand: '-e',
        longhand: '--enable-color',
        required: true,
        isCsv: false,
        isRepeatable: false,
      },
    ];

    expect(parser.mapOptions(parsedOptions, optionRequirements)).toEqual({
      '-e': true,
      '--enable-color': true,
    });
  });

  it('should map CSV type options', () => {
    const parsedOptions: ParsedOptions = {
      '--names': [
        { value: 'Aaron,John,Elaine', order: 1 },
      ],
    };
    const optionRequirements: OptionRequirement[] = [
      {
        fullName: '--names',
        longhand: '--names',
        required: true,
        isCsv: true,
        isRepeatable: false,
      },
    ];

    expect(parser.mapOptions(parsedOptions, optionRequirements)).toEqual({
      '--names': [
        'Aaron',
        'John',
        'Elaine',
      ],
    });
  });

  it('should map repeatable options', () => {
    const parsedOptions: ParsedOptions = {
      '--names': [
        { value: 'Aaron', order: 0 },
        { value: 'John', order: 1 },
        { value: 'Elaine', order: 2 },
      ],
    };
    const optionRequirements: OptionRequirement[] = [
      {
        fullName: '-n, --names',
        shorthand: '-n',
        longhand: '--names',
        required: true,
        isCsv: false,
        isRepeatable: true,
      },
    ];

    expect(parser.mapOptions(parsedOptions, optionRequirements)).toEqual({
      '-n': [
        'Aaron',
        'John',
        'Elaine',
      ],
      '--names': [
        'Aaron',
        'John',
        'Elaine',
      ],
    });
  });

  it('should map repeatable CSV options', () => {
    const parsedOptions: ParsedOptions = {
      '--names': [
        { value: 'Aaron,John', order: 0 },
        { value: 'Elaine', order: 1 },
      ],
    };
    const optionRequirements: OptionRequirement[] = [
      {
        fullName: '-n, --names',
        shorthand: '-n',
        longhand: '--names',
        required: true,
        isCsv: true,
        isRepeatable: true,
      },
    ];

    expect(parser.mapOptions(parsedOptions, optionRequirements)).toEqual({
      '-n': [
        [
          'Aaron',
          'John',
        ],
        [
          'Elaine',
        ],
      ],
      '--names': [
        [
          'Aaron',
          'John',
        ],
        [
          'Elaine',
        ],
      ],
    });
  });

  it('should throw when missing required options', () => {
    const parsedOptions: ParsedOptions = {
      '--names': [
        { value: 'Aaron,John,Elaine', order: 1 },
      ],
    };
    const optionRequirements: OptionRequirement[] = [
      {
        fullName: '--colors',
        longhand: '--colors',
        required: true,
        isCsv: true,
        isRepeatable: false,
      },
    ];

    expect(() => parser.mapOptions(parsedOptions, optionRequirements)).toThrow(MissingOption);
  });
});

describe('mapArguments', () => {
  it('should map exact number of arguments', () => {
    const parsedArgs: ParsedArgs = [
      'Aaron',
      '1976-08-25',
    ];
    const argRequirements: ArgRequirement[] = [
      {
        name: 'name',
        required: true,
        position: 0,
      },
      {
        name: 'birthday',
        required: true,
        position: 1,
      },
    ];

    expect(parser.mapArguments(parsedArgs, argRequirements)).toEqual({
      name: 'Aaron',
      birthday: '1976-08-25',
    });
  });

  it('should map missing arguments as `undefined`', () => {
    const parsedArgs: ParsedArgs = [
      'Aaron',
    ];
    const argRequirements: ArgRequirement[] = [
      {
        name: 'name',
        required: true,
        position: 0,
      },
      {
        name: 'birthday',
        required: false,
        position: 1,
      },
    ];

    expect(parser.mapArguments(parsedArgs, argRequirements)).toEqual({
      name: 'Aaron',
      birthday: undefined,
    });
  });

  it('should throw when missing required arguments', () => {
    const parsedArgs: ParsedArgs = [
      'Aaron',
    ];
    const argRequirements: ArgRequirement[] = [
      {
        name: 'name',
        required: true,
        position: 0,
      },
      {
        name: 'birthday',
        required: true,
        position: 1,
      },
    ];

    expect(() => parser.mapArguments(parsedArgs, argRequirements)).toThrow(MissingArgument);
  });
});

describe('normalizeOptionNames', () => {
  it('should throw if `name` is an empty string', () => {
    expect(() => parser.normalizeOptionNames('')).toThrow(InvalidInput);
  });

  it('should throw if `name` is illegal', () => {
    expect(() => parser.normalizeOptionNames('namea, nameb')).toThrow(InvalidInput);
  });

  it('should throw if shorthand-name has more than one character', () => {
    expect(() => parser.normalizeOptionNames('-sc')).toThrow(InvalidInput);
  });

  it('should throw if have multiple shorthand-names', () => {
    expect(() => parser.normalizeOptionNames('-s, -c')).toThrow(InvalidInput);
  });

  it('should throw if have multiple longhand-names', () => {
    expect(() => parser.normalizeOptionNames('--test, --test')).toThrow(InvalidInput);
  });

  it('should normalize shorthand-name', () => {
    expect(parser.normalizeOptionNames('-s')).toEqual({
      fullName: '-s',
      shorthand: '-s',
    });
  });

  it('should normalize longhand-name', () => {
    expect(parser.normalizeOptionNames('--test')).toEqual({
      fullName: '--test',
      longhand: '--test',
    });
  });

  it('should normalize shorthand-name and longhand-name', () => {
    expect(parser.normalizeOptionNames('-s , --test')).toEqual({
      fullName: '-s, --test',
      shorthand: '-s',
      longhand: '--test',
    });
  });
});

