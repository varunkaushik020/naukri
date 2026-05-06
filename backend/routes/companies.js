const express = require('express');
const router = express.Router();
const {
    registerCompany,
    getCompanyById,
    getCompanies,
    updateCompany,
    getMyCompanies,
} = require('../controllers/companyController');
const { protect } = require('../middleware/auth');

router.post('/', protect, registerCompany);
router.get('/', getCompanies);
router.get('/:id', getCompanyById);
router.put('/:id', protect, updateCompany);
router.get('/my-companies', protect, getMyCompanies);

module.exports = router;
