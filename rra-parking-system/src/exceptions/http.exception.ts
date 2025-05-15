export class HttpException extends Error {
    public status: number;
    public message: string;
    public details?: any;

    constructor(status: number, message: string, details?: any) {
        super(message);
        this.status = status;
        this.message = message;
        this.details = details;
    }
}

export class BadRequestException extends HttpException {
    constructor(message: string = 'Bad request', details?: any) {
        super(400, message, details);
    }
}

export class UnauthorizedException extends HttpException {
    constructor(message: string = 'Unauthorized', details?: any) {
        super(401, message, details);
    }
}

export class ForbiddenException extends HttpException {
    constructor(message: string = 'Forbidden', details?: any) {
        super(403, message, details);
    }
}

export class NotFoundException extends HttpException {
    constructor(message: string = 'Not found', details?: any) {
        super(404, message, details);
    }
}

export class ConflictException extends HttpException {
    constructor(message: string = 'Conflict', details?: any) {
        super(409, message, details);
    }
}

export class InternalServerErrorException extends HttpException {
    constructor(message: string = 'Internal server error', details?: any) {
        super(500, message, details);
    }
}