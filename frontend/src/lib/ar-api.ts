import api from '@/lib/api/axios';

// The centralized axios instance already has the correct baseURL set to includes /api
// So we can use relative paths like '/ar/...'

// Types
export interface ARCustomer {
    id: string;
    bpCode: string;
    customerName: string;
    region?: string;
    department?: string;
    personInCharge?: string;
    contactNo?: string;
    emailId?: string;
    riskClass: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    creditLimit?: number;
    totalInvoiceAmount?: number;
    outstandingBalance?: number;
    createdAt: string;
    _count?: { invoices: number };
}

export interface ARPaymentTerm {
    id: string;
    termCode: string;
    termName: string;
    dueDays: number;
    description?: string;
    isActive: boolean;
}

export interface ARInvoice {
    id: string;
    invoiceNumber: string;
    bpCode: string;
    customerName: string;
    poNo?: string;
    totalAmount: number;
    netAmount: number;
    taxAmount?: number;
    invoiceDate: string;
    dueDate: string;
    actualPaymentTerms?: string;
    balance?: number;
    riskClass: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    dueByDays?: number;
    // Customer Master Fields
    emailId?: string;
    contactNo?: string;
    region?: string;
    department?: string;
    personInCharge?: string;
    pocName?: string;
    // Manual Tracking Fields
    receipts?: number;
    adjustments?: number;
    totalReceipts?: number;
    type?: string;
    modeOfDelivery?: string;
    sentHandoverDate?: string;
    deliveryStatus: 'PENDING' | 'SENT' | 'DELIVERED' | 'ACKNOWLEDGED';
    impactDate?: string;
    comments?: string;
    status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    paymentHistory?: ARPaymentHistory[];
    createdAt?: string;
    updatedAt?: string;
    // Prepaid Invoice Fields
    invoiceType?: 'REGULAR' | 'PREPAID';
    advanceReceivedDate?: string;
    deliveryDueDate?: string;
    prepaidStatus?: 'AWAITING_DELIVERY' | 'PARTIALLY_DELIVERED' | 'FULLY_DELIVERED' | 'EXPIRED';
}

export interface ARPaymentHistory {
    id: string;
    invoiceId: string;
    amount: number;
    paymentDate: string;
    paymentMode: string;
    referenceNo?: string;
    notes?: string;
    recordedBy?: string;
    createdAt: string;
}

export interface ARDashboardKPIs {
    totalOutstanding: number;
    overdueAmount: number;
    collectionsToday: number;
    pendingInvoices: number;
    overdueInvoices: number;
}

export interface ARAgingData {
    current: { count: number; amount: number };
    days1to30: { count: number; amount: number };
    days31to60: { count: number; amount: number };
    days61to90: { count: number; amount: number };
    over90: { count: number; amount: number };
}

// Activity types for AR Total Activity Dashboard
export interface ARActivity {
    id: string;
    type: 'INVOICE' | 'SESSION';
    action: string;
    description?: string;
    // Invoice-specific
    invoiceId?: string;
    invoiceNumber?: string;
    customerName?: string;
    fieldName?: string;
    oldValue?: string;
    newValue?: string;
    // Session-specific
    userId?: number;
    userName?: string;
    userEmail?: string;
    userRole?: string;
    financeRole?: string;
    deviceInfo?: string;
    // Common
    performedBy?: string;
    performedById?: number;
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
    createdAt: string;
}

export interface ARActivityStats {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byType: { invoice: number; session: number };
    byAction: Record<string, number>;
    todayBreakdown: { invoice: number; session: number };
}

export interface ARActivityFilters {
    fromDate?: string;
    toDate?: string;
    action?: string;
    activityType?: 'INVOICE' | 'SESSION' | 'ALL';
    userId?: number;
    invoiceId?: string;
    search?: string;
    page?: number;
    limit?: number;
}


// API Functions
export const arApi = {
    // ═══════════════════════════════════════════════════════════════════════════
    // Essential Dashboard with Performance Indicators
    // ═══════════════════════════════════════════════════════════════════════════

    async getEssentialDashboard(): Promise<any> {
        const res = await api.get('/ar/dashboard/essential');
        return res.data;
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // Legacy Dashboard Endpoints
    // ═══════════════════════════════════════════════════════════════════════════

    async getDashboardKPIs(): Promise<ARDashboardKPIs> {
        const res = await api.get('/ar/dashboard/kpis');
        return res.data;
    },

    async getAgingAnalysis(): Promise<ARAgingData> {
        const res = await api.get('/ar/dashboard/aging');
        return res.data;
    },

    async getStatusDistribution(): Promise<any> {
        const res = await api.get('/ar/dashboard/status-distribution');
        return res.data;
    },

    async getRiskDistribution(): Promise<any> {
        const res = await api.get('/ar/dashboard/risk-distribution');
        return res.data;
    },

    async getCollectionTrend(): Promise<{ month: string; amount: number }[]> {
        const res = await api.get('/ar/dashboard/collection-trend');
        return res.data;
    },

    async getCriticalOverdue(limit = 10): Promise<any[]> {
        const res = await api.get(`/ar/dashboard/critical-overdue?limit=${limit}`);
        return res.data;
    },

    async getRecentPayments(limit = 10): Promise<any[]> {
        const res = await api.get(`/ar/dashboard/recent-payments?limit=${limit}`);
        return res.data;
    },

    async getTopCustomers(limit = 5): Promise<any[]> {
        const res = await api.get(`/ar/dashboard/top-customers?limit=${limit}`);
        return res.data;
    },

    async getMonthlyComparison(): Promise<any> {
        const res = await api.get('/ar/dashboard/monthly-comparison');
        return res.data;
    },

    async getDSOMetrics(): Promise<any> {
        const res = await api.get('/ar/dashboard/dso-metrics');
        return res.data;
    },


    // Customers
    async getCustomers(params?: { search?: string; page?: number; limit?: number }) {
        const res = await api.get('/ar/customers', { params });
        return res.data;
    },

    async createCustomer(data: Partial<ARCustomer>): Promise<ARCustomer> {
        const res = await api.post('/ar/customers', data);
        return res.data;
    },

    async updateCustomer(id: string, data: Partial<ARCustomer>): Promise<ARCustomer> {
        const res = await api.put(`/ar/customers/${id}`, data);
        return res.data;
    },

    async getCustomerById(id: string): Promise<ARCustomer & { invoices?: any[] }> {
        const res = await api.get(`/ar/customers/${id}`);
        return res.data;
    },

    // Payment Terms
    async getPaymentTerms(activeOnly = false): Promise<ARPaymentTerm[]> {
        const res = await api.get('/ar/payment-terms', { params: { activeOnly } });
        return res.data;
    },

    async seedPaymentTerms(): Promise<void> {
        await api.post('/ar/payment-terms/seed');
    },

    async getPaymentTermById(id: string): Promise<ARPaymentTerm> {
        const res = await api.get(`/ar/payment-terms/${id}`);
        return res.data;
    },

    async createPaymentTerm(data: Partial<ARPaymentTerm>): Promise<ARPaymentTerm> {
        const res = await api.post('/ar/payment-terms', data);
        return res.data;
    },

    async updatePaymentTerm(id: string, data: Partial<ARPaymentTerm>): Promise<ARPaymentTerm> {
        const res = await api.put(`/ar/payment-terms/${id}`, data);
        return res.data;
    },

    // Invoices
    async getInvoices(params?: { search?: string; status?: string; customerId?: string; invoiceType?: string; page?: number; limit?: number }) {
        const res = await api.get('/ar/invoices', { params });
        return res.data;
    },

    async getInvoiceById(id: string): Promise<ARInvoice> {
        const res = await api.get(`/ar/invoices/${id}`);
        return res.data;
    },

    async updateInvoice(id: string, data: Partial<ARInvoice>): Promise<ARInvoice> {
        const res = await api.put(`/ar/invoices/${id}`, data);
        return res.data;
    },

    async addPayment(invoiceId: string, data: any): Promise<ARPaymentHistory> {
        const res = await api.post(`/ar/invoices/${invoiceId}/payments`, data);
        return res.data;
    },

    async createInvoice(data: Partial<ARInvoice>): Promise<ARInvoice> {
        const res = await api.post('/ar/invoices', data);
        return res.data;
    },

    async deleteInvoice(id: string): Promise<void> {
        await api.delete(`/ar/invoices/${id}`);
    },

    async getInvoiceRemarks(invoiceId: string): Promise<any[]> {
        const res = await api.get(`/ar/invoices/${invoiceId}/remarks`);
        return res.data;
    },

    async addInvoiceRemark(invoiceId: string, content: string): Promise<any> {
        const res = await api.post(`/ar/invoices/${invoiceId}/remarks`, { content });
        return res.data;
    },

    async getInvoiceActivityLog(invoiceId: string): Promise<any[]> {
        const res = await api.get(`/ar/invoices/${invoiceId}/activity`);
        return res.data;
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // TOTAL ACTIVITIES - Combined invoice and session activities
    // ═══════════════════════════════════════════════════════════════════════════

    async getAllActivities(params?: ARActivityFilters): Promise<{ data: ARActivity[]; pagination: any }> {
        const res = await api.get('/ar/activities', { params });
        return res.data;
    },

    async getActivityStats(): Promise<ARActivityStats> {
        const res = await api.get('/ar/activities/stats');
        return res.data;
    },

    async getRecentActivities(limit = 10): Promise<ARActivity[]> {
        const res = await api.get(`/ar/activities/recent?limit=${limit}`);
        return res.data;
    },


    async importExcel(file: File, selectedIndices?: number[], mapping?: any) {
        const formData = new FormData();
        formData.append('file', file);
        if (selectedIndices && selectedIndices.length > 0) {
            formData.append('selectedIndices', JSON.stringify(selectedIndices));
        }
        if (mapping) formData.append('mapping', JSON.stringify(mapping));

        const res = await api.post('/ar/import/excel', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    },

    async previewExcel(file: File) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await api.post('/ar/import/preview', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    },

    async getImportHistory() {
        const res = await api.get('/ar/import/history');
        return res.data;
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // VENDOR ACCOUNTS
    // ═══════════════════════════════════════════════════════════════════════════

    async getBankAccounts(params?: { search?: string; activeOnly?: boolean }) {
        const res = await api.get('/ar/bank-accounts', { params });
        return res.data;
    },

    async getBankAccountById(id: string): Promise<BankAccount> {
        const res = await api.get(`/ar/bank-accounts/${id}`);
        return res.data;
    },

    async createBankAccount(data: Partial<BankAccount>): Promise<BankAccount> {
        const res = await api.post('/ar/bank-accounts', data);
        return res.data;
    },

    async updateBankAccount(id: string, data: Partial<BankAccount>): Promise<BankAccount> {
        const res = await api.put(`/ar/bank-accounts/${id}`, data);
        return res.data;
    },

    async deleteBankAccount(id: string): Promise<void> {
        await api.delete(`/ar/bank-accounts/${id}`);
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // VENDOR ACCOUNT CHANGE REQUESTS
    // ═══════════════════════════════════════════════════════════════════════════

    async createBankAccountRequest(data: {
        bankAccountId?: string;
        requestType: 'CREATE' | 'UPDATE' | 'DELETE';
        requestedData: Partial<BankAccount>;
    }): Promise<BankAccountChangeRequest> {
        const res = await api.post('/ar/bank-accounts/requests', data);
        return res.data;
    },

    async getPendingRequests(status?: string): Promise<BankAccountChangeRequest[]> {
        const res = await api.get('/ar/bank-accounts/requests/pending', { params: { status } });
        return res.data;
    },

    async getMyRequests(): Promise<BankAccountChangeRequest[]> {
        const res = await api.get('/ar/bank-accounts/requests/my');
        return res.data;
    },

    async getRequestById(id: string): Promise<BankAccountChangeRequest> {
        const res = await api.get(`/ar/bank-accounts/requests/${id}`);
        return res.data;
    },

    async approveRequest(id: string, reviewNotes?: string): Promise<any> {
        const res = await api.post(`/ar/bank-accounts/requests/${id}/approve`, { reviewNotes });
        return res.data;
    },

    async rejectRequest(id: string, reviewNotes: string): Promise<any> {
        const res = await api.post(`/ar/bank-accounts/requests/${id}/reject`, { reviewNotes });
        return res.data;
    },

    async getRequestStats(): Promise<{ pending: number; approved: number; rejected: number; total: number }> {
        const res = await api.get('/ar/bank-accounts/requests/stats');
        return res.data;
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // VENDOR ACCOUNT ATTACHMENTS
    // ═══════════════════════════════════════════════════════════════════════════

    async getBankAccountAttachments(id: string): Promise<BankAccountAttachment[]> {
        const res = await api.get(`/ar/bank-accounts/${id}/attachments`);
        return res.data;
    },

    async uploadBankAccountAttachment(id: string, file: File): Promise<BankAccountAttachment> {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post(`/ar/bank-accounts/${id}/attachments`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    },

    async downloadBankAccountAttachment(attachmentId: string): Promise<void> {
        // We use window.open for downloads or a blob approach.
        // For standard file download, window.open is often simplest if the server sets Content-Disposition
        const baseURL = process.env.NEXT_PUBLIC_API_URL || '';
        window.open(`${baseURL}/ar/bank-accounts/attachments/${attachmentId}/download`, '_blank');
    },

    async deleteBankAccountAttachment(attachmentId: string): Promise<void> {
        await api.delete(`/ar/bank-accounts/attachments/${attachmentId}`);
    },

    async previewBankAccountImport(file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await api.post('/ar/bank-accounts/import/preview', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data;
    },

    async importBankAccountsFromExcel(rows: any[]): Promise<any> {
        const { data } = await api.post('/ar/bank-accounts/import/excel', { rows });
        return data;
    },

    async downloadBankAccountTemplate(): Promise<void> {
        const { data } = await api.get('/ar/bank-accounts/import/template', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Vendor_Accounts_Template.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
};

// Bank Account Types
export interface BankAccount {
    id: string;
    vendorName: string;
    beneficiaryBankName: string;
    accountNumber: string;
    ifscCode: string;
    emailId?: string;
    beneficiaryName?: string;
    nickName?: string;
    isActive: boolean;
    isMSME: boolean;
    udyamRegNum?: string;
    currency: string;
    createdById: number;
    updatedById: number;
    createdAt: string;
    updatedAt: string;
    attachments?: BankAccountAttachment[];
    changeRequests?: BankAccountChangeRequest[];
    _count?: { changeRequests: number };
}

export interface BankAccountChangeRequest {
    id: string;
    bankAccountId?: string;
    requestType: 'CREATE' | 'UPDATE' | 'DELETE';
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestedData: Partial<BankAccount>;
    requestedById: number;
    requestedAt: string;
    reviewedById?: number;
    reviewedAt?: string;
    reviewNotes?: string;
    bankAccount?: BankAccount;
    requestedBy?: { id: number; name: string; email: string };
    reviewedBy?: { id: number; name: string; email: string };
    attachments?: BankAccountAttachment[];
}

export interface BankAccountAttachment {
    id: string;
    filename: string;
    path: string;
    mimeType: string;
    size: number;
    bankAccountId: string;
    uploadedById: number;
    createdAt: string;
    uploadedBy?: { id: number; name: string };
}

// Utility functions
export const formatARCurrency = (amount: number): string => {
    if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(2)}L`;
    } else if (amount >= 1000) {
        return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatARDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

