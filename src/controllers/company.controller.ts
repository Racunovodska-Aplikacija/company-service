import { Request, Response } from 'express';
import { validate } from 'class-validator';
import axios from 'axios';
import { AppDataSource } from '../config/data-source';
import { Company } from '../entities/Company';

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

export const getCompanies = async (req: Request, res: Response) => {
    try {
        const userId = extractUserIdFromToken(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const companies = await companyRepository.find({
            where: { userId },
            relations: ['products']
        });
        res.json(companies);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching companies' });
    }
};

export const getCompanyById = async (req: Request, res: Response) => {
    try {
        const userId = extractUserIdFromToken(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { id } = req.params;
        const company = await companyRepository.findOne({
            where: { id, userId },
            relations: ['products']
        });
        if (!company) return res.status(404).json({ message: 'Company not found' });

        res.json(company);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching company' });
    }
};

export const createCompany = async (req: Request, res: Response) => {
    try {
        const userId = extractUserIdFromToken(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const company = companyRepository.create({ ...req.body, userId });
        const errors = await validate(company);
        if (errors.length > 0) return res.status(400).json({ errors });

        const saved = await companyRepository.save(company);
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ message: 'Error creating company' });
    }
};

export const updateCompany = async (req: Request, res: Response) => {
    try {
        const userId = extractUserIdFromToken(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { id } = req.params;
        const company = await companyRepository.findOne({ where: { id, userId } });
        if (!company) return res.status(404).json({ message: 'Company not found' });

        Object.assign(company, req.body);
        const errors = await validate(company);
        if (errors.length > 0) return res.status(400).json({ errors });

        const updated = await companyRepository.save(company);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Error updating company' });
    }
};

export const deleteCompany = async (req: Request, res: Response) => {
    try {
        const userId = extractUserIdFromToken(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { id } = req.params;
        const company = await companyRepository.findOne({ where: { id, userId } });
        if (!company) return res.status(404).json({ message: 'Company not found' });

        await companyRepository.remove(company);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting company' });
    }
};

export const searchCebelcaCompanies = async (req: Request, res: Response) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Query parameter "q" is required' });
        }

        const response = await axios.get('https://www.cebelca.biz/companies', {
            params: { q },
            timeout: 10000, // 10 second timeout
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching from cebelca.biz:', error);
        if (axios.isAxiosError(error)) {
            res.status(error.response?.status || 500).json({
                message: 'Error fetching companies from external API',
                details: error.message
            });
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};
