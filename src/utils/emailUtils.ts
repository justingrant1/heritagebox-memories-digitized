
/**
 * Utility functions for sending emails to HeritageBox
 */

// Format the customer address for better readability
const formatAddress = (customerInfo: any) => {
  return `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zipCode}`;
};

// Format order details for better email presentation
const formatOrderDetails = (data: any, source: string) => {
  console.log('Formatting order details:', { data, source });
  
  if (source === "Order Completed" && data.customerInfo && data.orderDetails) {
    // Flatten the object structure for better Formspree compatibility
    const formattedData = {
      _subject: `HeritageBox Order - ${data.customerInfo.fullName}`,
      source: source,
      
      // Customer Information
      customer_name: data.customerInfo.fullName,
      customer_email: data.customerInfo.email,
      customer_first_name: data.customerInfo.firstName,
      customer_last_name: data.customerInfo.lastName,
      customer_phone: data.customerInfo.phone,
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
      order_summary: `Package: ${data.orderDetails.package} (${data.orderDetails.packagePrice}) | Speed: ${data.orderDetails.digitizingSpeed} (${data.orderDetails.digitizingTime}) | Total: ${data.orderDetails.totalAmount} | Payment: ${data.paymentMethod}`
    };
    
    console.log('Formatted data for Formspree:', formattedData);
    return formattedData;
  }
  
  // For other types of emails (like welcome popup), keep the original data
  return {
    source: source,
    ...data
  };
};

// Send email to HeritageBox
export const sendEmailToHeritageBox = async (data: any, source: string) => {
  // Formspree endpoint for the specific form
  const endpoint = "https://formspree.io/f/mqaqgwjg"; 
  
  try {
    // Log the attempt
    console.log(`Attempting to send email from ${source} to info@heritagebox.com`);
    console.log('Raw data received:', data);
    
    // Format the data for better email readability
    const formattedData = formatOrderDetails(data, source);
    
    console.log('Final formatted data being sent to Formspree:', formattedData);
    
    // Send the email data as JSON
    const response = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(formattedData),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('Formspree response status:', response.status);
    console.log('Formspree response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Email submission failed with status: ${response.status}`, errorText);
      console.error('Full response:', response);
      throw new Error(`Email submission failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const responseData = await response.text();
    console.log('Formspree response data:', responseData);
    
    // Log the success
    console.log(`✅ Email successfully sent to info@heritagebox.com from ${source}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error sending email to Formspree:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      endpoint,
      source
    });
    throw error; // Re-throw to handle in the component
  }
};
