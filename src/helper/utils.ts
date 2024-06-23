import { Transform } from 'stream';
import { Console } from 'console';


export function printAsTable(input: unknown) {
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

export function logWithBorder(text: string) {
  const length = text.length + 4;
  const line = '─ '.repeat(length / 2);
  const spaceCount = (line.length - 1) - (text.length);
  console.log('┌' + line + '┐');

  console.log('│ ' + text + ' '.repeat(spaceCount)+'│');

  console.log('└' + line + '┘');
}

export function loaderAnimation() {
  const frames = ['-', '\\', '|', '/'];
  let i = 0;

  const id = setInterval(() => {
    process.stdout.write('\r' + frames[i]);
    i = (i + 1) % frames.length;
  }, 100);

  return () => {
    clearInterval(id)
  }
}
