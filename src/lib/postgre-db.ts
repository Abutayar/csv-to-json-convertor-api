import postgres, { Sql } from 'postgres';


export interface IDatabase {
  insert(tableName: string, columns: string[], values: unknown): Promise<void>;
  select(tableName: string, columns?: string[], conditions?: { [key: string]: any }): Promise<any[]>;
  getPercentageDistribution(tableName: string, columnName: string, groups: { label: string, condition: string }[]): Promise<{ label: string, percentage: number }[]>;
  end(): Promise<void>;
}

export class PostgresDatabase implements IDatabase {
  private sql: Sql;

  constructor(config: postgres.Options<NonNullable<unknown>>) {
    this.sql = postgres(config);
  }

  async insert(tableName: string, columns: string[], values: string[][]): Promise<void> {
    await this.sql.begin(async (sql) => {
      await sql`
        INSERT INTO ${sql(tableName)} (${sql(columns)})
        VALUES ${sql(values)}
      `;
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async select(tableName: string, columns: string[] = ['*'], conditions: { [key: string]: any } = {}): Promise<any[]> {
    return await this.sql.begin(async (sql) => {
      const query = sql`
        SELECT ${sql(columns)}
        FROM ${sql(tableName)}
        WHERE ${sql(conditions)}
      `;
      return await query;
    });
  }


  async getPercentageDistribution(tableName: string, columnName: string, groups: { label: string, condition: string }[]): Promise<{ label: string, percentage: number }[]> {
    const totalCountQuery = await this.sql`
      SELECT COUNT(*)::float as count FROM ${this.sql(tableName)}
    `;
    const totalCount = totalCountQuery[0].count;

    const results = await Promise.all(groups.map(async group => {
      const groupCountQuery = await this.sql`
        SELECT COUNT(*)::float as count FROM ${this.sql(tableName)}
        WHERE ${this.sql([columnName])} ${this.sql.unsafe(group.condition)}
      `;
      const groupCount = groupCountQuery[0].count;

      return {
        label: group.label,
        percentage: Math.floor((groupCount / totalCount) * 100),
      };
    }));

    return results;
  }


  async end(): Promise<void> {
    await this.sql.end();
  }
}
