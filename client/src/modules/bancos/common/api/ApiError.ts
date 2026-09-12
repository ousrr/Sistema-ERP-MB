export class ApiError extends Error {

  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number
  ) {

    super(
      message
    );


    this.name =
      "ApiError";


    Object.setPrototypeOf(
      this,
      new.target.prototype
    );
  }


  esCodigo(
    code: string
  ): boolean {

    return this.code === code;
  }


  esServicioNoDisponible():
    boolean {

    return (
      this.status === 0 ||
      this.status === 502 ||
      this.status === 503 ||
      this.status === 504
    );
  }
}
