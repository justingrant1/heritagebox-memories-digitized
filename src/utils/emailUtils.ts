
import emailjs from 'emailjs-com';

/**
 * Utility functions for sending emails to HeritageBox using EmailJS
 */

// Send email to HeritageBox
export const sendEmailToHeritageBox = async (data: any, source: string) => {
  // EmailJS service information
  const serviceId = "service_heritagebox"; // You'll need to replace with your actual EmailJS service ID
  const templateId = "template_heritagebox"; // You'll need to replace with your actual EmailJS template ID
  const userId = "user_heritagebox"; // You'll need to replace with your actual EmailJS user ID
  
  try {
    // Log the attempt
    console.log(`Sending email from ${source} to info@heritagebox.com:`, data);
    
    // Prepare the template parameters
    const templateParams = {
      _subject: `HeritageBox - ${source}`,
      source: source,
      date: new Date().toISOString(),
      ...data
    };
    
    // Send the email using EmailJS
    const response = await emailjs.send(serviceId, templateId, templateParams, userId);
    
    if (response.status !== 200) {
      console.error(`Email submission failed with status: ${response.status}`);
      throw new Error(`Email submission failed: ${response.status} ${response.text}`);
    }
    
    // Log the success
    console.log(`Email successfully sent to info@heritagebox.com from ${source}`);
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Re-throw to handle in the component
  }
};
