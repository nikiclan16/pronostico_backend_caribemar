import Joi from "joi";

export default {
  playPublic: Joi.object().keys({
    ucp: Joi.string().required(),
    fecha_inicio: Joi.string().required(),
    fecha_fin: Joi.string().required(),
    force_retrain: Joi.boolean().required(),
    modelo: Joi.boolean().required(),
    data: Joi.array().items(Joi.object()).required(),
  }),
  retrainModelPublic: Joi.object().keys({
    ucp: Joi.string().trim().required(),
    timeoutMs: Joi.number().integer().min(1000).optional().default(120000),
  }),
};
