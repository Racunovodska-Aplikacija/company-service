import { Router } from 'express';
import { createCompany, deleteCompany, getCompanies, getCompanyById, updateCompany, searchCebelcaCompanies } from '../controllers/company.controller';
import productRoutes from './product.routes';

const router = Router();

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Get all companies
 *     description: Retrieve a list of all companies
 *     tags:
 *       - Companies
 *     responses:
 *       '200':
 *         description: List of companies
 */
router.get('/', getCompanies);

/**
 * @swagger
 * /companies/search/cebelca:
 *   get:
 *     summary: Search Cebelca companies
 *     description: Search for companies in Cebelca database
 *     tags:
 *       - Companies
 *     responses:
 *       '200':
 *         description: Search results
 */
router.get('/search/cebelca', searchCebelcaCompanies);

/**
 * @swagger
 * /companies/{id}:
 *   get:
 *     summary: Get company by ID
 *     description: Retrieve a specific company
 *     tags:
 *       - Companies
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Company details
 */
router.get('/:id', getCompanyById);

/**
 * @swagger
 * /companies:
 *   post:
 *     summary: Create a new company
 *     description: Create a new company record
 *     tags:
 *       - Companies
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Company created successfully
 */
router.post('/', createCompany);

/**
 * @swagger
 * /companies/{id}:
 *   put:
 *     summary: Update company
 *     description: Update an existing company
 *     tags:
 *       - Companies
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Company updated successfully
 */
router.put('/:id', updateCompany);

/**
 * @swagger
 * /companies/{id}:
 *   delete:
 *     summary: Delete company
 *     description: Delete a company record
 *     tags:
 *       - Companies
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Company deleted successfully
 */
router.delete('/:id', deleteCompany);

// Nested product routes under each company
router.use('/:companyId/products', productRoutes);

export default router;
