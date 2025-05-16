import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  UnauthorizedException,
  ForbiddenException,
} from "@/exceptions/http.exception";
import { prisma } from "../app";
import { Role } from "@prisma/client";

export interface TokenPayload {
  id: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("No token provided");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new UnauthorizedException("Invalid authentication token");
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT secret is not defined");
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as TokenPayload;
      req.user = decoded;
      next();
    } catch (err) {
      throw new UnauthorizedException("Invalid token");
    }
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new UnauthorizedException("User not authenticated"));
      }

      const userRole = req.user.role;

      if (!roles.includes(userRole)) {
        return next(
          new ForbiddenException(
            "You do not have permission to access this resource"
          )
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};


export const isOwnerOrAuthorized = (resourceType: 'user' | 'car' | 'session' | 'report') => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          return next(new UnauthorizedException('User is not authenticated'));
        }
        
        // Managers always have access
        if (req.user.role === Role.MANAGER) {
          return next();
        }
        
        const resourceId = req.params.id;
        
        if (!resourceId) {
          return next(new ForbiddenException('Resource ID is required'));
        }
        
        let isOwner = false;
        
        switch (resourceType) {
          case 'user':
            isOwner = req.user.id === resourceId;
            break;
            
          case 'car':
            const car = await prisma.car.findUnique({
              where: { id: resourceId },
              select: { ownerId: true }
            });
            
            isOwner = car?.ownerId === req.user.id;
            break;
            
          case 'session':
            const session = await prisma.parkingSession.findUnique({
              where: { id: resourceId },
              include: { car: true }
            });
            
            isOwner = session?.car.ownerId === req.user.id;
            break;
            
          case 'report':
            const report = await prisma.report.findUnique({
              where: { id: resourceId },
              include: { car: true }
            });
            
            isOwner = report?.car.ownerId === req.user.id;
            break;
        }
        
        if (!isOwner && req.user.role === Role.DRIVER) {
          return next(
            new ForbiddenException('You do not have permission to access this resource')
          );
        }
        
        next();
      } catch (error) {
        next(error);
      }
    };
  };