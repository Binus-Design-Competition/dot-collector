import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useSession } from './hooks/useSession';
import { UnifiedLogin } from './components/Auth/UnifiedLogin';
import { TeacherDashboard } from './components/Teacher/TeacherDashboard';
import { StudentInterface } from './components/Student/StudentInterface';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { Moon, Sun } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

function DarkModeToggle() {
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('darkMode') === 'true' ||
                window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    }, [darkMode]);

    const toggleDarkMode = () => setDarkMode(!darkMode);

    return (
        <button
            onClick={toggleDarkMode}
            className="fixed bottom-4 right-4 z-50 p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-slate-700"
            aria-label="Toggle dark mode"
        >
            {darkMode ? <Sun className="text-yellow-500" size={24} /> : <Moon className="text-slate-700" size={24} />}
        </button>
    );
}

// Wrapper for Teacher Dashboard to handle Session Context
function AdminDashboardWrapper() {
    const { userDoc } = useAuth();
    const sessionId = userDoc?.sessionId;
    const { session } = useSession(sessionId);

    // If no session, dashboard might handle creation or show empty state
    // But usually admin should be able to create session inside dashboard

    return (
        <div className="relative">
            <DarkModeToggle />
            <TeacherDashboard sessionId={sessionId} initialSession={session} />
        </div>
    );
}

// Wrapper for Student Interface to handle Session Context
function StudentInterfaceWrapper() {
    const { userDoc } = useAuth();
    const sessionId = userDoc?.sessionId;
    const { session, activeUsers } = useSession(sessionId);

    if (!sessionId) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="relative">
            <DarkModeToggle />
            <StudentInterface sessionId={sessionId} session={session} activeUsers={activeUsers} />
        </div>
    );
}

// Public Route Guard (Redirects if already logged in)
function PublicRoute({ children, restrictedTo = 'all' }) {
    const { currentUser, userDoc } = useAuth();

    if (currentUser && userDoc) {
        if (userDoc.role === 'admin' && (restrictedTo === 'all' || restrictedTo === 'admin')) {
            return <Navigate to="/admin/dashboard" replace />;
        }
        // For students, we might want them to stay on the UnifiedLogin page (in 'student_setup' view) 
        // if they haven't joined a session yet. 
        // But UnifiedLogin handles that internally.
        if (userDoc.role === 'user' && (restrictedTo === 'all' || restrictedTo === 'user')) {
            // If they are already in a session, go to room, else stay on login to enter code
            if (userDoc.sessionId) {
                return <Navigate to="/room" replace />;
            }
        }
    }

    return children;
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster position="top-right" />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={
                        <UnifiedLogin />
                    } />

                    <Route path="/admin/login" element={
                        <Navigate to="/" replace />
                    } />

                    {/* Admin Protected Routes */}
                    <Route element={<ProtectedRoute role="admin" redirectPath="/" />}>
                        <Route path="/admin/dashboard" element={<AdminDashboardWrapper />} />
                    </Route>

                    {/* User Protected Routes */}
                    <Route element={<ProtectedRoute role="user" redirectPath="/" />}>
                        <Route path="/room" element={<StudentInterfaceWrapper />} />
                    </Route>

                    {/* Redirects */}
                    <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
