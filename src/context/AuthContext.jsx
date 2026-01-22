import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            setLoading(false)
            return
        }

        try {
            const response = await authAPI.getMe()
            setUser(response.data.user)
        } catch (error) {
            localStorage.removeItem('token')
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        const response = await authAPI.login({ email, password })
        const { token, user } = response.data
        localStorage.setItem('token', token)
        setUser(user)
        return response.data
    }

    const register = async (email, password) => {
        const response = await authAPI.register({ email, password })
        const { token, user } = response.data
        localStorage.setItem('token', token)
        setUser(user)
        return response.data
    }

    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
    }

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
