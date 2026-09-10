export class EvaluacionCampo {

  constructor(
    public readonly sospechoso: boolean,
    public readonly mensajes: string[] = []
  ) {}


  get tieneAdvertencias(): boolean {
    return (
      this.sospechoso &&
      this.mensajes.length > 0
    );
  }


  static correcto(): EvaluacionCampo {
    return new EvaluacionCampo(
      false,
      []
    );
  }


  static advertencia(
    ...mensajes: string[]
  ): EvaluacionCampo {

    return new EvaluacionCampo(
      true,
      mensajes
    );
  }
}