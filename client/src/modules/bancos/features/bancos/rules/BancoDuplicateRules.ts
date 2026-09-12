export interface BancoReferenciaCodigo {

  bancoId: number;

  codigoBanco: string;
}


export class BancoDuplicateRules {

  static validarCodigoDuplicado(
    codigoBanco: string,
    bancos:
      BancoReferenciaCodigo[],
    bancoIdExcluir?: number
  ): string | undefined {

    const codigoNormalizado =
      codigoBanco
        .trim()
        .toUpperCase();


    if (
      !codigoNormalizado
    ) {

      return undefined;
    }


    const duplicado =
      bancos.some(
        (
          banco
        ) => {

          if (
            bancoIdExcluir !== undefined &&
            banco.bancoId ===
              bancoIdExcluir
          ) {

            return false;
          }


          return (
            banco.codigoBanco
              .trim()
              .toUpperCase() ===
            codigoNormalizado
          );
        }
      );


    if (
      !duplicado
    ) {

      return undefined;
    }


    return (
      `Ya existe un banco con el código / sigla ${codigoNormalizado}.`
    );
  }
}