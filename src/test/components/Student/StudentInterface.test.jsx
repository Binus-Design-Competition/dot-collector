import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StudentInterface } from '../../../components/Student/StudentInterface';
import { useAuth } from '../../../hooks/useAuth';

// Mock child components
vi.mock('../../../components/Student/VoteTab', () => ({
    VoteTab: () => <div data-testid="vote-tab">Vote Tab Content</div>
}));
vi.mock('../../../components/Student/GridTab', () => ({
    GridTab: () => <div data-testid="grid-tab">Grid Tab Content</div>
}));
vi.mock('../../../components/Student/MyFeedbackTab', () => ({
    MyFeedbackTab: () => <div data-testid="feedback-tab">My Feedback Tab Content</div>
}));

vi.mock('../../../hooks/useAuth');

describe('StudentInterface', () => {
    const mockLogout = vi.fn();
    const mockUserDoc = { name: 'Student 1' };

    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({
            logout: mockLogout,
            userDoc: mockUserDoc
        });

        // Mock window.confirm and location.reload
        window.confirm = vi.fn(() => true);
        Object.defineProperty(window, 'location', {
            value: { reload: vi.fn() },
            writable: true
        });
    });

    it('renders header with user info', () => {
        render(<StudentInterface sessionId="123456" session={{}} activeUsers={[]} />);

        expect(screen.getByText(/Student 1/)).toBeInTheDocument();
        expect(screen.getByText('Leave')).toBeInTheDocument();
    });

    it('renders all tabs', () => {
        render(<StudentInterface sessionId="123456" session={{}} activeUsers={[]} />);

        expect(screen.getByText('Vote')).toBeInTheDocument();
        expect(screen.getByText('The Grid')).toBeInTheDocument();
        expect(screen.getByText('My Feedback')).toBeInTheDocument();
    });

    it('defaults to Vote tab', () => {
        render(<StudentInterface sessionId="123456" session={{}} activeUsers={[]} />);

        expect(screen.getByTestId('vote-tab')).toBeInTheDocument();
        expect(screen.queryByTestId('grid-tab')).not.toBeInTheDocument();
    });

    it('switches tabs correctly', () => {
        render(<StudentInterface sessionId="123456" session={{}} activeUsers={[]} />);

        // Switch to Grid tab
        fireEvent.click(screen.getByText('The Grid'));
        expect(screen.getByTestId('grid-tab')).toBeInTheDocument();
        expect(screen.queryByTestId('vote-tab')).not.toBeInTheDocument();

        // Switch to My Feedback tab
        fireEvent.click(screen.getByText('My Feedback'));
        expect(screen.getByTestId('feedback-tab')).toBeInTheDocument();
        expect(screen.queryByTestId('grid-tab')).not.toBeInTheDocument();
    });

    it('shows correct session status banner', () => {
        const session = { status: 'live', activeCategory: 'Creativity' };
        render(<StudentInterface sessionId="123456" session={session} activeUsers={[]} />);

        expect(screen.getByText('Session is LIVE • Current Category: Creativity')).toBeInTheDocument();
    });

    it('handles logout', async () => {
        render(<StudentInterface sessionId="123456" session={{}} activeUsers={[]} />);

        fireEvent.click(screen.getByText('Leave'));

        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to leave the session?');
        expect(mockLogout).toHaveBeenCalled();
    });
});
