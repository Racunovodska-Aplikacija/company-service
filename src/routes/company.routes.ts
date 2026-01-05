import { Router } from 'express';
import { createCompany, deleteCompany, getCompanies, getCompanyById, updateCompany, searchCebelcaCompanies } from '../controllers/company.controller';
import productRoutes from './product.routes';

const router = Router();

router.get('/', getCompanies);
router.get('/search/cebelca', searchCebelcaCompanies);
router.get('/:id', getCompanyById);
router.post('/', createCompany);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);

// Nested product routes under each company
router.use('/:companyId/products', productRoutes);

export default router;
