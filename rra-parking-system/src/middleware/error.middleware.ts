import { Request, Response, NextFunction } from "express";
import { HttpException } from "@/exceptions/http.exception";
import { logger } from "@/utils/logger";
import {ZodError} from "zod";

const errorMiddleware = (
    error: HttpException | ZodError | Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (error instanceof ZodError) {
            logger.error(`[Validation Error] ${JSON.stringify(error.errors)}`);

            return res.status(400).json({
                success: false,
                error: {
                    message: "Validation error",
                    code: 400,
                    details: error.errors
                }
            });
        }

        if(error instanceof HttpException) {
            logger.error(`[${error.status}] ${error.message}${error.details ? ` - ${JSON.stringify(error.details)}` : ''}`);

            return res.status(error.status).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.status,
                    details: error.details
                }
            });
        }

        logger.error(`[500] ${error.message}`);

        return res.status(500).json({
            success: false,
            error: {
                message: "Internal server error",
                code: 500,
                details: error.message
            }
        });
    } catch (error) {
        logger.error(`[Error Middleware] ${error}`);

        return res.status(500).json({
            success: false,
            error: {
                message: "Internal server error",
                code: 500
            }
        });
    }
};

export default errorMiddleware;