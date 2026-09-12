import {
  Button
} from "../../../../shared/ui/Button";


type LoadErrorProps = {

  message: string;

  cargando?: boolean;

  onRetry:
    () => void;
};


export function LoadError({
  message,
  cargando = false,
  onRetry
}: LoadErrorProps) {

  return (

    <div
      role="alert"

      style={{
        display:
          "flex",

        flexDirection:
          "column",

        alignItems:
          "center",

        justifyContent:
          "center",

        gap:
          "12px",

        padding:
          "32px 20px",

        textAlign:
          "center"
      }}
    >

      <div
        style={{
          fontSize:
            "14px",

          color:
            "#B42318",

          lineHeight:
            "1.5"
        }}
      >
        {message}
      </div>


      <Button
        type="button"

        variant="outline"

        disabled={
          cargando
        }

        onClick={
          onRetry
        }
      >
        {cargando
          ? "Reintentando..."
          : "Reintentar"}
      </Button>

    </div>
  );
}
