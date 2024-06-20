import { Transform } from 'stream';
import { Console } from 'console';

export function createFlatObject(header: string[], data: string[]) {
  return data.reduce((accumulator: any, currValue: any, currIndex) => {
    return { ...accumulator, ...{ [header[currIndex]]: currValue } };
  }, {});
}

export function convertToNestedObject(flatObject: Record<string, any>) {
  const nestedObject: any = {};

  for (const key in flatObject) {
    const keys = key.split('.');
    let current = nestedObject;

    keys.forEach((k, i) => {
      if (i === keys.length - 1) {
        current[k] = flatObject[key];
      } else {
        current[k] = current[k] || {};
        current = current[k];
      }
    });
  }

  return nestedObject;
}

export function printAsTable(input: any) {
  // Create a transform stream for stdout
  const transformStream = new Transform({
    transform(chunk, _, callback) {
      callback(null, chunk);
    },
  });

  // Create a logger instance that uses the transform stream for stdout
  const logger = new Console({ stdout: transformStream });

  logger.table(input);

  // Read the output from the transform stream and convert it to a string
  const tableOutput = (transformStream.read() || '').toString();

  // Initialize a variable to store the final formatted result
  let formattedOutput = '';

  // Process each row to remove index column for output table
  for (let row of tableOutput.split(/[\r\n]+/)) {
    row = row.replace(/[^┬]*┬/, '┌');
    row = row.replace(/^├─*┼/, '├');
    row = row.replace(/│[^│]*/, '');
    row = row.replace(/^└─*┴/, '└');

    // Removing single quote
    row = row.replace(/'/g, ' ');

    // Append the formatted row to the result
    formattedOutput += `${row}\n`;
  }
  console.log(formattedOutput);
}
