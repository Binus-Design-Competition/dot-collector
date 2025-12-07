import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp,
    getDocs
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import { getFriendlyErrorMessage } from '../utils/errorHandler';

export const useReviews = (sessionId, filters = {}) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!sessionId) {
            setLoading(false);
            return;
        }

        // Build query
        let q = query(collection(db, 'reviews'), where('sessionId', '==', sessionId));

        // Apply filters
        if (filters.targetUserId) {
            q = query(q, where('targetUserId', '==', filters.targetUserId));
        }
        if (filters.reviewerId) {
            q = query(q, where('reviewerId', '==', filters.reviewerId));
        }
        if (filters.category) {
            q = query(q, where('category', '==', filters.category));
        }

        // Listen to reviews
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reviewsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setReviews(reviewsData);
            setLoading(false);
        });

        return unsubscribe;
    }, [sessionId, filters.targetUserId, filters.reviewerId, filters.category]);

    const createReview = async (reviewData) => {
        try {
            const reviewDoc = {
                ...reviewData,
                sessionId,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                isEditable: true
            };

            const docRef = await addDoc(collection(db, 'reviews'), reviewDoc);
            return docRef.id;
        } catch (error) {
            console.error('Error creating review:', error);
            toast.error(getFriendlyErrorMessage(error));
            throw error;
        }
    };

    const updateReview = async (reviewId, updates) => {
        try {
            const reviewRef = doc(db, 'reviews', reviewId);
            await updateDoc(reviewRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating review:', error);
            toast.error(getFriendlyErrorMessage(error));
            throw error;
        }
    };

    const getMyReviews = async (reviewerId) => {
        const q = query(
            collection(db, 'reviews'),
            where('sessionId', '==', sessionId),
            where('reviewerId', '==', reviewerId)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    return {
        reviews,
        loading,
        createReview,
        updateReview,
        getMyReviews
    };
};
