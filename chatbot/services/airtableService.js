const { v4: uuidv4 } = require('uuid');

class AirtableService {
    constructor() {
        this.baseId = process.env.AIRTABLE_BASE_ID || 'appFMHAYZrTskpmdX';
        this.tables = {
            customers: 'tblUS7uf11axEmL56',
            products: 'tblJ0hgzvDXWgQGmK',
            orders: 'tblTq25QawVDHTTkV',
            orderItems: 'tblgV4XGeQE3VL9CW',
            chatTranscripts: 'tbl6gHHlvSwx4gQpB'
        };
    }

    // Customer Management
    async findCustomer(email, phone, name) {
        try {
            const baseId = this.baseId;
            const tableId = this.tables.customers;
            
            let filterFormula = '';
            if (email) {
                filterFormula = `{Email}='${email}'`;
            } else if (phone) {
                filterFormula = `{Phone}='${phone}'`;
            } else if (name) {
                filterFormula = `SEARCH('${name.toLowerCase()}', LOWER({Name})) > 0`;
            }

            // This would use the MCP tool in real implementation
            // For now, simulate the response structure
            return {
                found: false,
                customer: null,
                message: 'Customer search functionality ready - will use MCP tools when connected'
            };
        } catch (error) {
            console.error('Customer search error:', error);
            return { found: false, customer: null, error: error.message };
        }
    }

    async createLead(customerData, inquiryDetails) {
        try {
            const leadData = {
                'Name': customerData.name || 'Unknown',
                'Email': customerData.email || '',
                'Phone': customerData.phone || '',
                'Notes': `Chat Inquiry: ${inquiryDetails.summary}\n\nFull Transcript: ${inquiryDetails.transcript}`,
                'Status': inquiryDetails.isHighValue ? 'High Priority Lead' : 'New Lead',
                'Assignee': inquiryDetails.isHighValue ? 'Sales Team' : 'Support Team'
            };

            // This would create a customer record via MCP
            console.log('Would create lead:', leadData);
            return { success: true, leadId: uuidv4() };
        } catch (error) {
            console.error('Lead creation error:', error);
            return { success: false, error: error.message };
        }
    }

    // Order Management
    async findOrdersByCustomer(email, orderNumber, lastName) {
        try {
            let filterFormula = '';
            if (orderNumber) {
                filterFormula = `{Order Number}='${orderNumber}'`;
            } else if (email) {
                filterFormula = `{Customer Email}='${email}'`; // Assuming linked customer email
            } else if (lastName) {
                filterFormula = `SEARCH('${lastName}', {Customer Name}) > 0`;
            }

            // This would use MCP tools to search orders
            console.log('Would search orders with filter:', filterFormula);
            
            // Simulate realistic order data
            if (orderNumber === '12345' || email === 'test@example.com') {
                return {
                    found: true,
                    orders: [{
                        orderNumber: '12345',
                        status: 'In Progress',
                        estimatedCompletion: '2025-01-25',
                        totalItems: 150,
                        serviceType: 'Photo Scanning',
                        customerName: 'John Doe',
                        customerEmail: 'test@example.com'
                    }]
                };
            }

            return { found: false, orders: [] };
        } catch (error) {
            console.error('Order search error:', error);
            return { found: false, orders: [], error: error.message };
        }
    }

    // Product & Pricing Management
    async getProductCatalog() {
        try {
            // This would fetch all products via MCP
            return {
                success: true,
                products: [
                    {
                        name: 'Standard Photo Scanning',
                        price: 0.50,
                        description: 'Up to 4x6 photos, 600 DPI, color correction',
                        sku: 'PHOTO-STD'
                    },
                    {
                        name: 'Large Photo Scanning',
                        price: 1.00,
                        description: '8x10+ photos, 600 DPI, color correction',
                        sku: 'PHOTO-LRG'
                    },
                    {
                        name: 'Slide/Negative Scanning',
                        price: 0.75,
                        description: '35mm slides and negatives, high resolution',
                        sku: 'SLIDE-NEG'
                    },
                    {
                        name: 'VHS Transfer',
                        price: 25.00,
                        description: 'VHS to digital, includes basic cleanup',
                        sku: 'VHS-XFER'
                    },
                    {
                        name: '8mm Film Transfer',
                        price: 50.00,
                        description: '8mm film to digital, professional restoration',
                        sku: 'FILM-8MM'
                    }
                ]
            };
        } catch (error) {
            console.error('Product catalog error:', error);
            return { success: false, error: error.message };
        }
    }

    async generateQuote(items) {
        try {
            const products = await this.getProductCatalog();
            if (!products.success) {
                throw new Error('Could not load pricing data');
            }

            let totalCost = 0;
            let quoteItems = [];

            for (const item of items) {
                const product = products.products.find(p => 
                    p.sku === item.type || p.name.toLowerCase().includes(item.type.toLowerCase())
                );

                if (product) {
                    const quantity = item.quantity;
                    let unitPrice = product.price;
                    
                    // Apply bulk discounts
                    if (quantity >= 500) {
                        unitPrice = unitPrice * 0.85; // 15% discount
                    } else if (quantity >= 100) {
                        unitPrice = unitPrice * 0.90; // 10% discount
                    } else if (quantity >= 50) {
                        unitPrice = unitPrice * 0.95; // 5% discount
                    }

                    const lineTotal = quantity * unitPrice;
                    totalCost += lineTotal;

                    quoteItems.push({
                        service: product.name,
                        quantity: quantity,
                        unitPrice: unitPrice,
                        originalPrice: product.price,
                        lineTotal: lineTotal,
                        discount: product.price !== unitPrice ? Math.round((1 - unitPrice/product.price) * 100) : 0
                    });
                }
            }

            return {
                success: true,
                quote: {
                    items: quoteItems,
                    subtotal: totalCost,
                    rushFee: 0,
                    total: totalCost,
                    estimatedTurnaround: this.calculateTurnaround(items),
                    quoteId: uuidv4(),
                    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                }
            };
        } catch (error) {
            console.error('Quote generation error:', error);
            return { success: false, error: error.message };
        }
    }

    calculateTurnaround(items) {
        // Business logic for turnaround estimation
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        
        if (totalItems > 1000) return '3-4 weeks';
        if (totalItems > 500) return '2-3 weeks';
        if (items.some(item => item.type.includes('video') || item.type.includes('film'))) {
            return '10-14 business days';
        }
        return '5-7 business days';
    }

    // Conversation Logging
    async logConversation(sessionId, messages, customerInfo = {}) {
        try {
            const transcript = messages.map(msg => 
                `[${msg.timestamp?.toISOString() || new Date().toISOString()}] ${msg.sender.toUpperCase()}: ${msg.content}`
            ).join('\n\n');

            const logData = {
                'SessionID': sessionId,
                'Transcript': transcript,
                'Status': 'Active',
                'CustomerEmail': customerInfo.email || ''
            };

            console.log('Would log conversation:', logData);
            return { success: true, recordId: uuidv4() };
        } catch (error) {
            console.error('Conversation logging error:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = AirtableService;
