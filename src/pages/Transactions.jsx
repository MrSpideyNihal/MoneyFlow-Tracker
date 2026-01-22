import { useState, useEffect } from 'react'
import { FiSearch, FiFilter, FiPlus, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { transactionAPI } from '../utils/api'
import TransactionModal from '../components/TransactionModal'
import ConfirmModal from '../components/ConfirmModal'
import ExportButtons from '../components/ExportButtons'

function Transactions() {
    const [transactions, setTransactions] = useState([])
    const [allTransactions, setAllTransactions] = useState([])
    const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 })
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })

    // Filters
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    // Modals
    const [modalOpen, setModalOpen] = useState(false)
    const [editTransaction, setEditTransaction] = useState(null)
    const [deleteModal, setDeleteModal] = useState({ open: false, transaction: null })
    const [deleteLoading, setDeleteLoading] = useState(false)

    useEffect(() => {
        fetchTransactions()
        fetchAllForExport()
        fetchStats()
    }, [pagination.page, search, typeFilter, startDate, endDate])

    const fetchTransactions = async () => {
        try {
            setLoading(true)
            const params = {
                page: pagination.page,
                limit: pagination.limit,
            }

            if (search) params.search = search
            if (typeFilter) params.type = typeFilter
            if (startDate) params.startDate = startDate
            if (endDate) params.endDate = endDate

            const response = await transactionAPI.getAll(params)
            setTransactions(response.data.transactions)
            setPagination((prev) => ({ ...prev, ...response.data.pagination }))
        } catch (error) {
            toast.error('Failed to load transactions')
        } finally {
            setLoading(false)
        }
    }

    const fetchAllForExport = async () => {
        try {
            const response = await transactionAPI.getAllForExport()
            setAllTransactions(response.data.transactions)
        } catch (error) {
            console.error('Failed to fetch all transactions')
        }
    }

    const fetchStats = async () => {
        try {
            const response = await transactionAPI.getStats()
            setStats(response.data)
        } catch (error) {
            console.error('Failed to fetch stats')
        }
    }

    const handleEdit = (transaction) => {
        setEditTransaction(transaction)
        setModalOpen(true)
    }

    const handleDelete = (transaction) => {
        setDeleteModal({ open: true, transaction })
    }

    const confirmDelete = async () => {
        if (!deleteModal.transaction) return

        setDeleteLoading(true)
        try {
            await transactionAPI.delete(deleteModal.transaction._id)
            toast.success('Transaction deleted')
            setDeleteModal({ open: false, transaction: null })
            fetchTransactions()
            fetchAllForExport()
            fetchStats()
        } catch (error) {
            toast.error('Failed to delete transaction')
        } finally {
            setDeleteLoading(false)
        }
    }

    const handleModalClose = () => {
        setModalOpen(false)
        setEditTransaction(null)
    }

    const handleSuccess = () => {
        fetchTransactions()
        fetchAllForExport()
        fetchStats()
    }

    const clearFilters = () => {
        setSearch('')
        setTypeFilter('')
        setStartDate('')
        setEndDate('')
        setPagination((prev) => ({ ...prev, page: 1 }))
    }

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(value)
    }

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Transactions</h1>
                    <p className="text-gray-400 mt-1">Manage all your transactions</p>
                </div>
                <div className="flex gap-3">
                    <ExportButtons transactions={allTransactions} stats={stats} />
                    <button
                        onClick={() => setModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-lg btn-hover"
                    >
                        <FiPlus size={18} />
                        Add New
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-2 relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search description, source..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-gray-500"
                        />
                    </div>

                    {/* Type Filter */}
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-4 text-white"
                    >
                        <option value="">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>

                    {/* Date Range */}
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-4 text-white"
                        placeholder="Start Date"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-4 text-white"
                        placeholder="End Date"
                    />
                </div>

                {/* Clear Filters */}
                {(search || typeFilter || startDate || endDate) && (
                    <button
                        onClick={clearFilters}
                        className="mt-3 text-sm text-primary-400 hover:text-primary-300"
                    >
                        Clear all filters
                    </button>
                )}
            </div>

            {/* Transactions Table/List */}
            <div className="glass-card overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="spinner w-10 h-10"></div>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-16">
                        <FiFilter className="mx-auto text-gray-500 mb-4" size={40} />
                        <p className="text-gray-400 mb-2">No transactions found</p>
                        <p className="text-gray-500 text-sm">Try adjusting your filters or add a new transaction</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-800/50">
                                    <tr>
                                        <th className="text-left py-4 px-6 text-gray-400 font-medium">Date</th>
                                        <th className="text-left py-4 px-6 text-gray-400 font-medium">Type</th>
                                        <th className="text-left py-4 px-6 text-gray-400 font-medium">Description</th>
                                        <th className="text-left py-4 px-6 text-gray-400 font-medium">Source/Where</th>
                                        <th className="text-right py-4 px-6 text-gray-400 font-medium">Amount</th>
                                        <th className="text-center py-4 px-6 text-gray-400 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {transactions.map((t) => (
                                        <tr key={t._id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="py-4 px-6 text-gray-300">{formatDate(t.date)}</td>
                                            <td className="py-4 px-6">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${t.type === 'income'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-red-500/20 text-red-400'
                                                        }`}
                                                >
                                                    {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-white">{t.description}</td>
                                            <td className="py-4 px-6 text-gray-400">{t.fromWhere || '-'}</td>
                                            <td
                                                className={`py-4 px-6 text-right font-medium ${t.type === 'income' ? 'text-green-400' : 'text-red-400'
                                                    }`}
                                            >
                                                {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(t)}
                                                        className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                                    >
                                                        <FiEdit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(t)}
                                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-slate-700">
                            {transactions.map((t) => (
                                <div key={t._id} className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-medium text-white">{t.description}</p>
                                            <p className="text-sm text-gray-400">{t.fromWhere || formatDate(t.date)}</p>
                                        </div>
                                        <p
                                            className={`font-semibold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'
                                                }`}
                                        >
                                            {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${t.type === 'income'
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-red-500/20 text-red-400'
                                                }`}
                                        >
                                            {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(t)}
                                                className="p-2 text-gray-400 hover:text-white"
                                            >
                                                <FiEdit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t)}
                                                className="p-2 text-gray-400 hover:text-red-400"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-slate-700">
                        <p className="text-sm text-gray-400">
                            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FiChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page === pagination.pages}
                                className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FiChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Transaction Modal */}
            <TransactionModal
                isOpen={modalOpen}
                onClose={handleModalClose}
                transaction={editTransaction}
                onSuccess={handleSuccess}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, transaction: null })}
                onConfirm={confirmDelete}
                title="Delete Transaction"
                message={`Are you sure you want to delete this ${deleteModal.transaction?.type || ''} of ${deleteModal.transaction ? formatCurrency(deleteModal.transaction.amount) : ''
                    }? This action cannot be undone.`}
                loading={deleteLoading}
            />
        </div>
    )
}

export default Transactions
