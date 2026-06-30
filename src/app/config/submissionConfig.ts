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
    actionUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdJuUPHHfwlQ1P3Ufnm6H9cC-TgNvBoNyQDOIJYDERN33jMUw/formResponse',

    viewUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdJuUPHHfwlQ1P3Ufnm6H9cC-TgNvBoNyQDOIJYDERN33jMUw/viewform',

    entries: {
      form_type: 'entry.1891029657',
      name: 'entry.2118924887',
      phone: 'entry.462119940',
      email: 'entry.1895805292',
      message: 'entry.2054205580',
    }
  }
};
