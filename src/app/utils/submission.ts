import { SUBMISSION_CONFIG } from "../config/submissionConfig";

export interface SubmissionData {
  form_type: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
}

/**
 * Submits form data directly to Google Forms in the background.
 * 
 * @param data Submission payload containing form details
 * @returns Promise resolving when submission is complete
 */
export async function submitForm(data: SubmissionData): Promise<{ success: boolean }> {
  const { googleForm } = SUBMISSION_CONFIG;

  // Construct url-encoded form body for Google Forms submission
  const formBody = new URLSearchParams();
  
  // Map payload fields to Google Forms entry IDs
  formBody.append(googleForm.entries.form_type, data.form_type);
  formBody.append(googleForm.entries.name, data.name);
  formBody.append(googleForm.entries.phone, data.phone);
  formBody.append(googleForm.entries.email || "", data.email || "");
  formBody.append(googleForm.entries.message || "", data.message || "");

  // Google Forms requires 'no-cors' mode as it doesn't return CORS headers to localhosts/webapps
  await fetch(googleForm.actionUrl, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formBody,
  });

  // Since 'no-cors' is used, fetch will succeed even though we can't inspect the response content.
  return { success: true };
}
