import { useState, useEffect, createContext, useContext } from 'react';
import { auth, db } from '../firebase';
import {
    signInAnonymously,
    updateProfile,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

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
                    }
                } catch (error) {
                    console.error('Error fetching user document:', error);
                }
            } else {
                setUserDoc(null);
            }

            setLoading(false);
        }, (error) => {
            // Error callback
            console.error('Firebase auth error:', error);
            clearTimeout(timeout);
            setLoading(false);
        });

        return () => {
            clearTimeout(timeout);
            unsubscribe();
        };
    }, []);

    const login = async (name, sessionId = null) => {
        try {
            // Sign in anonymously
            const result = await signInAnonymously(auth);
            const user = result.user;

            // Update display name
            await updateProfile(user, { displayName: name });

            // Create/update user document
            const userDocRef = doc(db, 'users', user.uid);
            const userData = {
                name,
                isOnline: true,
                lastSeen: serverTimestamp(),
                ...(sessionId && { sessionId })
            };

            await setDoc(userDocRef, userData, { merge: true });
            setUserDoc({ id: user.uid, ...userData });

            return user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        if (currentUser) {
            // Update user status before logging out
            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, {
                isOnline: false,
                lastSeen: serverTimestamp()
            });
        }
        await auth.signOut();
    };

    const value = {
        currentUser,
        userDoc,
        loading,
        login,
        logout
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
