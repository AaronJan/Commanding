import _ from 'lodash';

type Table<T> = Array<Array<any>>;
type TwoDimentionalArray<T> = Table<T>;

export function rotateArrayBy90<T>(arrays: TwoDimentionalArray<T>): TwoDimentionalArray<T> {
  return arrays.reduce((rotated, row, rowIndex) => {
    const newRotated = [...rotated];

    row.forEach((column, columnIndex) => {
      if (!_.has(newRotated, columnIndex)) {
        newRotated[columnIndex] = Array(arrays.length - 1);
      }

      const newColumnIndex = arrays.length - rowIndex - 1;
      newRotated[columnIndex][newColumnIndex] = column;
    });

    return newRotated;
  }, []);
}

export function alignColumns(
  table: Table<any>,
  padding: number,
  paddingChar = ' ',
  newLineChar = "\n"
) {
  const stringifiedTable = table.map(row => row.map(column => `${column}`));

  const columnMaxWidths = rotateArrayBy90(stringifiedTable)
    .map(row => _.max(row.map(column => stripColor(column).length)));

  const columnPaddingStr = paddingChar.repeat(padding);

  return stringifiedTable.map(row =>
    row.map((column, columnIndex) =>
      `${column}${paddingChar.repeat(<number>columnMaxWidths[columnIndex] - stripColor(column).length)}`
    )
  )
    .map(row => row.join(columnPaddingStr))
    .join(newLineChar);
}

export function marginLeft(
  content: string,
  margin: number,
  paddingChar = ' ',
  newLineChar = "\n"
) {
  return content.split(newLineChar)
    .map(line => `${paddingChar.repeat(margin)}${line}`)
    .join(newLineChar);
}

export function stripColor(str: string) {
  return str.split(/\u001b\[(?:\d*;){0,5}\d*m/g).join('');
}
