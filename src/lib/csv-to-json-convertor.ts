import { createReadStream, ReadStream } from 'fs';
import { Transform } from 'stream';
import { createInterface } from 'readline';

export interface CSVToJSONOptions {
  delimiter?: string; // Custom delimiter for CSV parsing
}

export class CSVToJSONConvertor {
  private filePath: string;
  private headers: string[] = [];
  private options: CSVToJSONOptions;

  constructor(filePath: string, options: CSVToJSONOptions = {}) {
    this.filePath = filePath;
    this.options = options;
  }

  public toJSONStream(): Transform {
    const transformStream = new Transform({
      objectMode: true,
      transform: this.transformLine.bind(this),
    });

    let fileStream: ReadStream;
    try {
      fileStream = createReadStream(this.filePath, { encoding: 'utf8' });
    } catch (error: any) {
      throw new Error(`Failed to create read stream: ${error.message}`);
    }

    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      transformStream.write(line);
    });

    rl.on('close', () => {
      transformStream.end();
    });

    rl.on('error', (error) => {
      transformStream.emit('error', error);
    });

    return transformStream;
  }

  private transformLine(chunk: Buffer, _: string, callback: (...args: any[]) => void): void {
    const line: string = chunk.toString().trim();
    const columns = line.split(this.options.delimiter || ',');

    if (this.headers.length === 0) {
      this.headers = columns;
      callback(); // Skip emitting headers as data
    } else {
      const jsonObject = this.createNestedJSON(this.headers, columns);
      callback(null, jsonObject);
    }
  }

  private createNestedJSON(headers: string[], data: string[]): Record<string, string> {
    return headers.reduce((nestedObject: Record<string, string>, header, index) => {
      const keys = header.split('.');
      let current: any = nestedObject;

      keys.forEach((key, i) => {
        if (i === keys.length - 1) {
          current[key] = data[index];
        } else {
          current[key] = current[key] || {};
          current = current[key];
        }
      });

      return nestedObject;
    }, {});
  }
}
