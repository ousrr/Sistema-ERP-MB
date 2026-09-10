export type EntityGender =
  | "M"
  | "F";


export interface EntityFeedbackDescriptor {

  name: string;

  gender?:
    EntityGender;
}


export class EntityFeedbackMessageBuilder {

  constructor(
    private readonly descriptor:
      EntityFeedbackDescriptor
  ) {}


  creado(
    identifier: string
  ): string {

    return (
      `${this.entity(identifier)} ${this.participle("creado", "creada")} correctamente.`
    );
  }


  actualizado(
    identifier: string
  ): string {

    return (
      `${this.entity(identifier)} ${this.participle("actualizado", "actualizada")} correctamente.`
    );
  }


  estadoActualizado(
    identifier: string,
    estado: string
  ): string {

    return (
      `${this.entity(identifier)} ${this.participle("cambiado", "cambiada")} a estado ${estado} correctamente.`
    );
  }


  private entity(
    identifier: string
  ): string {

    const cleanIdentifier =
      identifier
        .trim();


    if (
      !cleanIdentifier
    ) {

      return this.descriptor
        .name;
    }


    return (
      `${this.descriptor.name} ${cleanIdentifier}`
    );
  }


  private participle(
    masculine: string,
    feminine: string
  ): string {

    return (
      this.descriptor.gender === "F"
        ? feminine
        : masculine
    );
  }
}


export class EntityFeedbackMessages {

  static para(
    descriptor:
      EntityFeedbackDescriptor
  ): EntityFeedbackMessageBuilder {

    return new EntityFeedbackMessageBuilder(
      descriptor
    );
  }
}
