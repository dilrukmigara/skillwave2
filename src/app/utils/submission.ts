import { SUBMISSION_CONFIG } from "../config/submissionConfig";

export interface SubmissionData {
  form_type: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
}

/**
 * Submits form data according to the configured submission method.
 * 
 * @param data Submission payload containing form details
 * @returns Promise resolving when submission is complete
 */
export async function submitForm(data: SubmissionData): Promise<{ success: boolean; redirected?: boolean }> {
  const { method, googleForm } = SUBMISSION_CONFIG;

  if (method === "api") {
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API submission failed with status: ${response.status}`);
    }

    return { success: true };
  } 
  
  if (method === "google_form") {
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
  
  if (method === "google_form_redirect") {
    // Generate pre-filled URL parameters
    const params = new URLSearchParams();
    params.append(googleForm.entries.form_type, data.form_type);
    params.append(googleForm.entries.name, data.name);
    params.append(googleForm.entries.phone, data.phone);
    params.append(googleForm.entries.email || "", data.email || "");
    params.append(googleForm.entries.message || "", data.message || "");

    const redirectUrl = `${googleForm.viewUrl}?${params.toString()}`;
    window.open(redirectUrl, "_blank");

    return { success: true, redirected: true };
  }

  throw new Error(`Unsupported submission method: ${method}`);
}
