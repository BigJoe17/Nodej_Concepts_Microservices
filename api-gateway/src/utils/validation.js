const joi = require('joi');

const validateRegistration = (data) => {
    const schema = joi.object({
        username: joi.string().min(3).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).required(),
        role: joi.string().required()
    });
    return schema.validate(data);
}

module.export  = { validateRegistration };