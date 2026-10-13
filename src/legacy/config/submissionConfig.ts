/**
 * SkillWave Academy Submission Configuration
 * 
 * This file holds the Google Form configuration for receiving form submissions
 * (Contact, Course Enrollments, and Newsletter subscription).
 */
export const SUBMISSION_CONFIG = {
  googleForm: {
    // URL to submit forms (ends with /formResponse)
    actionUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdJuUPHHfwlQ1P3Ufnm6H9cC-TgNvBoNyQDOIJYDERN33jMUw/formResponse',
    
    // URL to view the form (ends with /viewform)
    viewUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdJuUPHHfwlQ1P3Ufnm6H9cC-TgNvBoNyQDOIJYDERN33jMUw/viewform',

    // Map your form fields to the exact entry IDs from the pre-filled link
    entries: {
      form_type: 'entry.1891029657',
      name: 'entry.2118924887',
      phone: 'entry.462119940',
      email: 'entry.1895805292',
      message: 'entry.2054205580',
    }
  }
};
