import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor, render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../hooks/useAuth';
import { auth, db } from '../../firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getDoc, setDoc, updateDoc } from 'firebase/firestore';

vi.mock('../../firebase');

describe('useAuth Hook', () => {
    // Helper to wrap hook with provider
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows loading indicator initially', () => {
        // Mock onAuthStateChanged to NOT immediately call back
        // to simulate loading state
        onAuthStateChanged.mockImplementation(() => vi.fn());

        render(<AuthProvider><div>Content</div></AuthProvider>);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('provides currentUser and userDoc when auth state changes', async () => {
        const mockUser = { uid: '123', email: 'test@example.com' };
        const mockUserDoc = { role: 'user', name: 'Test User' };

        // Mock Firestore getDoc
        getDoc.mockResolvedValue({
            exists: () => true,
            data: () => mockUserDoc
        });

        const { result } = renderHook(() => useAuth(), { wrapper });

        // Trigger auth state change manually via the mock callback
        await act(async () => {
             const authCallback = onAuthStateChanged.mock.calls[0][1];
             authCallback(mockUser);
        });

        // Initially loading might be true, wait for it to settle
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.currentUser).toBe(mockUser);
        expect(result.current.userDoc).toEqual({ id: '123', ...mockUserDoc });
    });

    it('loginAnonymous calls correct firebase functions', async () => {
        const mockUser = { uid: 'anon123' };
        signInAnonymously.mockResolvedValue({ user: mockUser });

        const { result } = renderHook(() => useAuth(), { wrapper });

        // Trigger auth state change manually to loaded state (null user)
        await act(async () => {
             const authCallback = onAuthStateChanged.mock.calls[0][1];
             authCallback(null);
        });

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.loginAnonymous('Anon User', 'session1');
        });

        expect(signInAnonymously).toHaveBeenCalled();
        expect(setDoc).toHaveBeenCalled(); // Should create user doc
    });
});
