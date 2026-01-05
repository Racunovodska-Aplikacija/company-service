import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { AppDataSource } from '../config/data-source';
import { Product } from '../entities/Product';
import { Company } from '../entities/Company';

const productRepository = AppDataSource.getRepository(Product);
const companyRepository = AppDataSource.getRepository(Company);

// Helper function to extract userId from JWT
const extractUserIdFromToken = (req: Request): string | null => {
    let token = '';
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    } else if (req.cookies?.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) return null;

    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        return decoded.userId;
    } catch {
        return null;
    }
};

// Get all products for a company
export const getProductsByCompanyId = async (req: Request, res: Response) => {
    try {
        const userId = extractUserIdFromToken(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { companyId } = req.params;

        // Verify the company belongs to the user
        const company = await companyRepository.findOne({ where: { id: companyId, userId } });
        if (!company) return res.status(404).json({ message: 'Company not found' });

        const products = await productRepository.find({ where: { companyId } });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products' });
    }
};

// Get a single product
export const getProductById = async (req: Request, res: Response) => {
    try {
        const userId = extractUserIdFromToken(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { productId } = req.params;
        const product = await productRepository.findOne({ where: { id: productId } });

        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Verify company ownership
        const company = await companyRepository.findOne({ where: { id: product.companyId, userId } });
        if (!company) return res.status(403).json({ message: 'Forbidden' });

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product' });
    }
};

// Create a product for a company
export const createProduct = async (req: Request, res: Response) => {
    try {
        const userId = extractUserIdFromToken(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { companyId } = req.params;

        // Verify the company belongs to the user
        const company = await companyRepository.findOne({ where: { id: companyId, userId } });
        if (!company) return res.status(404).json({ message: 'Company not found' });

        const product = productRepository.create({ ...req.body, companyId });
        const errors = await validate(product);
        if (errors.length > 0) return res.status(400).json({ errors });

        const saved = await productRepository.save(product);
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ message: 'Error creating product' });
    }
};

// Update a product
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const userId = extractUserIdFromToken(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { productId } = req.params;
        const product = await productRepository.findOne({ where: { id: productId } });

        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Verify company ownership
        const company = await companyRepository.findOne({ where: { id: product.companyId, userId } });
        if (!company) return res.status(403).json({ message: 'Forbidden' });

        Object.assign(product, req.body);
        const errors = await validate(product);
        if (errors.length > 0) return res.status(400).json({ errors });

        const updated = await productRepository.save(product);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product' });
    }
};

// Delete a product
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const userId = extractUserIdFromToken(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { productId } = req.params;
        const product = await productRepository.findOne({ where: { id: productId } });

        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Verify company ownership
        const company = await companyRepository.findOne({ where: { id: product.companyId, userId } });
        if (!company) return res.status(403).json({ message: 'Forbidden' });

        await productRepository.remove(product);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product' });
    }
};
