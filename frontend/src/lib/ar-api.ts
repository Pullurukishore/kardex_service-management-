const AR_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003';

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

// API Functions
export const arApi = {
    // Dashboard
    async getDashboardKPIs(): Promise<ARDashboardKPIs> {
        const res = await fetch(`${AR_API_BASE}/ar/dashboard/kpis`);
        if (!res.ok) throw new Error('Failed to fetch KPIs');
        return res.json();
    },

    async getAgingAnalysis(): Promise<ARAgingData> {
        const res = await fetch(`${AR_API_BASE}/ar/dashboard/aging`);
        if (!res.ok) throw new Error('Failed to fetch aging');
        return res.json();
    },

    async getCollectionTrend(): Promise<{ month: string; amount: number }[]> {
        const res = await fetch(`${AR_API_BASE}/ar/dashboard/collection-trend`);
        if (!res.ok) throw new Error('Failed to fetch trend');
        return res.json();
    },

    async getCriticalOverdue(limit = 10): Promise<any[]> {
        const res = await fetch(`${AR_API_BASE}/ar/dashboard/critical-overdue?limit=${limit}`);
        if (!res.ok) throw new Error('Failed to fetch overdue');
        return res.json();
    },

    async getRecentActivity(limit = 10): Promise<any[]> {
        const res = await fetch(`${AR_API_BASE}/ar/dashboard/recent-activity?limit=${limit}`);
        if (!res.ok) throw new Error('Failed to fetch activity');
        return res.json();
    },

    async getTopCustomers(limit = 5): Promise<any[]> {
        const res = await fetch(`${AR_API_BASE}/ar/dashboard/top-customers?limit=${limit}`);
        if (!res.ok) throw new Error('Failed to fetch top customers');
        return res.json();
    },

    async getMonthlyComparison(): Promise<any> {
        const res = await fetch(`${AR_API_BASE}/ar/dashboard/monthly-comparison`);
        if (!res.ok) throw new Error('Failed to fetch comparison');
        return res.json();
    },

    async getDSOMetrics(): Promise<any> {
        const res = await fetch(`${AR_API_BASE}/ar/dashboard/dso-metrics`);
        if (!res.ok) throw new Error('Failed to fetch DSO');
        return res.json();
    },

    // Customers
    async getCustomers(params?: { search?: string; page?: number; limit?: number }) {
        const query = new URLSearchParams(params as any).toString();
        const res = await fetch(`${AR_API_BASE}/ar/customers?${query}`);
        if (!res.ok) throw new Error('Failed to fetch customers');
        return res.json();
    },

    async createCustomer(data: Partial<ARCustomer>): Promise<ARCustomer> {
        const res = await fetch(`${AR_API_BASE}/ar/customers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create customer');
        return res.json();
    },

    async updateCustomer(id: string, data: Partial<ARCustomer>): Promise<ARCustomer> {
        const res = await fetch(`${AR_API_BASE}/ar/customers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to update customer');
        }
        return res.json();
    },

    async getCustomerById(id: string): Promise<ARCustomer & { invoices?: any[] }> {
        const res = await fetch(`${AR_API_BASE}/ar/customers/${id}`);
        if (!res.ok) throw new Error('Failed to fetch customer');
        return res.json();
    },

    // Payment Terms
    async getPaymentTerms(activeOnly = false): Promise<ARPaymentTerm[]> {
        const res = await fetch(`${AR_API_BASE}/ar/payment-terms?activeOnly=${activeOnly}`);
        if (!res.ok) throw new Error('Failed to fetch payment terms');
        return res.json();
    },

    async seedPaymentTerms(): Promise<void> {
        const res = await fetch(`${AR_API_BASE}/ar/payment-terms/seed`, { method: 'POST' });
        if (!res.ok) throw new Error('Failed to seed payment terms');
    },

    async getPaymentTermById(id: string): Promise<ARPaymentTerm> {
        const res = await fetch(`${AR_API_BASE}/ar/payment-terms/${id}`);
        if (!res.ok) throw new Error('Failed to fetch payment term');
        return res.json();
    },

    async createPaymentTerm(data: Partial<ARPaymentTerm>): Promise<ARPaymentTerm> {
        const res = await fetch(`${AR_API_BASE}/ar/payment-terms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to create payment term');
        }
        return res.json();
    },

    async updatePaymentTerm(id: string, data: Partial<ARPaymentTerm>): Promise<ARPaymentTerm> {
        const res = await fetch(`${AR_API_BASE}/ar/payment-terms/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to update payment term');
        }
        return res.json();
    },

    // Invoices
    async getInvoices(params?: { search?: string; status?: string; customerId?: string; page?: number; limit?: number }) {
        const query = new URLSearchParams(params as any).toString();
        const res = await fetch(`${AR_API_BASE}/ar/invoices?${query}`);
        if (!res.ok) throw new Error('Failed to fetch invoices');
        return res.json();
    },

    async getInvoiceById(id: string): Promise<ARInvoice> {
        const res = await fetch(`${AR_API_BASE}/ar/invoices/${id}`);
        if (!res.ok) throw new Error('Failed to fetch invoice');
        return res.json();
    },

    async updateInvoice(id: string, data: Partial<ARInvoice>): Promise<ARInvoice> {
        const res = await fetch(`${AR_API_BASE}/ar/invoices/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update invoice');
        return res.json();
    },

    async addPayment(invoiceId: string, data: any): Promise<ARPaymentHistory> {
        const res = await fetch(`${AR_API_BASE}/ar/invoices/${invoiceId}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to record payment');
        }
        return res.json();
    },

    async createInvoice(data: Partial<ARInvoice>): Promise<ARInvoice> {
        const res = await fetch(`${AR_API_BASE}/ar/invoices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create invoice');
        return res.json();
    },

    async deleteInvoice(id: string): Promise<void> {
        const res = await fetch(`${AR_API_BASE}/ar/invoices/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete invoice');
    },

    // Import
    async importExcel(file: File, mapping?: any) {
        const formData = new FormData();
        formData.append('file', file);
        if (mapping) formData.append('mapping', JSON.stringify(mapping));

        const res = await fetch(`${AR_API_BASE}/ar/import/excel`, {
            method: 'POST',
            body: formData
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            const error = new Error(errorData.message || 'Failed to import file') as any;
            error.response = { data: errorData };
            throw error;
        }
        return res.json();
    },

    async previewExcel(file: File) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${AR_API_BASE}/ar/import/preview`, {
            method: 'POST',
            body: formData
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            const error = new Error(errorData.message || 'Failed to preview file') as any;
            error.response = { data: errorData };
            throw error;
        }
        return res.json();
    },

    async getImportHistory() {
        const res = await fetch(`${AR_API_BASE}/ar/import/history`);
        if (!res.ok) throw new Error('Failed to fetch history');
        return res.json();
    }
};

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
