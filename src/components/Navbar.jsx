import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiHome, FiList, FiLogOut, FiMenu, FiX } from 'react-icons/fi'
import { useState } from 'react'

function Navbar() {
    const { user, logout } = useAuth()
    const location = useLocation()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const navLinks = [
        { path: '/', label: 'Dashboard', icon: FiHome },
        { path: '/transactions', label: 'Transactions', icon: FiList },
    ]

    const isActive = (path) => location.pathname === path

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-income flex items-center justify-center text-white font-bold">
                            $
                        </div>
                        <span className="font-bold text-xl gradient-text hidden sm:block">
                            MoneyFlow
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive(link.path)
                                        ? 'bg-primary-500/20 text-primary-400'
                                        : 'text-gray-400 hover:text-white hover:bg-slate-800'
                                    }`}
                            >
                                <link.icon size={18} />
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* User Menu */}
                    <div className="hidden md:flex items-center gap-4">
                        <span className="text-sm text-gray-400">{user?.email}</span>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <FiLogOut size={18} />
                            Logout
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-gray-400 hover:text-white"
                    >
                        {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-slate-800 animate-fade-in">
                        <div className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-2 px-3 py-3 rounded-lg transition-colors ${isActive(link.path)
                                            ? 'bg-primary-500/20 text-primary-400'
                                            : 'text-gray-400 hover:text-white hover:bg-slate-800'
                                        }`}
                                >
                                    <link.icon size={18} />
                                    {link.label}
                                </Link>
                            ))}
                            <div className="border-t border-slate-800 my-2"></div>
                            <span className="text-sm text-gray-500 px-3">{user?.email}</span>
                            <button
                                onClick={() => {
                                    logout()
                                    setMobileMenuOpen(false)
                                }}
                                className="flex items-center gap-2 px-3 py-3 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <FiLogOut size={18} />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar
