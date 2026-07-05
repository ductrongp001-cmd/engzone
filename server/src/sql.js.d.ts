declare module "sql.js" {
  interface QueryExecResult {
    columns: string[];
    values: any[][];
  }
  interface Database {
    run(sql: string, params?: any[]): Database;
    exec(sql: string, params?: any[]): QueryExecResult[];
    prepare(sql: string): Statement;
    export(): Uint8Array;
    close(): void;
  }
  interface Statement {
    bind(params?: any[]): boolean;
    step(): boolean;
    getAsObject(params?: object): any;
    free(): boolean;
    reset(): void;
  }
  interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer | null) => Database;
  }
  interface InitOptions {
    locateFile?: (file: string) => string;
  }
  export type { Database, SqlJsStatic, QueryExecResult, Statement };
  export default function initSqlJs(options?: InitOptions): Promise<SqlJsStatic>;
}
