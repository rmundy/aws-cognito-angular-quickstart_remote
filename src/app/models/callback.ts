export interface Callback {
  callback(): void;
  callbackWithParam(result: {}): void;
}
