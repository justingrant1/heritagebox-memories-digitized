
/**
 * Utility functions for sending emails to HeritageBox
 */

// Generate a unique order ID
const generateOrderId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `HB-${timestamp}-${random}`;
};

// Format the customer address for better readability
const formatAddress = (customerInfo: any) => {
  return `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zipCode}`;
};

// Format order details for better email presentation
const formatOrderDetails = (data: any, source: string) => {
  console.log('📧 FORMSPREE DEBUG - formatOrderDetails called with:', { 
    source, 
    dataKeys: Object.keys(data),
    fullData: data 
  });
  
  if (source === "Order Completed" && data.customerInfo && data.orderDetails) {
    console.log('📧 FORMSPREE DEBUG - Customer Info received:', data.customerInfo);
    console.log('📧 FORMSPREE DEBUG - Order Details received:', data.orderDetails);
    
    // Generate order ID if not provided
    const orderId = data.orderId || generateOrderId();
    console.log('📧 FORMSPREE DEBUG - Order ID:', orderId);
    
    // Flatten the object structure for better Formspree compatibility
    const formattedData = {
      _subject: `🎯 NEW HERITAGEBOX ORDER - ${orderId} - ${data.customerInfo.fullName}`,
      source: source,
      
      // Order Identification
      order_id: orderId,
      
      // Customer Information
      customer_name: data.customerInfo.fullName,
      customer_email: data.customerInfo.email,
      customer_first_name: data.customerInfo.firstName,
      customer_last_name: data.customerInfo.lastName,
      customer_phone: data.customerInfo.phone || 'Not provided',
      customer_address: data.customerInfo.address,
      customer_city: data.customerInfo.city,
      customer_state: data.customerInfo.state,
      customer_zip: data.customerInfo.zipCode,
      customer_full_address: formatAddress(data.customerInfo),
      
      // Order Details
      package_selected: data.orderDetails.package,
      package_price: data.orderDetails.packagePrice,
      package_features: data.orderDetails.packageFeatures,
      
      // Digitizing Information
      digitizing_speed: data.orderDetails.digitizingSpeed,
      digitizing_time: data.orderDetails.digitizingTime,
      digitizing_price: data.orderDetails.digitizingPrice,
      
      // Add-ons and Total
      add_ons: data.orderDetails.addOns.length > 0 ? data.orderDetails.addOns.join("; ") : "None",
      total_amount: data.orderDetails.totalAmount,
      
      // Payment and Order Info
      payment_method: data.paymentMethod,
      order_date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      timestamp: data.timestamp,
      
      // Additional context
      order_summary: `Order ID: ${orderId} | Package: ${data.orderDetails.package} (${data.orderDetails.packagePrice}) | Speed: ${data.orderDetails.digitizingSpeed} (${data.orderDetails.digitizingTime}) | Total: ${data.orderDetails.totalAmount} | Payment: ${data.paymentMethod}`,
      
      // Debug info
      form_source: 'checkout_order_completion',
      debug_timestamp: new Date().toISOString()
    };
    
    console.log('📧 FORMSPREE DEBUG - Final formatted data with Order ID:', formattedData);
    return formattedData;
  }
  
  // For other types of emails (like welcome popup), keep the original data
  console.log('📧 FORMSPREE DEBUG - Using original data for source:', source);
  return {
    _subject: `HeritageBox - ${source}`,
    source: source,
    ...data
  };
};

// Send email to HeritageBox
export const sendEmailToHeritageBox = async (data: any, source: string) => {
  // Formspree endpoint for the specific form
  const endpoint = "https://formspree.io/f/mqaqgwjg"; 
  
  try {
    // Log the attempt with more detail
    console.log('🚀 FORMSPREE DEBUG - Starting email send process');
    console.log('📧 FORMSPREE DEBUG - Source:', source);
    console.log('📧 FORMSPREE DEBUG - Endpoint:', endpoint);
    console.log('📧 FORMSPREE DEBUG - Raw input data:', JSON.stringify(data, null, 2));
    
    // Format the data for better email readability
    const formattedData = formatOrderDetails(data, source);
    
    console.log('📤 FORMSPREE DEBUG - Sending to Formspree:', JSON.stringify(formattedData, null, 2));
    
    // Send the email data as JSON
    const response = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(formattedData),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('📬 FORMSPREE DEBUG - Response status:', response.status);
    console.log('📬 FORMSPREE DEBUG - Response ok:', response.ok);
    console.log('📬 FORMSPREE DEBUG - Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ FORMSPREE ERROR - Response details:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`Formspree submission failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const responseData = await response.text();
    console.log('✅ FORMSPREE SUCCESS - Response data:', responseData);
    
    // Log the success
    console.log(`✅ FORMSPREE SUCCESS - Email successfully sent to info@heritagebox.com from ${source}`);
    
    return true;
  } catch (error) {
    console.error('❌ FORMSPREE ERROR - Failed to send email:', error);
    console.error('❌ FORMSPREE ERROR - Error details:', {
      message: error.message,
      stack: error.stack,
      endpoint,
      source,
      inputData: data
    });
    throw error; // Re-throw to handle in the component
  }
};

// Export the generateOrderId function for use in other modules
export { generateOrderId };
