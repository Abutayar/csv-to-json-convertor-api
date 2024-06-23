import { PostgresDatabase } from './lib/postgre-db';
import { StreamProcessor } from './lib/stream-processor';
import { DB_CONFIG } from './db_config';

import { loaderAnimation, logWithBorder, printAsTable } from './helper/utils';
import { CSVToJSONConvertor } from './lib/csv-to-json-convertor';

const CSV_FILE: string = process.env.CSV_FILE_PATH || '';
if (CSV_FILE) {
  const database = new PostgresDatabase(DB_CONFIG);
  try {
    processCsvFile(CSV_FILE, database);
  } catch (error) {
    console.error('APP ERROR', error);
  }
}

function dataTranformer(data: any) {
  const { name, age, address, ...additional_info } = data;
  return {
    name: `${name.firstName} ${name.lastName}`,
    age,
    address,
    additional_info,
  };
}

function processCsvFile(filePath: string, database: PostgresDatabase) {
  const closeLoader = loaderAnimation();
  const tableName = 'users';
  const csvTojsonConvertor = new CSVToJSONConvertor(filePath);

  const UPLOAD_BATCH_SIZE = parseInt(process.env.UPLOAD_BATCH_SIZE || '100');
  const streamProcessor = new StreamProcessor(database, tableName, dataTranformer, UPLOAD_BATCH_SIZE);

  streamProcessor.processStream(csvTojsonConvertor.toJSONStream(), async (error, count) => {
    closeLoader();

    logWithBorder('Total record inserted ' + count);

    if (error) {
      console.error('File Processing failed with\n', error);
      return;
    }

    const ageGroups = [
      { label: '< 20', condition: '< 20' },
      { label: '20 to 40', condition: 'BETWEEN 20 AND 40' },
      { label: '40 to 60', condition: 'BETWEEN 40 AND 60' },
      { label: '> 60', condition: '> 60' },
    ];

    const ageGroupDistribution = (await database.getPercentageDistribution(tableName, 'age', ageGroups)).map((record) => ({
      'Age-Group': record.label,
      '% Distribution': record.percentage,
    }));

    console.log('\nBelow is the Report');
    console.log('─'.repeat(30));

    printAsTable(ageGroupDistribution);

    await database.end();
  });
}
