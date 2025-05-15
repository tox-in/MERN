import express, {Application, Request, Response} from 'express';
import helmet from 'helmet';
import cors from 'cors';
import {PrismaClient} from '@prisma/client';
import errorMiddleware from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import vehicleRoutes from './routes/vehicle.routes';
import sessionRoutes from './routes/session.routes';
import reportRoutes from './routes/report.routes';

export const prisma = new PrismaClient();

class App {
    public app: Application;

    constructor() {
        this.app = express();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    private initializeMiddlewares() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: true}));
        this.app.use(helmet());
        this.app.use(cors());
    }

    private initializeRoutes() {
        this.app.get('/', (req: Request, res: Response) => {
            res.json({
              message: 'RRA Parking Management System API'
            });
          });
        this.app.use('/api/auth', authRoutes);
        this.app.use('/api/users', userRoutes);
        this.app.use('/api/vehicles', vehicleRoutes);
        this.app.use('/api/sessions', sessionRoutes);
        this.app.use('/api/reports', reportRoutes);
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware);
    }

}

export default new App().app;