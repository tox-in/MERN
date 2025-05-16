import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { BadRequestException } from "@/exceptions/http.exception";

export const validate = <T>(schema: ZodSchema<T>, type: 'body' | 'query' | 'params' = 'body') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            let data;

            switch (type) {
                case "body":
                    data = req.body;
                    break;
                case "query":
                    data = req.query;
                    break;
                case "params":
                    data = req.params;
                    break;
            }

            const validatedData = await schema.parseAsync(data);

            if (type === "body") {
                req.body = validatedData;
            } else if (type === "query") {
                (req as any).validatedQuery = validatedData;
            } else if (type === "params") {
                (req as any).validatedParams = validatedData;
            }

            next();
        } catch (error) {
            next(new BadRequestException("Validation error",error));
        }
    };
};