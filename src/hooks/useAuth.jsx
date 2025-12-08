import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { auth, db } from '../firebase';
import {
    signInAnonymously,
    updateProfile,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { getFriendlyErrorMessage } from '../utils/errorHandler';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userDoc, setUserDoc] = useState(null);

    // Logout function definition (hoisted for use in effects)
    const logout = async () => {
        if (currentUser) {
            // Update user status before logging out
            const userDocRef = doc(db, 'users', currentUser.uid);
            try {
                await updateDoc(userDocRef, {
                    isOnline: false,
                    lastSeen: serverTimestamp()
                });
            } catch (err) {
                console.error('Logout update error:', err);
                // Non-critical error, logging is enough
            }
        }
        await auth.signOut();
        // Clear local storage for inactivity
        localStorage.removeItem('last_active_timestamp');
    };

    useEffect(() => {
        // Set a timeout to force loading to false if Firebase doesn't respond
        const timeout = setTimeout(() => {
            console.warn('Firebase auth initialization timeout - proceeding anyway');
            setLoading(false);
        }, 5000); // 5 second timeout

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            clearTimeout(timeout); // Clear timeout if auth responds
            setCurrentUser(user);

            if (user) {
                try {
                    // Fetch user document
                    const userDocRef = doc(db, 'users', user.uid);
                    const userSnapshot = await getDoc(userDocRef);

                    if (userSnapshot.exists()) {
                        setUserDoc({ id: user.uid, ...userSnapshot.data() });
                        // Set initial activity timestamp on successful load
                        localStorage.setItem('last_active_timestamp', Date.now().toString());
                    } else {
                        // For Google Auth, if doc doesn't exist yet, we might need to create it 
                        // or it might be created by the login function. 
                        // But onAuthStateChanged fires before login resolves.
                        // So we might want to set a partial userDoc or handle it in login function.
                        setUserDoc(null);
                    }
                } catch (error) {
                    console.error('Error fetching user document:', error);
                    // Don't show toast for background fetch errors to avoid UI spam, just log
                }
            } else {
                setUserDoc(null);
            }

            setLoading(false);
        }, (error) => {
            // Error callback
            console.error('Firebase auth error:', error);
            toast.error('Authentication error. Please refresh the page.');
            clearTimeout(timeout);
            setLoading(false);
        });

        return () => {
            clearTimeout(timeout);
            unsubscribe();
        };
    }, []);

    // Comprehensive Auto-logout logic (30 minutes)
    useEffect(() => {
        if (!currentUser) return;

        const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
        const STORAGE_KEY = 'last_active_timestamp';
        const CHECK_INTERVAL = 60 * 1000; // Check every 1 minute

        const updateActivity = () => {
            // Throttle updates to avoid excessive storage writes
            const now = Date.now();
            const lastStored = parseInt(localStorage.getItem(STORAGE_KEY) || '0');

            // Only update if more than 1 minute has passed since last update
            if (now - lastStored > 60000) {
                localStorage.setItem(STORAGE_KEY, now.toString());
            }
        };

        const checkInactivity = async () => {
            const lastActive = parseInt(localStorage.getItem(STORAGE_KEY) || '0');
            if (lastActive > 0 && Date.now() - lastActive > TIMEOUT_MS) {
                console.log('Auto-logout triggered due to inactivity');
                toast('Session expired due to inactivity');
                await logout();
                window.location.reload(); // Refresh to clear any stale state
            }
        };

        // Events to track activity
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

        // Add event listeners
        events.forEach(event => {
            window.addEventListener(event, updateActivity);
        });

        // Start periodic check
        const intervalId = setInterval(checkInactivity, CHECK_INTERVAL);

        // Initial check
        checkInactivity();

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, updateActivity);
            });
            clearInterval(intervalId);
        };
    }, [currentUser]); // Re-run when user logs in/out

    const login = async (name, sessionId = null) => {
        try {
            // This is now for admin - email/password auth
            // Regular users use loginAnonymous
            return currentUser;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const loginAnonymous = async (name, sessionId) => {
        try {
            // Sign in anonymously for regular users
            const result = await signInAnonymously(auth);
            const user = result.user;

            // Update display name
            await updateProfile(user, { displayName: name });

            // Create/update user document
            const userDocRef = doc(db, 'users', user.uid);
            const userData = {
                name,
                role: 'user',
                sessionId,
                isOnline: true,
                lastSeen: serverTimestamp()
            };

            await setDoc(userDocRef, userData, { merge: true });
            setUserDoc({ id: user.uid, ...userData });

            // Initialize activity timer
            localStorage.setItem('last_active_timestamp', Date.now().toString());

            return user;
        } catch (error) {
            console.error('Anonymous login error:', error);
            throw error;
        }
    };

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user doc exists, if not create basic one
            const userDocRef = doc(db, 'users', user.uid);
            const userSnapshot = await getDoc(userDocRef);

            if (!userSnapshot.exists()) {
                // If it's a new user, we don't know if they are admin or student yet
                // For now, default to user (student), admin functionality is usually manually set in DB 
                // or checked against a list of admin emails
                const userData = {
                    name: user.displayName,
                    email: user.email,
                    role: 'user', // Default role
                    isOnline: true,
                    lastSeen: serverTimestamp()
                };
                await setDoc(userDocRef, userData);
                setUserDoc({ id: user.uid, ...userData });
            } else {
                await updateDoc(userDocRef, {
                    isOnline: true,
                    lastSeen: serverTimestamp()
                });
                // Ensure local state is updated
                const data = userSnapshot.data();
                setUserDoc({ id: user.uid, ...data, isOnline: true });
            }

            return user;
        } catch (error) {
            console.error('Google sign in error:', error);
            throw error;
        }
    };

    const updateDisplayName = async (newName) => {
        if (!currentUser) return;
        try {
            await updateProfile(currentUser, { displayName: newName });

            // Update Firestore if user doc exists
            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, { name: newName });

            // Update local state
            setUserDoc(prev => ({ ...prev, name: newName }));
            toast.success('Name updated successfully');
            return true;
        } catch (error) {
            console.error('Error updating display name:', error);
            toast.error(getFriendlyErrorMessage(error));
            throw error;
        }
    };

    const value = {
        currentUser,
        userDoc,
        loading,
        login,
        loginAnonymous,
        loginWithGoogle,
        logout,
        updateDisplayName
    };

    // Show loading indicator while initializing
    if (loading) {
        return (
            <AuthContext.Provider value={value}>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                    </div>
                </div>
            </AuthContext.Provider>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
