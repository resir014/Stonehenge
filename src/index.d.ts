interface Memory {
  uuid: number;
  log: any;
}

declare function require(path: string): any;

interface Global {
  scsh: any;
  log: any;
}

declare var global: Global;
