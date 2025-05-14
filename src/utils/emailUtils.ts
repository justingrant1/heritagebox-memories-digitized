
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
    
    // Send the email data as JSON instead of FormData
    const response = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        _subject: `HeritageBox - ${source}`,
        source: source,
        date: new Date().toISOString(),
        ...data
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
