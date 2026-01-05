import { DataSource } from 'typeorm';
import { AppDataSource } from './data-source';

// Create database if it doesn't exist
const ensureDatabaseExists = async (): Promise<void> => {
    const dbName = process.env.DB_DATABASE || 'companyDB';
    const host = process.env.DB_HOST || 'localhost';
    const port = parseInt(process.env.DB_PORT || '5432');
    const username = process.env.DB_USERNAME || 'postgres';
    const password = process.env.DB_PASSWORD || 'postgres';

    // Create a temporary connection to the default 'postgres' database
    const tempDataSource = new DataSource({
        type: 'postgres',
        host,
        port,
        username,
        password,
        database: 'postgres', // Connect to default postgres DB
    });

    try {
        await tempDataSource.initialize();
        const queryRunner = tempDataSource.createQueryRunner();

        try {
            // Check if database exists
            const databases = await queryRunner.query(
                `SELECT datname FROM pg_database WHERE datname = $1`,
                [dbName]
            );

            if (databases.length === 0) {
                console.log(`Database '${dbName}' not found. Creating...`);
                await queryRunner.query(`CREATE DATABASE "${dbName}"`);
                console.log(`Database '${dbName}' created successfully`);
            } else {
                console.log(`Database '${dbName}' already exists`);
            }
        } finally {
            await queryRunner.release();
        }
    } catch (error) {
        console.error('Error checking/creating database:', error);
        throw error;
    } finally {
        await tempDataSource.destroy();
    }
};

// Check and create tables if needed
const ensureTablesExist = async (): Promise<void> => {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
        await queryRunner.connect();

        // Check for companies table
        const companiesTableExists = await queryRunner.hasTable('companies');
        // Check for products table
        const productsTableExists = await queryRunner.hasTable('products');

        if (!companiesTableExists || !productsTableExists) {
            console.log('Required tables not found. Running migrations...');
            await AppDataSource.runMigrations();
            console.log('Migrations completed successfully');
        } else {
            console.log('All required tables exist in companyDB');
        }
    } catch (error) {
        console.error('Error checking tables:', error);
        await queryRunner.release();
        throw error;
    }
    await queryRunner.release();
};

// Initialize database: create DB, connect, and create tables
export const initializeDatabase = async (): Promise<void> => {
    try {
        // Step 1: Ensure database exists
        await ensureDatabaseExists();

        // Step 2: Connect to the database
        await AppDataSource.initialize();

        // Step 3: Ensure tables exist
        await ensureTablesExist();

        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Database initialization failed:', error);
        throw error;
    }
};
