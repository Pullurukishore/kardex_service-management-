import { Router } from 'express';
import multer from 'multer';

// Import controllers
import * as invoiceController from '../../controllers/ar/arInvoice.controller';
import * as customerController from '../../controllers/ar/arCustomer.controller';
import * as dashboardController from '../../controllers/ar/arDashboard.controller';
import * as paymentTermsController from '../../controllers/ar/arPaymentTerms.controller';
import * as importController from '../../controllers/ar/arImport.controller';

const router = Router();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD ROUTES
// ═══════════════════════════════════════════════════════════════════════════
router.get('/dashboard/kpis', dashboardController.getDashboardKPIs);
router.get('/dashboard/aging', dashboardController.getAgingAnalysis);
router.get('/dashboard/collection-trend', dashboardController.getCollectionTrend);
router.get('/dashboard/critical-overdue', dashboardController.getCriticalOverdue);
router.get('/dashboard/customer-outstanding', dashboardController.getCustomerOutstanding);
router.get('/dashboard/recent-activity', dashboardController.getRecentActivity);
router.get('/dashboard/top-customers', dashboardController.getTopCustomers);
router.get('/dashboard/monthly-comparison', dashboardController.getMonthlyComparison);
router.get('/dashboard/dso-metrics', dashboardController.getDSOMetrics);

// ═══════════════════════════════════════════════════════════════════════════
// INVOICE ROUTES
// ═══════════════════════════════════════════════════════════════════════════
router.get('/invoices', invoiceController.getAllInvoices);
router.get('/invoices/:id', invoiceController.getInvoiceById);
router.post('/invoices', invoiceController.createInvoice);
router.put('/invoices/:id', invoiceController.updateInvoice);
router.delete('/invoices/:id', invoiceController.deleteInvoice);
router.put('/invoices/:id/delivery', invoiceController.updateDeliveryTracking);
router.post('/invoices/update-overdue', invoiceController.updateOverdueStatus);
router.post('/invoices/:id/payments', invoiceController.addPaymentRecord);

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOMER ROUTES
// ═══════════════════════════════════════════════════════════════════════════
router.get('/customers', customerController.getAllCustomers);
router.get('/customers/:id', customerController.getCustomerById);
router.post('/customers', customerController.createCustomer);
router.put('/customers/:id', customerController.updateCustomer);
router.delete('/customers/:id', customerController.deleteCustomer);

// ═══════════════════════════════════════════════════════════════════════════
// PAYMENT TERMS ROUTES
// ═══════════════════════════════════════════════════════════════════════════
router.get('/payment-terms', paymentTermsController.getAllPaymentTerms);
router.post('/payment-terms', paymentTermsController.createPaymentTerm);
router.post('/payment-terms/seed', paymentTermsController.seedPaymentTerms); // Must be before :id route
router.get('/payment-terms/:id', paymentTermsController.getPaymentTermById);
router.put('/payment-terms/:id', paymentTermsController.updatePaymentTerm);

// ═══════════════════════════════════════════════════════════════════════════
// IMPORT ROUTES
// ═══════════════════════════════════════════════════════════════════════════
router.post('/import/preview', upload.single('file'), importController.previewExcel);
router.post('/import/excel', upload.single('file'), importController.importFromExcel);
router.get('/import/history', importController.getImportHistory);
router.get('/import/template', importController.downloadTemplate);
router.post('/import/recalculate', importController.recalculateAll);

export default router;
