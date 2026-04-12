import { celebrate, Joi, Segments } from 'celebrate';

export const validateRegisterBody = celebrate({
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
});

export const validateLoginBody = celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});

export const validateProductId = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    productId: Joi.string().hex().length(24).required(),
  }),
});

export const validateProductBody = celebrate({
  [Segments.BODY]: Joi.object().keys({
    title: Joi.string().min(2).max(30).required(),
    image: Joi.object({
      fileName: Joi.string().required(),
      originalName: Joi.string().required(),
    }).required(),
    category: Joi.string().required(),
    description: Joi.string().optional(),
    price: Joi.number().allow(null).optional(),
  }),
});

export const validateProductUpdateBody = celebrate({
  [Segments.BODY]: Joi.object().keys({
    title: Joi.string().min(2).max(30),
    image: Joi.object({
      fileName: Joi.string().required(),
      originalName: Joi.string().required(),
    }),
    category: Joi.string(),
    description: Joi.string().optional(),
    price: Joi.number().allow(null).optional(),
  }),
});

export const validateOrderBody = celebrate({
  [Segments.BODY]: Joi.object().keys({
    payment: Joi.string().valid('card', 'online').required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    total: Joi.number().required(),
    items: Joi.array()
      .items(Joi.string().hex().length(24))
      .min(1)
      .required(),
  }),
});
