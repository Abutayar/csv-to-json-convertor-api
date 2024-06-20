import { IDistributionRange } from '../lib/distribution-recorder';

export const AGE_GROUP_DISTRIBUTION_MAP: IDistributionRange[] = [
  {
    greaterThan: 0,
    lessThan: 20,
    label: '< 20',
  },
  {
    greaterThan: 19,
    lessThan: 41,
    label: '20 to 40',
  },
  {
    greaterThan: 39,
    lessThan: 61,
    label: '40 to 60',
  },
  {
    greaterThan: 60,
    lessThan: Infinity,
    label: '> 60',
  },
];
