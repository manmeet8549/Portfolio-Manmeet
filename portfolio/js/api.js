/**
 * Portfolio API Layer with Asynchronous Message Queue
 * Provides instant optimistic feedback on contact form submissions while queuing
 * backend email (Brevo) and database (Supabase) requests in the background.
 */

const CONTACT_API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001/api/contact'
    : 'https://portfolio-manmeet.onrender.com/api/contact';

const QUEUE_STORAGE_KEY = 'portfolio_contact_queue';
let isProcessingQueue = false;

/**
 * Validates email format.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validates contact form data synchronously.
 * @param {{ name: string, email: string, subject: string, message: string }} data
 * @returns {{ valid: boolean, error?: string }}
 */
function validateContactData(data) {
    if (!data.name || !data.name.trim()) {
        return { valid: false, error: 'Name is required.' };
    }
    if (!data.email || !data.email.trim()) {
        return { valid: false, error: 'Email is required.' };
    }
    if (!isValidEmail(data.email.trim())) {
        return { valid: false, error: 'Please enter a valid email address.' };
    }
    if (!data.message || !data.message.trim()) {
        return { valid: false, error: 'Message is required.' };
    }
    return { valid: true };
}

/**
 * Reads queue items from localStorage.
 * @returns {Array}
 */
function getStoredQueue() {
    try {
        const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error('Error reading queue from localStorage:', e);
        return [];
    }
}

/**
 * Saves queue items to localStorage.
 * @param {Array} queue
 */
function saveStoredQueue(queue) {
    try {
        localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (e) {
        console.error('Error saving queue to localStorage:', e);
    }
}

/**
 * Enqueues a message into the background queue.
 * @param {Object} cleanData
 * @returns {Object}
 */
function enqueueMessage(cleanData) {
    const queue = getStoredQueue();
    const item = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        data: cleanData,
        timestamp: Date.now(),
        attempts: 0
    };
    queue.push(item);
    saveStoredQueue(queue);
    return item;
}

/**
 * Asynchronously processes queued contact submissions in the background.
 */
async function processQueue() {
    if (isProcessingQueue) return;
    isProcessingQueue = true;

    try {
        let queue = getStoredQueue();
        while (queue.length > 0) {
            const currentItem = queue[0];
            const { data } = currentItem;

            let serverSuccess = false;
            try {
                // 1. Dispatch to Brevo Backend Server
                const response = await fetch(CONTACT_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (response.ok && result.success) {
                    serverSuccess = true;
                }
            } catch (err) {
                console.warn('Background server dispatch attempt failed:', err);
            }

            // 2. Save to Supabase (non-blocking)
            if (typeof supabaseClient !== 'undefined' && supabaseClient) {
                try {
                    await supabaseClient
                        .from('contacts')
                        .insert([{
                            name: data.name,
                            email: data.email,
                            subject: data.subject || null,
                            message: data.message
                        }]);
                } catch (dbErr) {
                    console.warn('Supabase background backup failed:', dbErr);
                }
            }

            // Remove item from queue once server/email is sent or if attempts exceeded
            currentItem.attempts = (currentItem.attempts || 0) + 1;
            if (serverSuccess || currentItem.attempts >= 5) {
                queue.shift(); // remove completed or max-retried item
                saveStoredQueue(queue);
            } else {
                // Keep in queue and pause before retrying later
                saveStoredQueue(queue);
                await new Promise(resolve => setTimeout(resolve, 5000));
                break;
            }
        }
    } finally {
        isProcessingQueue = false;
    }
}

/**
 * Submit a contact form message instantly.
 * Performs fast synchronous validation. If valid, enqueues request and returns
 * success immediately (< 50ms) while worker handles dispatch in background.
 * 
 * @param {{ name: string, email: string, subject: string, message: string }} data
 * @returns {Promise<{ success: boolean, error?: string, queued?: boolean }>}
 */
async function submitContact(data) {
    // 1. Fast Synchronous Validation
    const validation = validateContactData(data);
    if (!validation.valid) {
        return { success: false, error: validation.error };
    }

    const cleanData = {
        name: data.name.trim(),
        email: data.email.trim(),
        subject: data.subject ? data.subject.trim() : '',
        message: data.message.trim()
    };

    // 2. Enqueue item into persistent queue
    enqueueMessage(cleanData);

    // 3. Trigger background queue processor asynchronously
    setTimeout(() => {
        processQueue();
    }, 10);

    // 4. Return instant optimistic success to UI (< 10ms)
    return { success: true, queued: true };
}

// Auto-start queue processor on page load to flush any pending queued messages
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        processQueue();
    });
}


