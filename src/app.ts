import path from 'path';

import { LineBasedFileTransformationStream } from './lib/line-based-file-transform-stream';
import { DistributionRecorder } from './lib/distribution-recorder';
import { convertToNestedObject, createFlatObject } from './lib/utils';
import { AGE_GROUP_DISTRIBUTION_MAP } from './data/age-distribution';

const header: string[] = [];

function csvLineProcessor(line: string, lineNo: number) {
  if (lineNo === 1) {
    header.push(...line.split(','));
    return null; // Return null for the header line
  }
  const flatObj = createFlatObject(header, line.split(','));
  const finalObj = convertToNestedObject(flatObj);
  return JSON.stringify(finalObj);
}

const CSV_FILE: string = process.env.CSV_FILE_PATH || '';
if (CSV_FILE) {
  const filePath = path.join(__dirname, '../', CSV_FILE);
  const csvToJsonStream = new LineBasedFileTransformationStream(filePath, csvLineProcessor);
  const distributionRecorder = new DistributionRecorder(AGE_GROUP_DISTRIBUTION_MAP);

  csvToJsonStream.on('data', (chunk: Buffer) => {
    const json = JSON.parse(chunk.toString());
    distributionRecorder.addRecord(json.age);
  });

  csvToJsonStream.on('end', () => {
    distributionRecorder.printRecords('Age-Group', ' % Distribution');
  });
}
