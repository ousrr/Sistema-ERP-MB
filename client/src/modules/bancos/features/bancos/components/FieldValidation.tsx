import type {
  ReglaValidacion
} from "../rules/ReglaValidacion";


type FieldValidationProps = {
  reglas: ReglaValidacion[];
};


export function FieldValidation({
  reglas
}: FieldValidationProps) {

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "6px",
        marginTop: "6px"
      }}
    >
      {reglas.map((regla) => {

        const valido = regla.cumple;

        return (
          <span
            key={regla.mensaje}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 8px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 600,

              background: valido
                ? "#E8F5E9"
                : "#FDECEC",

              color: valido
                ? "#1B5E20"
                : "#B71C1C",

              border: valido
                ? "1px solid #A5D6A7"
                : "1px solid #EF9A9A"
            }}
          >
            <span>
              {valido ? "✓" : "✕"}
            </span>

            {regla.mensaje}
          </span>
        );
      })}
    </div>
  );
}