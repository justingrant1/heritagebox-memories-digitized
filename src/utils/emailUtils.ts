
/**
 * Utility functions for simulating email sending without external services
 */

// Simulate sending an email
export const sendEmailToHeritageBox = async (data: any, source: string) => {
  try {
    // Log the attempt for debugging purposes
    console.log(`Simulating email from ${source}:`, data);
    
    // Simulate network delay to make the experience realistic
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Store submission in localStorage for potential later retrieval
    const submissions = JSON.parse(localStorage.getItem('form_submissions') || '[]');
    submissions.push({
      source,
      timestamp: new Date().toISOString(),
      data
    });
    localStorage.setItem('form_submissions', JSON.stringify(submissions));
    
    // Log the success
    console.log(`Form submission from ${source} stored successfully`);
    
    return true;
  } catch (error) {
    console.error('Error processing form submission:', error);
    throw error; // Re-throw to handle in the component
  }
};
