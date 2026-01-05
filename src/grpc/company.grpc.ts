import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { AppDataSource } from '../config/data-source';
import { Company } from '../entities/Company';
import { Product } from '../entities/Product';
import path from 'path';

// Load proto files
const COMPANY_PROTO_PATH = path.join(__dirname, '../proto/company.proto');
const PRODUCT_PROTO_PATH = path.join(__dirname, '../proto/product.proto');

const companyPackageDefinition = protoLoader.loadSync(COMPANY_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const productPackageDefinition = protoLoader.loadSync(PRODUCT_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const companyProtoDescriptor = grpc.loadPackageDefinition(companyPackageDefinition) as any;
const productProtoDescriptor = grpc.loadPackageDefinition(productPackageDefinition) as any;
const companyProto = companyProtoDescriptor.company;
const productProto = productProtoDescriptor.product;

// Company gRPC service implementation
export const getCompany = async (
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
) => {
    try {
        const { id } = call.request;

        if (!id) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: 'Company ID is required',
            } as grpc.ServiceError, null);
        }

        const companyRepository = AppDataSource.getRepository(Company);
        const company = await companyRepository.findOne({ where: { id } });

        if (!company) {
            return callback({
                code: grpc.status.NOT_FOUND,
                message: 'Company not found',
            } as grpc.ServiceError, null);
        }

        // Map company entity to proto response
        const response = {
            id: company.id,
            userId: company.userId,
            companyName: company.companyName,
            street: company.street,
            streetAdditional: company.streetAdditional || '',
            postalCode: company.postalCode,
            city: company.city,
            iban: company.iban,
            bic: company.bic,
            registrationNumber: company.registrationNumber,
            vatPayer: company.vatPayer,
            vatId: company.vatId || '',
            additionalInfo: company.additionalInfo || '',
            documentLocation: company.documentLocation || '',
            reverseCharge: company.reverseCharge,
            createdAt: company.createdAt.toISOString(),
            updatedAt: company.updatedAt.toISOString(),
        };

        callback(null, response);
    } catch (error) {
        console.error('Error in getCompany gRPC:', error);
        callback({
            code: grpc.status.INTERNAL,
            message: 'Internal server error',
        } as grpc.ServiceError, null);
    }
};

// Product gRPC service implementation
export const getProducts = async (
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
) => {
    try {
        const { ids } = call.request;

        if (!ids || ids.length === 0) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: 'At least one Product ID is required',
            } as grpc.ServiceError, null);
        }

        const productRepo = AppDataSource.getRepository(Product);
        const products = await productRepo.find({
            where: { id: ids },
        });

        const productResponses = products.map(product => ({
            id: product.id,
            companyId: product.companyId || '',
            name: product.name || '',
            cost: product.cost !== undefined ? String(product.cost) : '',
            measuringUnit: product.measuringUnit || '',
            ddvPercentage: product.ddvPercentage !== undefined ? String(product.ddvPercentage) : '',
            createdAt: product.createdAt ? product.createdAt.toISOString() : '',
            updatedAt: product.updatedAt ? product.updatedAt.toISOString() : '',
        }));

        callback(null, { products: productResponses });
    } catch (error) {
        console.error('Error in getProducts gRPC:', error);
        callback({
            code: grpc.status.INTERNAL,
            message: 'Internal server error',
        } as grpc.ServiceError, null);
    }
};

// Create and configure unified gRPC server
export const createGrpcServer = (): grpc.Server => {
    const server = new grpc.Server();

    // Add both Company and Product services to the same server
    server.addService(companyProto.CompanyService.service, {
        GetCompany: getCompany,
    });

    server.addService(productProto.ProductService.service, {
        GetProducts: getProducts,
    });

    return server;
};

// Start gRPC server
export const startGrpcServer = (port: number = 50051): Promise<void> => {
    return new Promise((resolve, reject) => {
        const server = createGrpcServer();

        server.bindAsync(
            `0.0.0.0:${port}`,
            grpc.ServerCredentials.createInsecure(),
            (error, port) => {
                if (error) {
                    console.error('Failed to start gRPC server:', error);
                    reject(error);
                    return;
                }
                server.start();
                console.log(`Company & Product gRPC server running on port ${port}`);
                resolve();
            }
        );
    });
};
