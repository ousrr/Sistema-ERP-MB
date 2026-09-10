export type EstadoBanco = 'ACTIVO' | 'INACTIVO';


export interface CrearBancoData {
  codigoBanco: string;
  nombre: string;
  bicSwift: string | null;
  creadoPor: number;
}


export interface ActualizarBancoData {
  codigoBanco: string;
  nombre: string;
  bicSwift: string | null;
}


export class Banco {
  constructor(
    public bancoId: number,
    public codigoBanco: string,
    public nombre: string,
    public bicSwift: string | null,
    public estado: EstadoBanco,
    public creadoPor: number,
    public creadoEn: Date
  ) {}

  estaActivo(): boolean {
    return this.estado === 'ACTIVO';
  }
}