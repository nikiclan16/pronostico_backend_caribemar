import { Router } from "express";
import validator from "../../../../middleware/validator.js";
import schema from "./access/schema.js";
import * as Pronosticos from "../../admin/dashboard/pronosticos/access/index.js";
const router = Router();

export default function () {
  router.post(
    "/playPublic",
    validator(schema.playPublic),
    Pronosticos.playPublic,
  );
  return router;
}
