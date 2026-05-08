/**
 * Portfolio API Layer
 * Handles contact form submissions via Brevo email backend + Supabase database.
 */

/**
 * Backend server URL for the contact form API.
 * Update this when deploying to production (e.g., Render, Vercel, etc.)
 */
const CONTACT_API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001/api/contact'
    : 'https://portfolio-manmeet.onrender.com/api/contact';

/**
 * Validates an email address format.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Submit a contact form message.
 * 1. Sends to the backend server (Brevo) for email delivery
 * 2. Also saves to Supabase as a backup database record
 * 
 * @param {{ name: string, email: string, subject: string, message: string }} data
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
async function submitContact(data) {
    // Validation
    if (!data.name || !data.name.trim()) {
        return { success: false, error: 'Name is required.' };
    }
    if (!data.email || !data.email.trim()) {
        return { success: false, error: 'Email is required.' };
    }
    if (!isValidEmail(data.email.trim())) {
        return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!data.message || !data.message.trim()) {
        return { success: false, error: 'Message is required.' };
    }

    const cleanData = {
        name: data.name.trim(),
        email: data.email.trim(),
        subject: data.subject ? data.subject.trim() : '',
        message: data.message.trim()
    };

    try {
        // 1. Send to backend server (Brevo email delivery)
        const response = await fetch(CONTACT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cleanData)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            console.error('Backend error:', result);
            return { success: false, error: result.error || 'Failed to send message. Please try again.' };
        }

        // 2. Also save to Supabase as a database backup (non-blocking)
        try {
            await supabaseClient
                .from('contacts')
                .insert([{
                    name: cleanData.name,
                    email: cleanData.email,
                    subject: cleanData.subject || null,
                    message: cleanData.message
                }]);
        } catch (dbErr) {
            // Don't fail the submission if Supabase backup fails
            console.warn('Supabase backup save failed (non-critical):', dbErr);
        }

        return { success: true };
    } catch (err) {
        console.error('Network error:', err);
        return { success: false, error: 'Network error. Please check your connection and try again.' };
    }
}
