import 'reflect-metadata';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { initializeDatabase } from './config/database';
import companyRoutes from './routes/company.routes';
import { startGrpcServer } from './grpc/company.grpc';

import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

const app = express();
const PORT = process.env.PORT || 3000;
const GRPC_PORT = process.env.GRPC_PORT ? parseInt(process.env.GRPC_PORT) : 50051;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
}));

app.use('/companies', companyRoutes);

// Swagger setup
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Company Service API',
            version: '1.0.0',
            description: 'API documentation for Company Service',
        },
    },
    apis: ['./dist/routes/*.js'], // Point to compiled JavaScript files
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/company-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Initialize database and start server
initializeDatabase()
    .then(async () => {
        // Start HTTP server
        app.listen(PORT, () => {
            console.log(`Company service running on port ${PORT}`);
        });

        // Start gRPC server
        try {
            await startGrpcServer(GRPC_PORT);
        } catch (error) {
            console.error('Failed to start gRPC server:', error);
            process.exit(1);
        }
    })
    .catch((error) => {
        console.error('Error initializing service:', error);
        process.exit(1);
    });
