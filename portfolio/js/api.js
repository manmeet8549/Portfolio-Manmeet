/**
 * Portfolio API Layer
 * Reusable functions for interacting with Supabase backend.
 */

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
 * Submit a contact form message to the Supabase "contacts" table.
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

    try {
        const { error } = await supabaseClient
            .from('contacts')
            .insert([{
                name: data.name.trim(),
                email: data.email.trim(),
                subject: data.subject ? data.subject.trim() : null,
                message: data.message.trim()
            }]);

        if (error) {
            console.error('Supabase error:', error);
            return { success: false, error: 'Failed to send message. Please try again.' };
        }

        return { success: true };
    } catch (err) {
        console.error('Network error:', err);
        return { success: false, error: 'Network error. Please check your connection and try again.' };
    }
}
