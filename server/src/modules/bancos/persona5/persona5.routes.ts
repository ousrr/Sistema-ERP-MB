import { Router } from "express";
import { ConfigService } from "./persona5.service.js";
import { endpoint } from "./persona5.controller.js";

export function configRouter(service: ConfigService) {
  const router = Router();
  router.get("/", endpoint(() => service.list()));
  router.get("/catalogos", endpoint(() => service.catalogs()));
  router.post("/resolver", endpoint(req => service.resolve(req.body)));
  router.get("/:id", endpoint(req => service.get(req.params.id)));
  router.post("/", endpoint(req => service.create(req.body), 201));
  router.put("/:id", endpoint(req => service.update(req.params.id, req.body)));
  router.patch("/:id/estado", endpoint(req => service.state(req.params.id, req.body)));
  router.delete("/:id", endpoint(req => service.deactivate(req.params.id))); // Logical only.
  return router;
}

