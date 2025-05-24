import Airtable from 'airtable';

// Airtable configuration - you'll need to set these environment variables
const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID || '';
const AIRTABLE_TABLE_NAME = import.meta.env.VITE_AIRTABLE_TABLE_NAME || 'Orders';

// Initialize Airtable
const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

interface OrderData {
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    fullName: string;
  };
  orderDetails: {
    package: string;
    packagePrice: string;
    packageFeatures: string;
    totalAmount: string;
    digitizingSpeed: string;
    digitizingTime: string;
    digitizingPrice: string;
    addOns: string[];
  };
  paymentMethod: string;
  timestamp: string;
}

export const sendOrderToAirtable = async (orderData: OrderData) => {
  try {
    console.log('📊 AIRTABLE - Sending order data to Airtable:', orderData);

    // Prepare the record data for Airtable
    const record = {
      fields: {
        // Customer Information
        'Customer Name': orderData.customerInfo.fullName,
        'First Name': orderData.customerInfo.firstName,
        'Last Name': orderData.customerInfo.lastName,
        'Email': orderData.customerInfo.email,
        'Phone': orderData.customerInfo.phone,
        'Address': orderData.customerInfo.address,
        'City': orderData.customerInfo.city,
        'State': orderData.customerInfo.state,
        'ZIP Code': orderData.customerInfo.zipCode,
        'Full Address': `${orderData.customerInfo.address}, ${orderData.customerInfo.city}, ${orderData.customerInfo.state} ${orderData.customerInfo.zipCode}`,
        
        // Order Details
        'Package': orderData.orderDetails.package,
        'Package Price': orderData.orderDetails.packagePrice,
        'Package Features': orderData.orderDetails.packageFeatures,
        'Total Amount': orderData.orderDetails.totalAmount,
        
        // Digitizing Information
        'Digitizing Speed': orderData.orderDetails.digitizingSpeed,
        'Digitizing Time': orderData.orderDetails.digitizingTime,
        'Digitizing Price': orderData.orderDetails.digitizingPrice,
        
        // Add-ons
        'Add Ons': orderData.orderDetails.addOns.length > 0 ? orderData.orderDetails.addOns.join(', ') : 'None',
        
        // Payment and Order Info
        'Payment Method': orderData.paymentMethod,
        'Order Date': new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        'Timestamp': orderData.timestamp,
        
        // Status
        'Order Status': 'New Order',
        'Processing Status': 'Pending'
      }
    };

    // Create the record in Airtable
    const createdRecord = await base(AIRTABLE_TABLE_NAME).create(record);
    
    console.log('✅ AIRTABLE SUCCESS - Record created:', createdRecord.getId());
    return createdRecord;
    
  } catch (error) {
    console.error('❌ AIRTABLE ERROR - Failed to create record:', error);
    
    // Log more details about the error
    if (error.statusCode) {
      console.error('❌ AIRTABLE ERROR - Status Code:', error.statusCode);
      console.error('❌ AIRTABLE ERROR - Error Message:', error.message);
    }
    
    // Don't throw the error - we don't want to break the checkout process
    // Just log it for debugging
    console.error('❌ AIRTABLE ERROR - Order data that failed:', JSON.stringify(orderData, null, 2));
    
    // Could optionally send to a fallback system or email alert here
    return null;
  }
};

// Function to test Airtable connection
export const testAirtableConnection = async () => {
  try {
    console.log('🧪 AIRTABLE TEST - Testing connection...');
    
    // Try to fetch the first record to test connection
    const records = await base(AIRTABLE_TABLE_NAME).select({
      maxRecords: 1
    }).firstPage();
    
    console.log('✅ AIRTABLE TEST - Connection successful');
    return true;
  } catch (error) {
    console.error('❌ AIRTABLE TEST - Connection failed:', error);
    return false;
  }
};
