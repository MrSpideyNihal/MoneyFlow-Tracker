import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiPlus, FiTrendingUp, FiTrendingDown, FiArrowRight } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { transactionAPI } from '../utils/api'
import StatsCard from '../components/StatsCard'
import TransactionCard from '../components/TransactionCard'
import TransactionModal from '../components/TransactionModal'
import { ExpensePieChart, IncomeExpenseChart } from '../components/Charts'

function Dashboard() {
    const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 })
    const [recentTransactions, setRecentTransactions] = useState([])
    const [monthlyStats, setMonthlyStats] = useState([])
    const [expenseBreakdown, setExpenseBreakdown] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [modalType, setModalType] = useState('expense')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [statsRes, recentRes] = await Promise.all([
                transactionAPI.getStats(),
                transactionAPI.getRecent(),
            ])

            setStats({
                income: statsRes.data.income,
                expense: statsRes.data.expense,
                balance: statsRes.data.balance,
            })
            setMonthlyStats(statsRes.data.monthlyStats)
            setExpenseBreakdown(statsRes.data.expenseBreakdown)
            setRecentTransactions(recentRes.data.transactions)
        } catch (error) {
            toast.error('Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }

    const openModal = (type) => {
        setModalType(type)
        setModalOpen(true)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner w-12 h-12"></div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-gray-400 mt-1">Track your financial overview</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => openModal('income')}
                        className="flex items-center gap-2 px-4 py-2 income-gradient text-white font-medium rounded-lg btn-hover"
                    >
                        <FiPlus size={18} />
                        <span className="hidden sm:inline">Add</span> Income
                    </button>
                    <button
                        onClick={() => openModal('expense')}
                        className="flex items-center gap-2 px-4 py-2 expense-gradient text-white font-medium rounded-lg btn-hover"
                    >
                        <FiPlus size={18} />
                        <span className="hidden sm:inline">Add</span> Expense
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatsCard type="income" amount={stats.income} label="Total Income" />
                <StatsCard type="expense" amount={stats.expense} label="Total Expenses" />
                <StatsCard type="balance" amount={stats.balance} label="Current Balance" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <ExpensePieChart data={expenseBreakdown} />
                <IncomeExpenseChart data={monthlyStats} />
            </div>

            {/* Recent Transactions */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
                    <Link
                        to="/transactions"
                        className="flex items-center gap-1 text-primary-400 hover:text-primary-300 text-sm font-medium"
                    >
                        View All <FiArrowRight size={16} />
                    </Link>
                </div>

                {recentTransactions.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-full flex items-center justify-center">
                            <FiTrendingUp className="text-gray-500" size={24} />
                        </div>
                        <p className="text-gray-400 mb-4">No transactions yet</p>
                        <p className="text-gray-500 text-sm">
                            Start by adding your first income or expense
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentTransactions.map((transaction) => (
                            <TransactionCard key={transaction._id} transaction={transaction} />
                        ))}
                    </div>
                )}
            </div>

            {/* Transaction Modal */}
            <TransactionModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                transaction={modalType === 'income' ? { type: 'income' } : { type: 'expense' }}
                onSuccess={fetchData}
            />
        </div>
    )
}

export default Dashboard
