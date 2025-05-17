const { ValidationError } = require('../utils/errorClasses');
const Joi = require('joi');

/**
 * Middleware to validate request data against a schema
 * @param {Joi.Schema} schema - The Joi schema to validate against
 * @param {string} source - The source of the data (body, params, query)
 */

const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[source], {
            abortEarly: false, //include all errors
            allowUnknown: true, //remove unknown fields
        });

        if (error) {
            const details = error.details.map((detail) => ({
                path: detail.path.join('.'),
                message: detail.message,
            }));

            return next(new ValidationError('Validation error', details));
        };

        //replace the request data with the validated data
        req[source] = value;
        return next();
    };

};

module.exports = validate;