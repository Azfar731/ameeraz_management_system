


import * as integration from "./tests/factory";

declare module "vitest" {
  export interface TestContext {
    integration: typeof integration;
    request: Request;
  }
}