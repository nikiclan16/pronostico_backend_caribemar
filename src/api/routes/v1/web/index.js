import { Router } from "express";
import parametrosRoutes from "./parametros/index.js";
import pronosticosRoutes from "./pronosticos/index.js";

const router = Router();

export default function () {
  router.use("/parametros/", parametrosRoutes());
  router.use("/pronosticos/", pronosticosRoutes());
  return router;
}
