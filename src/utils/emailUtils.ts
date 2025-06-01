/**
 * Utility functions for sending emails to HeritageBox
 */

// Format the customer address for better readability
const formatAddress = (customerInfo: any) => {
  return `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zipCode}`;
};

// Format order details for better email presentation
const formatOrderDetails = (data: any, source: string) => {
  if (source === "Order Completed" && data.customerInfo && data.orderDetails) {
    return {
      _subject: `HeritageBox Order - ${data.customerInfo.fullName}`,
      customerName: data.customerInfo.fullName,
      customerEmail: data.customerInfo.email,
      customerAddress: formatAddress(data.customerInfo),
      packageSelected: `${data.orderDetails.package} - ${data.orderDetails.packagePrice}`,
      digitizingSpeed: `${data.orderDetails.digitizingSpeed} (${data.orderDetails.digitizingTime}) - ${data.orderDetails.digitizingPrice}`,
      addOns: data.orderDetails.addOns.length > 0 ? data.orderDetails.addOns.join(", ") : "None",
      totalAmount: data.orderDetails.totalAmount,
      paymentMethod: data.paymentMethod,
      orderDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      features: data.orderDetails.packageFeatures
    };
  }
  
  // For other types of emails, keep the original data
  return data;
};

// Send email to HeritageBox
export const sendEmailToHeritageBox = async (data: any, source: string) => {
  // Formspree endpoint for the specific form
  const endpoint = "https://formspree.io/f/mqaqgwjg"; 
  
  try {
    // Log the attempt
    console.log(`Sending email from ${source} to info@heritagebox.com:`, data);
    
    // Format rich-text for better email readability
    const formattedData = formatOrderDetails(data, source);
    
    // Send the email data as JSON instead of FormData
    const response = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        _subject: `HeritageBox - ${source}`,
        source: source,
        date: new Date().toISOString(),
        ...formattedData
      }),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Email submission failed with status: ${response.status}`, errorText);
      throw new Error(`Email submission failed: ${response.status} ${response.statusText}`);
    }
    
    // Log the success
    console.log(`Email successfully sent to info@heritagebox.com from ${source}`);
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Re-throw to handle in the component
  }
};
