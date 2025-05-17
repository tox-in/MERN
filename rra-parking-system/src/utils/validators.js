const Joi = require('joi');

const userSchemas = {
    register: Joi.object({
        owner_name: Joi.string().min(3).max(30).required().messages({
            'string.min': 'Owner name must have at least 3 characters',
            'string.max': 'Owner name cannot exceed 50 characters',
            'any.required': 'Owner name is required'
        }),
        national_id: Joi.string().min(16).max(16).required().pattern(/^\d{16}$/).messages({
            'string.min': 'National ID must have at least 16 characters',
            'string.max': 'National ID cannot exceed 16 characters',
            'any.required': 'National ID is required',
            'string.pattern.base': 'National ID must be a 16-digit number'
        }),
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        phone: Joi.string().pattern(/^\d{10}$/).required().messages({
            'string.pattern.base': 'Phone number must be a 10-digit number',
            'any.required': 'Phone number is required'
        }),
        password: Joi.string().min(6).max(30).required().messages({
            'string.min': 'Password must have at least 8 characters',
            'any.required': 'Password is required'
        }),
        role: Joi.string().valid('DRIVER', 'GATESMAN', 'MANAGER').default('DRIVER'),
    }),

    //Login schema
    login: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        password: Joi.string().min(6).max(30).required().messages({
            'any.required': 'Password is required'
        }),
    }),

    //Update user schema
    update: Joi.object({
        owner_name: Joi.string().min(3).max(30).messages({
            'string.min': 'Owner name must have at least 3 characters',
            'string.max': 'Owner name cannot exceed 50 characters'
        }),
        email: Joi.string().email().messages({
            'string.email': 'Please provide a valid email address'
        }),
        phone: Joi.string().min(10).max(10).pattern(/^(079|078|072|073)\d{7}$/).required().messages({
            'string.min': 'Plate number must have at least 10 characters',
            'string.max': 'Plate number cannot exceed 10 characters',
            'string.pattern.base': 'Phone number must be in Rwanda format, e.g. 0790777777',
            'any.required': 'Plate number is required'
        }),
        password: Joi.string().min(6).max(30).messages({
            'string.min': 'Password must have at least 8 characters'
        }),
        role: Joi.string().valid('DRIVER', 'GATESMAN', 'MANAGER').messages({
            'any.only': 'Role must be either DRIVER, GATESMAN, or MANAGER'
        }),
    })
};


const vehicleSchemas = {
    create: Joi.object({
        isPublic: Joi.boolean().required().default(true).messages({
            'any.required': 'Public status is required'
        }),
        company: Joi.string().allow(null, ''),
        owner_name: Joi.string().min(3).max(30).required().messages({
            'string.min': 'Owner name must have at least 3 characters',
            'string.max': 'Owner name cannot exceed 50 characters',
            'any.required': 'Owner name is required'
        }),
        category: Joi.string().valid('SMALL', 'MINIBUS', 'BUS').required().messages({
            'any.only': 'Vehicle category must be either SMALL, MINIBUS, or BUS',
            'any.required': 'Vehicle category is required'
        }),
        plate_number: Joi.string().min(7).max(7).pattern(/^RA[A-Z]\d{3}[A-Z]$/).required().messages({
            'string.min': 'Plate number must have at least 3 characters',
            'string.max': 'Plate number cannot exceed 10 characters',

            'any.required': 'Plate number is required'
        }),
        isActive: Joi.boolean().required().default(true).messages({
            'any.required': 'Active status is required'
        }),
    }),

    update: Joi.object({
        isPublic: Joi.boolean().required().default(true).messages({
            'any.required': 'Public status is required'
        }),
        company: Joi.string().allow(null, ''),
        owner_name: Joi.string().min(3).max(30).messages({
            'string.min': 'Owner name must have at least 3 characters',
            'string.max': 'Owner name cannot exceed 50 characters'
        }),
        category: Joi.string().valid('SMALL', 'MINIBUS', 'BUS').messages({
            'any.only': 'Vehicle category must be either SMALL, MINIBUS, or BUS'
        }),
        isActive: Joi.boolean()
    }),

    //suspend/activate vehicle schema
    statusUpdate: Joi.object({
        isActive: Joi.boolean().required()
            .messages({
                'any.required': 'Active status is required'
            })
    })
}


//parking session validation schemas
const sessionSchemas = {
    entry: Joi.object({
        vehicleId: Joi.string().uuid().required()
            .messages({
                'string.guid': 'Vehicle ID must be a valid UUID',
                'any.required': 'Vehicle ID is required'
            }),
        plate_number: Joi.string().pattern(/^RA[A-Z]\d{3}[A-Z]$/)
            .messages({
                'string.pattern.base': 'Plate number must be in Rwanda format, e.g. RAB123A'
            })
    }),

    exit: Joi.object({
        exit_time: Joi.date().iso().default(() => new Date())
            .messages({
                'date.base': 'Exit time must be a valid date'
            })
    }),
}


module.exports = {
    userSchemas,
    vehicleSchemas,
    sessionSchemas
}
