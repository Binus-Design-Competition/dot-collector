import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../../../components/Auth/LoginForm';
import { useAuth } from '../../../hooks/useAuth';
import { getDoc, setDoc } from 'firebase/firestore';

vi.mock('../../../hooks/useAuth');
vi.mock('../../../firebase');

describe('LoginForm', () => {
    const mockLogin = vi.fn();
    const mockOnSessionCreated = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({
            login: mockLogin,
            loading: false
        });
    });

    it('renders correctly', () => {
        render(<LoginForm onSessionCreated={mockOnSessionCreated} />);
        expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
        expect(screen.getByText('Join Session')).toBeInTheDocument();
        expect(screen.getByText('Create New Session')).toBeInTheDocument();
    });

    it('disables join button when name is empty', () => {
        render(<LoginForm onSessionCreated={mockOnSessionCreated} />);
        const joinButton = screen.getByText('Join Session').closest('button');
        expect(joinButton).toBeDisabled();
    });

    it('switches to create session mode', () => {
        render(<LoginForm onSessionCreated={mockOnSessionCreated} />);
        fireEvent.click(screen.getByText('Create New Session'));
        expect(screen.getByText('Create Session (Teacher)')).toBeInTheDocument();
        expect(screen.getByText('Back to Join')).toBeInTheDocument();
    });

    it('handles join session successfully', async () => {
        const mockUser = { uid: 'user123' };
        mockLogin.mockResolvedValue(mockUser);

        getDoc.mockResolvedValue({
            exists: () => true
        });

        render(<LoginForm onSessionCreated={mockOnSessionCreated} />);

        fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
            target: { value: 'Test User' }
        });
        fireEvent.change(screen.getByPlaceholderText('ABCDEF'), {
            target: { value: '123456' }
        });

        fireEvent.click(screen.getByText('Join Session'));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('Test User', '123456');
            expect(mockOnSessionCreated).toHaveBeenCalledWith('123456', false);
        });
    });

    it('handles session not found', async () => {
        mockLogin.mockResolvedValue({ uid: 'user123' });
        getDoc.mockResolvedValue({
            exists: () => false
        });

        render(<LoginForm onSessionCreated={mockOnSessionCreated} />);

        fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
            target: { value: 'Test User' }
        });
        fireEvent.change(screen.getByPlaceholderText('ABCDEF'), {
            target: { value: '123456' }
        });

        fireEvent.click(screen.getByText('Join Session'));

        await waitFor(() => {
            expect(screen.getByText('Session not found. Please check the code.')).toBeInTheDocument();
        });
    });
});
