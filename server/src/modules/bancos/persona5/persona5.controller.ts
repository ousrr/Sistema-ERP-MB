import type { Request, Response } from "express";
import { HttpError } from "./persona5.types.js";

export function endpoint(action: (req: Request) => Promise<unknown>, status = 200) {
  return async (req: Request, res: Response) => {
    try {
      const data = await action(req);
      res.status(status).json({ ok: true, message: "Operacion completada.", data });
    } catch (error) {
      if (error instanceof HttpError) { res.status(error.status).json({ ok: false, message: error.message }); return; }
      const oracle = error as { errorNum?: number; code?: string; message?: string };
      const code = oracle.errorNum;
      const business = code && [20001, 20002, 20004].includes(code);
      const message = business ? (oracle.message ?? "").split("\n")[0]!.replace(/^ORA-[0-9]+:\s*/, "") :
        code === 1 ? "Ya existe un registro con esa clave." :
        code === 2291 || code === 2290 || code === 1400 || code === 1438 ? "Los datos no cumplen las restricciones de Oracle." :
        code === 54 || code === 30006 ? "Otro usuario esta guardando cambios. Intente nuevamente." :
        "No se pudo acceder a Oracle. Verifique la conexion y la instalacion de los packages.";
      const statusCode = code === 20004 ? 404 : code === 20002 || code === 1 || code === 54 || code === 30006 ? 409 :
        business || code === 2291 || code === 2290 || code === 1400 || code === 1438 ? 400 : 503;
      if (statusCode === 503) console.error("Persona5 database failure:", oracle.code ?? "UNKNOWN");
      res.status(statusCode).json({ ok: false, message });
    }
  };
}

