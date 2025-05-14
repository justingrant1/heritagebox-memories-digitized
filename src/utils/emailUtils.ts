
/**
 * Utility functions for sending emails to HeritageBox
 */

// Send email to HeritageBox
export const sendEmailToHeritageBox = async (data: any, source: string) => {
  const endpoint = "https://formspree.io/f/info@heritagebox.com";
  
  try {
    // Log the attempt
    console.log(`Sending email from ${source} to info@heritagebox.com:`, data);
    
    // Prepare the email data
    const formData = new FormData();
    
    // Add common fields
    formData.append('_subject', `HeritageBox - ${source}`);
    formData.append('source', source);
    formData.append('date', new Date().toISOString());
    
    // Add all data fields
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    
    // Send the form data to the email endpoint
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Email submission failed: ${response.statusText}`);
    }
    
    // Log the success
    console.log(`Email successfully sent to info@heritagebox.com from ${source}`);
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Re-throw to handle in the component
  }
};
