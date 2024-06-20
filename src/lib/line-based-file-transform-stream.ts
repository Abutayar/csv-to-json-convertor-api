import { Readable, ReadableOptions } from 'stream';
import { createReadStream } from 'fs';
import { Interface, createInterface } from 'readline';

type LineProcessor = (line: string, lineNo: number) => string | null;

export class LineBasedFileTransformationStream extends Readable {
  private fileStream!: Interface;
  private currentLineNo: number = 0;
  private processLineFunc: LineProcessor;

  constructor(filePath: string, processLineFunc: LineProcessor, options?: ReadableOptions) {
    super(options);
    this.processLineFunc = processLineFunc;
    this.initializeFileStream(filePath);
  }

  private initializeFileStream(filePath: string): void {
    const fileStream = createReadStream(filePath);
    this.fileStream = createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    this.fileStream.on('line', this.processLine.bind(this));
    this.fileStream.on('close', this.handleClose.bind(this));
    this.fileStream.on('error', this.handleError.bind(this));
  }

  private processLine(line: string): void {
    this.currentLineNo++;
    const result = this.processLineFunc(line, this.currentLineNo);
    if (result !== null) {
      if (!this.push(result + '\n')) {
        this.fileStream.pause();
      }
    }
  }

  private handleClose(): void {
    this.push(null);
  }

  private handleError(error: Error): void {
    this.destroy(error);
  }

  _read(): void {
    this.fileStream.resume();
  }
}
