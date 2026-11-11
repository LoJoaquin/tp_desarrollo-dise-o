export type ApiFieldError = { campo: string; mensaje: string };

export class ApiError extends Error {
  readonly status: number;
  readonly method: string;
  readonly path: string;
  readonly fieldErrors: ApiFieldError[];

  constructor(input: {
    message: string;
    status: number;
    method: string;
    path: string;
    fieldErrors?: ApiFieldError[];
  }) {
    super(input.message);
    this.name = "ApiError";
    this.status = input.status;
    this.method = input.method;
    this.path = input.path;
    this.fieldErrors = input.fieldErrors ?? [];
  }
}

export class FeatureUnavailableError extends Error {
  readonly feature: string;

  constructor(feature: string, message: string) {
    super(message);
    this.name = "FeatureUnavailableError";
    this.feature = feature;
  }
}
