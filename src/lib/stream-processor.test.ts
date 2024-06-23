import { StreamProcessor, TransformFn } from './stream-processor';
import { Readable } from 'stream';
import { IDatabase } from './postgre-db';

const mockDb: IDatabase = {
  insert: jest.fn().mockResolvedValue(undefined),
  select: jest.fn(),
  getPercentageDistribution: jest.fn(),
  end: jest.fn(),
};

const mockTransformFn: TransformFn = jest.fn((data) => data);

describe('StreamProcessor', () => {
  let streamProcessor: StreamProcessor;

  beforeEach(() => {
    streamProcessor = new StreamProcessor(mockDb, 'test_table', mockTransformFn, 2);
  });

  it('should process stream data correctly', (done) => {
    const readable = Readable.from(['{"key": "value1"}', '{"key": "value2"}', '{"key": "value3"}']);

    streamProcessor.processStream(readable, (error, count) => {
      expect(error).toBeNull();
      expect(count).toBe(3);
      expect(mockDb.insert).toHaveBeenCalledTimes(2); // 2 batches: 2 + 1
      done();
    });
  });

  it('should handle stream errors', (done) => {
    const readable = new Readable({
      read() {
        this.emit('error', new Error('Test error'));
      },
    });

    streamProcessor.processStream(readable, (error) => {
      expect(error).toBeTruthy();
      done();
    });
  });
});
