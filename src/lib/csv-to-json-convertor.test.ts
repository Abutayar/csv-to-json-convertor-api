import { Readable } from 'stream';
import fs from 'fs';
import { CSVToJSONConvertor } from './csv-to-json-convertor';

jest.mock('fs');

describe('CSVToJSONConvertor', () => {
  it('should convert CSV to JSON stream', (done) => {
    const mockCsvData = 'name,age,address\nJohn Doe,25,123 Street\nJane Doe,35,456 Avenue';
    const mockFileStream = new Readable();
    mockFileStream.push(mockCsvData);
    mockFileStream.push(null);

    // Mock fs.createReadStream to return the mockFileStream
    (fs.createReadStream as jest.Mock).mockReturnValue(mockFileStream);

    const convertor = new CSVToJSONConvertor('test.csv');
    const jsonStream = convertor.toJSONStream();
    const result: any[] = [];

    jsonStream.on('data', (data) => {
      result.push(data);
    });

    jsonStream.on('end', () => {
      expect(result).toEqual([
        { name: 'John Doe', age: '25', address: '123 Street' },
        { name: 'Jane Doe', age: '35', address: '456 Avenue' },
      ]);
      done();
    });

    jsonStream.on('error', (error) => {
      done(error);
    });
  });
});
