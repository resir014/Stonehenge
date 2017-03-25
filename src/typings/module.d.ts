interface IModulePayload {
  [name: string]: any;
}

interface IModuleResponse {
  status: number;
  data?: {
    [name: string]: any
  };
}
