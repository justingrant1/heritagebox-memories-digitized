
/**
 * Utility functions for sending emails to Brevo
 */

// Send email data to Brevo API
export const sendEmailToHeritageBox = async (data: any, source: string) => {
  try {
    // Log the attempt for debugging purposes
    console.log(`Sending email from ${source} to Brevo:`, data);
    
    // Get API key and email settings from localStorage
    const apiKey = localStorage.getItem('brevo_api_key');
    const recipientEmail = localStorage.getItem('brevo_recipient_email');
    const senderEmail = localStorage.getItem('brevo_sender_email') || 'website@example.com';
    
    if (!apiKey || !recipientEmail) {
      console.warn('Brevo API key or recipient email not set. Storing submission locally only.');
      // Store submission in localStorage as fallback
      const submissions = JSON.parse(localStorage.getItem('form_submissions') || '[]');
      submissions.push({
        source,
        timestamp: new Date().toISOString(),
        data
      });
      localStorage.setItem('form_submissions', JSON.stringify(submissions));
      return true;
    }
    
    // Format the data object into a readable HTML string
    const formatDataToHtml = (data: any) => {
      let html = '';
      for (const [key, value] of Object.entries(data)) {
        html += `<p><strong>${key}:</strong> ${value}</p>`;
      }
      return html;
    };
    
    // Prepare the payload for Brevo API
    const payload = {
      sender: {
        name: "HeritageBox Website",
        email: senderEmail
      },
      to: [
        {
          email: recipientEmail,
          name: "HeritageBox Team"
        }
      ],
      subject: `New ${source} submission from HeritageBox website`,
      htmlContent: `
        <h2>New submission from ${source}</h2>
        <p>Submitted on: ${new Date().toLocaleString()}</p>
        <h3>Submission Details:</h3>
        ${formatDataToHtml(data)}
      `
    };

    // Make API request to Brevo
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brevo API error (${response.status}): ${errorText}`);
    }

    console.log(`Form submission from ${source} sent to Brevo successfully`);
    
    // Also store submission in localStorage as backup
    const submissions = JSON.parse(localStorage.getItem('form_submissions') || '[]');
    submissions.push({
      source,
      timestamp: new Date().toISOString(),
      data,
      sent_to_brevo: true
    });
    localStorage.setItem('form_submissions', JSON.stringify(submissions));
    
    return true;
  } catch (error) {
    console.error('Error sending form to Brevo:', error);
    
    // Store submission in localStorage even if API call fails
    const submissions = JSON.parse(localStorage.getItem('form_submissions') || '[]');
    submissions.push({
      source,
      timestamp: new Date().toISOString(),
      data,
      error: (error as Error).message
    });
    localStorage.setItem('form_submissions', JSON.stringify(submissions));
    
    throw error; // Re-throw to handle in the component
  }
};
