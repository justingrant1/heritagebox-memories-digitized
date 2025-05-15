
/**
 * Utility functions for sending emails to HeritageBox
 */

// Send email to HeritageBox
export const sendEmailToHeritageBox = async (data: any, source: string) => {
  // Formspree endpoint for the specific form
  const endpoint = "https://formspree.io/f/mqaqgwjg"; 
  
  try {
    // Log the attempt
    console.log(`Sending email from ${source} to info@heritagebox.com:`, data);
    
    // Format rich-text for better email readability
    let formattedData = data;
    
    // If it's an order, format the order details for better readability in email
    if (source === "Order Completed" && data.customerInfo && data.orderDetails) {
      formattedData = {
        _subject: `HeritageBox Order - ${data.customerInfo.fullName}`,
        customerName: data.customerInfo.fullName,
        customerEmail: data.customerInfo.email,
        customerAddress: `${data.customerInfo.address}, ${data.customerInfo.city}, ${data.customerInfo.state} ${data.customerInfo.zipCode}`,
        packageSelected: `${data.orderDetails.package} - ${data.orderDetails.packagePrice}`,
        digitizingSpeed: `${data.orderDetails.digitizingSpeed} (${data.orderDetails.digitizingTime}) - ${data.orderDetails.digitizingPrice}`,
        addOns: data.orderDetails.addOns.length > 0 ? data.orderDetails.addOns.join(", ") : "None",
        totalAmount: data.orderDetails.totalAmount,
        paymentMethod: data.paymentMethod,
        orderDate: new Date().toLocaleString(),
        features: data.orderDetails.packageFeatures
      };
    }
    
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
