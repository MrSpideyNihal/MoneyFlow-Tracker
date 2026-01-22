import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'

function App() {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner w-12 h-12"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            {isAuthenticated && <Navbar />}
            <main className={isAuthenticated ? 'pt-16' : ''}>
                <Routes>
                    <Route path="/login" element={
                        isAuthenticated ? <Navigate to="/" replace /> : <Login />
                    } />
                    <Route path="/register" element={
                        isAuthenticated ? <Navigate to="/" replace /> : <Register />
                    } />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/transactions" element={
                        <ProtectedRoute>
                            <Transactions />
                        </ProtectedRoute>
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    )
}

export default App
