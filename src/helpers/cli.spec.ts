import * as cli from './cli';
import chalk from 'chalk';

describe('rotateArrayBy90', () => {
  it('should rotate correctly', () => {
    const arrays = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];

    expect(cli.rotateArrayBy90(arrays)).toEqual([
      [7, 4, 1],
      [8, 5, 2],
      [9, 6, 3],
    ]);
  });

  it('should handle pyramid shape arrays', () => {
    const arrays = [
      [1, 2, 3],
      [4, 5],
      [7],
    ];

    expect(cli.rotateArrayBy90(arrays)).toEqual([
      [7, 4, 1],
      [undefined, 5, 2],
      [undefined, undefined, 3],
    ]);
  });

  it('should not pad uneven arrays', () => {
    const arrays = [
      [1],
      [4, 5, 6],
      [7],
    ];

    expect(cli.rotateArrayBy90(arrays)).toEqual([
      [7, 4, 1],
      [undefined, 5],
      [undefined, 6],
    ]);
  });
});

describe('alignColumns', () => {
  it('should align column', () => {
    const arrays = [
      ['Name', 'Nickname', 'Address'],
      ['John', 'Thunderbolt', '211th Street #41'],
      ['Amanda', 'The Basket Eater', 'Home'],
    ];
    const expectContent = [
      'Name    Nickname          Address         ',
      'John    Thunderbolt       211th Street #41',
      'Amanda  The Basket Eater  Home            ',
    ]
    .join("\n");

    expect(cli.alignColumns(arrays, 2)).toEqual(expectContent);
  });

  it('should strip color', () => {
    const arrays = [
      [chalk.red('Name'), 'Nickname', 'Address'],
      ['John', chalk.whiteBright('Thunderbolt'), '211th Street #41'],
      ['Amanda', 'The Basket Eater', chalk.yellow('Home')],
    ];
    const expectContent = [
      `${chalk.red('Name')}    Nickname          Address         `,
      `John    ${chalk.whiteBright('Thunderbolt')}       211th Street #41`,
      `Amanda  The Basket Eater  ${chalk.yellow('Home')}            `,
    ]
      .join("\n");

    expect(cli.alignColumns(arrays, 2)).toEqual(expectContent);
  });
});

describe('marginLeft', () => {
  it('should not change the original content when `margin` is `0`', () => {
    const content = [
      'Line 1',
      'Line 2',
      'Line 3',
    ].join("\n");

    expect(cli.marginLeft(content, 0)).toBe(content);
  });

  it('should add margin correctly', () => {
    const content = [
      'Line 1',
      'Line 2',
      'Line 3',
    ].join("\n");
    const expectContent = [
      '  Line 1',
      '  Line 2',
      '  Line 3',
    ].join("\n");

    expect(cli.marginLeft(content, 2)).toBe(expectContent);
  });

  it('should support custom chars', () => {
    const content = [
      'Line 1',
      'Line 2',
      'Line 3',
    ].join("\r\n");
    const expectContent = [
      '---Line 1',
      '---Line 2',
      '---Line 3',
    ].join("\r\n");

    expect(cli.marginLeft(content, 3, '-', "\r\n")).toBe(expectContent);
  });
});
