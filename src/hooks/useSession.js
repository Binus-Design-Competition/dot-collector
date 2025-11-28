import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
    doc,
    getDoc,
    updateDoc,
    onSnapshot,
    collection,
    query,
    where,
    getDocs
} from 'firebase/firestore';

export const useSession = (sessionId) => {
    const [session, setSession] = useState(null);
    const [activeUsers, setActiveUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!sessionId) {
            setLoading(false);
            return;
        }

        // Listen to session document
        const sessionRef = doc(db, 'sessions', sessionId);
        const unsubscribeSession = onSnapshot(sessionRef, (doc) => {
            if (doc.exists()) {
                setSession({ id: doc.id, ...doc.data() });
            } else {
                setSession(null);
            }
            setLoading(false);
        });

        // Listen to active users in this session
        const usersQuery = query(
            collection(db, 'users'),
            where('sessionId', '==', sessionId),
            where('isOnline', '==', true)
        );

        const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
            const users = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setActiveUsers(users);
        });

        return () => {
            unsubscribeSession();
            unsubscribeUsers();
        };
    }, [sessionId]);

    const updateSession = async (updates) => {
        if (!sessionId) return;

        const sessionRef = doc(db, 'sessions', sessionId);
        await updateDoc(sessionRef, updates);
    };

    const updateActiveCategory = async (category) => {
        await updateSession({ activeCategory: category });
    };

    const startSession = async () => {
        await updateSession({ status: 'live' });
    };

    const endSession = async () => {
        await updateSession({ status: 'closed' });
    };

    return {
        session,
        activeUsers,
        loading,
        updateActiveCategory,
        startSession,
        endSession,
        updateSession
    };
};
