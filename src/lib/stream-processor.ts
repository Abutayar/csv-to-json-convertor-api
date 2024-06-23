import { Readable, Writable } from 'stream';
import { IDatabase } from './postgre-db';
import { logWithBorder } from '../helper/utils';

interface IDataItem {
  [key: string]: string | number;
}

export type TransformFn = (data: any) => IDataItem | null;

export class StreamProcessor {
  private writableStream: Writable;
  private batch: IDataItem[] = [];
  private batchSize: number;
  private tableName: string;
  private transformFn: TransformFn;
  private db: IDatabase;
  private totalRecordInserted = 0;

  constructor(db: IDatabase, tableName: string, transformFn: TransformFn, batchSize: number = 100) {
    this.db = db;
    this.tableName = tableName;
    this.transformFn = transformFn;
    this.batchSize = batchSize;
    logWithBorder('Uploading data in batch size of ' + batchSize);

    this.writableStream = new Writable({
      objectMode: true,
      write: this.writeChunk.bind(this),
      final: this.finalizeBatch.bind(this),
    });
  }

  private async writeChunk(chunk: string, encoding: string, callback: (error?: Error | null) => void): Promise<void> {
    try {
      const transformedChunk = this.transformFn(chunk);
      if (transformedChunk == null) {
        callback();
        return;
      }
      this.batch.push(transformedChunk);

      if (this.batch.length >= this.batchSize) {
        await this.insertBatch();
      }

      callback();
    } catch (err) {
      console.error('Error transforming/inserting data:', err);
      if (err instanceof Error) callback(err);
      else callback(new Error('writeChunk: Error transforming/inserting data'));
    }
  }

  private async finalizeBatch(callback: (error?: Error | null) => void): Promise<void> {
    if (this.batch.length > 0) {
      try {
        await this.insertBatch();
        callback();
      } catch (err) {
        console.error('Error transforming/inserting data:', err);
        if (err instanceof Error) callback(err);
        else callback(new Error('finalizeBatch: Error transforming/inserting data'));
      }
    } else {
      callback();
    }
  }

  private async insertBatch(): Promise<void> {
    const batchValues = this.batch.map((item) => Object.values(item));
    const columns = Object.keys(this.batch[0]);

    await this.db.insert(this.tableName, columns, batchValues);
    this.totalRecordInserted += this.batch.length;
    this.batch = [];
  }

  public processStream(dataStream: Readable, callback: (error?: Error | null, record?: number) => void): void {
    dataStream.pipe(this.writableStream);

    this.writableStream.on('finish', async () => {
      console.log('Data stream processing completed successfully!\n');
      callback(null, this.totalRecordInserted);
      this.totalRecordInserted = 0;
    });

    this.writableStream.on('error', (err: Error) => {
      callback(err, this.totalRecordInserted);
      this.totalRecordInserted = 0;
    });

    dataStream.on('error', (err) => {
      this.writableStream.emit('error', err);
    });
  }
}
