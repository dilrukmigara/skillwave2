/**
 * SkillWave Academy Submission Configuration
 * 
 * This file controls where frontend form submissions (Contact, Enrollments, Newsletter) are sent.
 */
export const SUBMISSION_CONFIG = {
  /**
   * Chosen submission method:
   * - 'api': Sends data to the Node/Express backend. (Stores in SQLite locally or MongoDB Atlas in production).
   * - 'google_form': Submits directly to your Google Form in the background (zero backend cost, perfect for Vercel/Netlify/GitHub Pages).
   * - 'google_form_redirect': Directly redirects the user to your Google Form page in a new tab.
   */
  method: 'api' as 'api' | 'google_form' | 'google_form_redirect',

  /**
   * Google Form configuration.
   * Required only if method is set to 'google_form' or 'google_form_redirect'.
   * 
   * How to set up Google Forms:
   * 1. Create a Google Form with 5 fields: "Form Type", "Name", "Phone Number", "Email Address", and "Message".
   * 2. Click the three dots (top right) -> "Get pre-filled link".
   * 3. Enter dummy text in each field (e.g., Form Type: "contact", Name: "name", Phone: "phone", etc.).
   * 4. Click "Get link" and copy the link.
   * 5. Extract the entry IDs (e.g., entry.123456789) and map them below.
   */
  googleForm: {
    // URL to submit forms (ends with /formResponse)
    actionUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfXYZ_EXAMPLE_ID/formResponse',
    
    // URL to view the form (ends with /viewform) - used for redirection
    viewUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfXYZ_EXAMPLE_ID/viewform',

    // Map your form fields to the exact entry IDs from the pre-filled link
    entries: {
      form_type: 'entry.1000001', // ID for Form Type
      name: 'entry.1000002',      // ID for Name
      phone: 'entry.1000003',     // ID for Phone
      email: 'entry.1000004',     // ID for Email
      message: 'entry.1000005',   // ID for Message
    }
  }
};
