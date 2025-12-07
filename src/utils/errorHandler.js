/**
 * Translates technical error codes into user-friendly messages.
 * @param {Error|Object|string} error - The error object or code.
 * @returns {string} A user-friendly error message.
 */
export const getFriendlyErrorMessage = (error) => {
    if (!error) return 'An unexpected error occurred.';

    // Handle string errors
    const errorCode = typeof error === 'string' ? error : error.code || error.message;

    switch (errorCode) {
        // Firebase Auth Errors
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Invalid email or password. Please try again.';
        case 'auth/email-already-in-use':
            return 'An account with this email already exists.';
        case 'auth/weak-password':
            return 'Password is too weak. Please choose a stronger password.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your internet connection.';
        case 'auth/requires-recent-login':
            return 'For security, please log in again to complete this action.';

        // Firestore/Permission Errors
        case 'permission-denied':
            return 'You do not have permission to perform this action.';
        case 'unavailable':
            return 'Service temporarily unavailable. Please try again later.';

        // Common Custom/Generic Errors
        case 'Session not found':
            return 'We couldn\'t find that session. Please check the code.';

        default:
            // Fallback for unhandled errors
            console.error('Unhandled error:', error);
            if (typeof error.message === 'string' && error.message.length < 100) {
                 return error.message;
            }
            return 'Something went wrong. Please try again.';
    }
};
