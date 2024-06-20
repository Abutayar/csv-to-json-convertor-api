import { printAsTable } from './utils';

export interface IDistributionRange {
  greaterThan: number;
  lessThan: number;
  label: string;
}

export class DistributionRecorder {
  private ranges: IDistributionRange[];
  private records: Record<string, number> = {};
  private totalRecordCount = 0;

  constructor(ranges: IDistributionRange[]) {
    this.ranges = ranges;
    for (const range of ranges) {
      this.records[range.label] = 0;
    }
  }

  addRecord(value: number) {
    this.totalRecordCount++;
    this.updateRecord(value);
  }

  private updateRecord(value: number) {
    for (const range of this.ranges) {
      if (value < range.lessThan && value > range.greaterThan) {
        this.records[range.label]++;
        break;
      }
    }
  }

  printRecords(rangeKey = 'Range', distributionKey = 'Distribution (%)') {
    const recordsArray: Record<string, string | number>[] = [];
    for (const key in this.records) {
      const record = {
        [rangeKey]: key,
        [distributionKey]: Math.floor((this.records[key] / this.totalRecordCount) * 100),
      };
      recordsArray.push(record);
    }

    printAsTable(recordsArray);
  }
}
