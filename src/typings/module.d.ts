interface IModuleConfig {
  [name: string]: any;
}

interface IModulePayload {
  [name: string]: any;
}

interface IModuleResponse {
  status: ModuleStatus;
  [name: string]: any;
}

declare enum ModuleStatus {
  OK = 0,
  ERROR
}
