export type FeedbackTone =
  | "success"
  | "error"
  | "warning"
  | "info";


type FeedbackMessageProps = {

  message: string;

  tone?: FeedbackTone;

  onClose?:
    () => void;
};


type FeedbackVisual = {

  border: string;

  background: string;

  color: string;

  icon: string;
};


const VISUALS:
  Record<
    FeedbackTone,
    FeedbackVisual
  > = {

  success: {
    border:
      "#ABEFC6",
    background:
      "#ECFDF3",
    color:
      "#067647",
    icon:
      "✓"
  },

  error: {
    border:
      "#FECDCA",
    background:
      "#FEF3F2",
    color:
      "#B42318",
    icon:
      "!"
  },

  warning: {
    border:
      "#FEDF89",
    background:
      "#FFFAEB",
    color:
      "#B54708",
    icon:
      "!"
  },

  info: {
    border:
      "#B2DDFF",
    background:
      "#EFF8FF",
    color:
      "#175CD3",
    icon:
      "i"
  }
};


export function FeedbackMessage({
  message,
  tone = "success",
  onClose
}: FeedbackMessageProps) {

  const visual =
    VISUALS[
      tone
    ];


  return (

    <div
      role={
        tone === "error"
          ? "alert"
          : "status"
      }

      style={{
        display:
          "flex",

        alignItems:
          "center",

        justifyContent:
          "space-between",

        gap:
          "16px",

        marginBottom:
          "16px",

        padding:
          "12px 16px",

        border:
          `1px solid ${visual.border}`,

        borderRadius:
          "10px",

        background:
          visual.background,

        color:
          visual.color
      }}
    >

      <div
        style={{
          display:
            "flex",

          alignItems:
            "center",

          gap:
            "10px",

          fontSize:
            "14px",

          lineHeight:
            "1.4"
        }}
      >

        <span
          aria-hidden="true"

          style={{
            fontWeight:
              700
          }}
        >
          {visual.icon}
        </span>


        <span>
          {message}
        </span>

      </div>


      {onClose ? (

        <button
          type="button"

          aria-label=
            "Cerrar mensaje"

          title=
            "Cerrar"

          onClick={
            onClose
          }

          style={{
            border:
              "none",

            background:
              "transparent",

            color:
              "inherit",

            cursor:
              "pointer",

            fontSize:
              "18px",

            lineHeight:
              1
          }}
        >
          ×
        </button>

      ) : null}

    </div>
  );
}
