// Main Application JavaScript
class ElectricityBillingSystem {
    constructor() {
        this.currentUser = null;
        this.customers = [];
        this.bills = [];
        this.settings = {};
        this.init();
    }

    async init() {
        await this.loadUserData();
        await this.loadDemoData();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
    }

    async loadUserData() {
        const user = JSON.parse(localStorage.getItem('user')) || {
            username: 'admin',
            role: 'admin',
            name: 'Admin User',
            token: 'demo_token'
        };
        this.currentUser = user;
        return user;
    }

    async loadDemoData() {
        // Load demo customers
        this.customers = [
            {
                id: 1,
                consumerNo: 'CUST20240001',
                name: 'John Doe',
                address: '123 Main Street, Mumbai',
                phone: '+91 9876543210',
                email: 'john@example.com',
                connectionType: 'Domestic',
                status: 'Active',
                createdAt: '2024-01-15'
            },
            {
                id: 2,
                consumerNo: 'CUST20240002',
                name: 'Sarah Smith',
                address: '456 Park Avenue, Delhi',
                phone: '+91 9876543211',
                email: 'sarah@example.com',
                connectionType: 'Commercial',
                status: 'Active',
                createdAt: '2024-01-20'
            }
        ];

        // Load demo bills
        this.bills = [
            {
                id: 1,
                billNo: 'BILL202403001',
                customerId: 1,
                customerName: 'John Doe',
                units: 250,
                unitRate: 5.0,
                fixedCharge: 50,
                totalAmount: 1250,
                dueDate: '2024-04-15',
                status: 'Paid',
                paidAmount: 1250,
                paymentDate: '2024-03-20'
            },
            {
                id: 2,
                billNo: 'BILL202403002',
                customerId: 2,
                customerName: 'Sarah Smith',
                units: 500,
                unitRate: 7.5,
                fixedCharge: 100,
                totalAmount: 3850,
                dueDate: '2024-04-10',
                status: 'Pending',
                paidAmount: 0,
                paymentDate: null
            }
        ];

        // Load settings
        this.settings = {
            tariffs: {
                domestic: { unitRate: 5.0, fixedCharge: 50 },
                commercial: { unitRate: 7.5, fixedCharge: 100 },
                industrial: { unitRate: 9.0, fixedCharge: 200 }
            },
            lateFeePercentage: 2,
            dueDays: 30
        };
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.querySelector('.search-box input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Form submissions
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        });

        // Modal handlers
        document.querySelectorAll('[data-modal]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.target.closest('[data-modal]').dataset.modal;
                this.showModal(modalId);
            });
        });

        // Close modal buttons
        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.hideModal(modal.id);
            });
        });

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    setupRealTimeUpdates() {
        // Update time
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 60000);

        // Simulate live updates
        setInterval(() => this.simulateLiveData(), 30000);
    }

    updateDateTime() {
        const now = new Date();
        const dateTimeElements = document.querySelectorAll('.current-datetime');
        dateTimeElements.forEach(el => {
            el.textContent = now.toLocaleString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        });
    }

    async handleSearch(query) {
        if (!query || query.length < 2) return;

        // Simulate API search
        const results = await this.searchData(query);
        this.displaySearchResults(results);
    }

    async searchData(query) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        const searchQuery = query.toLowerCase();
        return {
            customers: this.customers.filter(customer =>
                customer.name.toLowerCase().includes(searchQuery) ||
                customer.consumerNo.toLowerCase().includes(searchQuery) ||
                customer.phone.includes(searchQuery)
            ),
            bills: this.bills.filter(bill =>
                bill.billNo.toLowerCase().includes(searchQuery) ||
                bill.customerName.toLowerCase().includes(searchQuery)
            )
        };
    }

    displaySearchResults(results) {
        // This would display search results in a dropdown or modal
        console.log('Search results:', results);
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const formId = form.id;

        switch(formId) {
            case 'addCustomerForm':
                await this.addCustomer(formData);
                break;
            case 'meterReadingForm':
                await this.addMeterReading(formData);
                break;
            case 'billForm':
                await this.generateBill(formData);
                break;
            case 'paymentForm':
                await this.processPayment(formData);
                break;
        }
    }

    async addCustomer(formData) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const customer = {
            id: this.customers.length + 1,
            consumerNo: `CUST${new Date().getFullYear()}${String(this.customers.length + 1).padStart(4, '0')}`,
            name: formData.get('name'),
            address: formData.get('address'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            connectionType: formData.get('connectionType'),
            status: 'Active',
            createdAt: new Date().toISOString().split('T')[0]
        };

        this.customers.push(customer);
        this.showToast('Success', 'Customer added successfully', 'success');
        this.hideModal('addCustomerModal');

        // Update UI
        this.updateCustomerStats();
    }

    async addMeterReading(formData) {
        const customerId = parseInt(formData.get('customerId'));
        const currentReading = parseInt(formData.get('currentReading'));
        
        // Find customer
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) {
            this.showToast('Error', 'Customer not found', 'error');
            return;
        }

        // Calculate units (simulate previous reading)
        const previousReading = 1000; // This would come from database
        const units = currentReading - previousReading;

        if (units < 0) {
            this.showToast('Error', 'Current reading must be greater than previous reading', 'error');
            return;
        }

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        this.showToast('Success', 'Meter reading recorded successfully', 'success');
        this.hideModal('meterReadingModal');

        // Auto-generate bill
        this.autoGenerateBill(customer, units);
    }

    autoGenerateBill(customer, units) {
        const tariff = this.settings.tariffs[customer.connectionType.toLowerCase()];
        const totalAmount = (units * tariff.unitRate) + tariff.fixedCharge;

        const bill = {
            id: this.bills.length + 1,
            billNo: `BILL${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(this.bills.length + 1).padStart(3, '0')}`,
            customerId: customer.id,
            customerName: customer.name,
            units: units,
            unitRate: tariff.unitRate,
            fixedCharge: tariff.fixedCharge,
            totalAmount: totalAmount,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'Pending',
            paidAmount: 0,
            paymentDate: null
        };

        this.bills.push(bill);
        this.showToast('Bill Generated', `Bill ${bill.billNo} created for ${customer.name}`, 'info');
    }

    async generateBill(formData) {
        // Similar to autoGenerateBill but with manual form data
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.showToast('Success', 'Bill generated successfully', 'success');
        this.hideModal('generateBillModal');
    }

    async processPayment(formData) {
        const billId = parseInt(formData.get('billId'));
        const amount = parseFloat(formData.get('amount'));
        
        // Find bill
        const billIndex = this.bills.findIndex(b => b.id === billId);
        if (billIndex === -1) {
            this.showToast('Error', 'Bill not found', 'error');
            return;
        }

        const bill = this.bills[billIndex];
        
        // Update bill status
        if (amount >= bill.totalAmount) {
            bill.status = 'Paid';
            bill.paidAmount = bill.totalAmount;
        } else if (amount > 0) {
            bill.status = 'Partial';
            bill.paidAmount = amount;
        }

        bill.paymentDate = new Date().toISOString().split('T')[0];

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        this.bills[billIndex] = bill;
        this.showToast('Success', 'Payment processed successfully', 'success');
        this.hideModal('processPaymentModal');

        // Update stats
        this.updateRevenueStats();
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    showToast(title, message, type = 'success') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation' : 'info'}-circle"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to DOM
        const toastContainer = document.getElementById('toast-container') || this.createToastContainer();
        toastContainer.appendChild(toast);

        // Add close functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => toast.remove());

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
        return container;
    }

    updateCustomerStats() {
        const customerCount = this.customers.length;
        const activeCount = this.customers.filter(c => c.status === 'Active').length;
        
        // Update UI elements
        const customerStats = document.getElementById('customerStats');
        if (customerStats) {
            customerStats.innerHTML = `
                <div class="stat-card">
                    <div class="stat-value">${customerCount}</div>
                    <div class="stat-label">Total Customers</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${activeCount}</div>
                    <div class="stat-label">Active Connections</div>
                </div>
            `;
        }
    }

    updateRevenueStats() {
        const totalRevenue = this.bills
            .filter(b => b.status === 'Paid')
            .reduce((sum, bill) => sum + bill.totalAmount, 0);
        
        const pendingAmount = this.bills
            .filter(b => b.status === 'Pending' || b.status === 'Partial')
            .reduce((sum, bill) => sum + (bill.totalAmount - bill.paidAmount), 0);

        // Update UI elements
        const revenueElement = document.querySelector('[data-stat="revenue"]');
        if (revenueElement) {
            revenueElement.textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;
        }

        const pendingElement = document.querySelector('[data-stat="pending"]');
        if (pendingElement) {
            pendingElement.textContent = `₹${pendingAmount.toLocaleString('en-IN')}`;
        }
    }

    simulateLiveData() {
        // Randomly update some stats
        const statsToUpdate = ['customers', 'revenue', 'consumption'];
        const randomStat = statsToUpdate[Math.floor(Math.random() * statsToUpdate.length)];

        switch(randomStat) {
            case 'customers':
                // Simulate new customer
                if (Math.random() > 0.7) {
                    this.showToast('New Customer', 'A new customer has registered', 'info');
                }
                break;
            case 'revenue':
                // Simulate payment received
                if (Math.random() > 0.8) {
                    this.showToast('Payment Received', 'A bill payment has been processed', 'success');
                }
                break;
            case 'consumption':
                // Simulate high consumption alert
                if (Math.random() > 0.9) {
                    this.showToast('High Consumption', 'Alert: Unusual consumption pattern detected', 'warning');
                }
                break;
        }
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        }
    }

    // Export functions
    exportToPDF(data, type) {
        this.showToast('Export Started', `Generating ${type} PDF report...`, 'info');
        
        // Simulate PDF generation
        setTimeout(() => {
            this.showToast('Export Complete', `${type} report has been downloaded`, 'success');
        }, 2000);
    }

    exportToExcel(data, type) {
        this.showToast('Export Started', `Generating ${type} Excel report...`, 'info');
        
        // Simulate Excel generation
        setTimeout(() => {
            this.showToast('Export Complete', `${type} report has been downloaded`, 'success');
        }, 2000);
    }

    // Report generation
    generateMonthlyReport(month, year) {
        const monthlyBills = this.bills.filter(bill => {
            const billDate = new Date(bill.dueDate);
            return billDate.getMonth() + 1 === month && billDate.getFullYear() === year;
        });

        const report = {
            month: `${month}/${year}`,
            totalBills: monthlyBills.length,
            totalRevenue: monthlyBills.reduce((sum, bill) => sum + bill.totalAmount, 0),
            paidBills: monthlyBills.filter(b => b.status === 'Paid').length,
            pendingBills: monthlyBills.filter(b => b.status !== 'Paid').length
        };

        return report;
    }

    generateCustomerReport(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) return null;

        const customerBills = this.bills.filter(bill => bill.customerId === customerId);
        
        return {
            customer: customer,
            totalBills: customerBills.length,
            totalConsumption: customerBills.reduce((sum, bill) => sum + bill.units, 0),
            totalAmount: customerBills.reduce((sum, bill) => sum + bill.totalAmount, 0),
            paidAmount: customerBills.filter(b => b.status === 'Paid').reduce((sum, bill) => sum + bill.totalAmount, 0),
            pendingAmount: customerBills.filter(b => b.status !== 'Paid').reduce((sum, bill) => sum + (bill.totalAmount - bill.paidAmount), 0),
            bills: customerBills
        };
    }
}

// Initialize the application
let billingSystem;

document.addEventListener('DOMContentLoaded', () => {
    billingSystem = new ElectricityBillingSystem();
    
    // Add global helper functions
    window.showModal = (modalId) => billingSystem.showModal(modalId);
    window.hideModal = (modalId) => billingSystem.hideModal(modalId);
    window.generateDemoBill = () => billingSystem.generateDemoBill();
    window.processDemoPayment = () => billingSystem.processDemoPayment();
    window.exportData = (type) => billingSystem.exportToPDF([], type);
    window.logout = () => billingSystem.logout();
});

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function calculateUnits(previous, current) {
    return Math.max(0, current - previous);
}

function calculateBillAmount(units, tariff) {
    return (units * tariff.unitRate) + tariff.fixedCharge;
}

function calculateLateFee(amount, daysLate, percentage) {
    return amount * (percentage / 100) * daysLate;
}

// Form validation
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            highlightInvalid(input);
        } else {
            removeHighlight(input);
        }
    });

    return isValid;
}

function highlightInvalid(element) {
    element.style.borderColor = '#e74c3c';
    element.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.1)';
}

function removeHighlight(element) {
    element.style.borderColor = '';
    element.style.boxShadow = '';
}

// Chart initialization helper
function createChart(ctx, type, data, options) {
    return new Chart(ctx, {
        type: type,
        data: data,
        options: options
    });
}

// Generate random data for demo
function generateRandomData(count, min, max) {
    return Array.from({ length: count }, () => 
        Math.floor(Math.random() * (max - min + 1)) + min
    );
}

// Theme management
const themeManager = {
    currentTheme: 'light',

    init() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    },

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateThemeToggle();
    },

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    },

    updateThemeToggle() {
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            if (this.currentTheme === 'dark') {
                icon.className = 'fas fa-sun';
                toggleBtn.title = 'Switch to light mode';
            } else {
                icon.className = 'fas fa-moon';
                toggleBtn.title = 'Switch to dark mode';
            }
        }
    }
};

// Initialize theme manager
themeManager.init();

// Export for use in console
window.ElectricityBillingSystem = ElectricityBillingSystem;
window.themeManager = themeManager;