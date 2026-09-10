export class ReglaValidacion {

  constructor(
    public readonly mensaje: string,
    public readonly cumple: boolean
  ) {}

  get estado(): "VALIDO" | "INVALIDO" {
    return this.cumple
      ? "VALIDO"
      : "INVALIDO";
  }
}