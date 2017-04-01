interface Memory {
  uuid: number;
  log: any;
}

declare function require(path: string): any;

interface Global {
  log: any;
  printMemProfilerStats: any;
}

declare var global: Global;
