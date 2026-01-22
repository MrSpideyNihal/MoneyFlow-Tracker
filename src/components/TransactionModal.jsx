import { useState, useEffect } from 'react'
import { FiX, FiDollarSign, FiFileText, FiMapPin, FiCalendar, FiMessageSquare } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { transactionAPI } from '../utils/api'

function TransactionModal({ isOpen, onClose, transaction, onSuccess }) {
    const [type, setType] = useState('expense')
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [fromWhere, setFromWhere] = useState('')
    const [notes, setNotes] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [loading, setLoading] = useState(false)

    const isEditing = !!transaction

    useEffect(() => {
        if (transaction) {
            setType(transaction.type)
            setAmount(transaction.amount.toString())
            setDescription(transaction.description)
            setFromWhere(transaction.fromWhere || '')
            setNotes(transaction.notes || '')
            setDate(new Date(transaction.date).toISOString().split('T')[0])
        } else {
            resetForm()
        }
    }, [transaction, isOpen])

    const resetForm = () => {
        setType('expense')
        setAmount('')
        setDescription('')
        setFromWhere('')
        setNotes('')
        setDate(new Date().toISOString().split('T')[0])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount')
            return
        }

        if (!description.trim()) {
            toast.error('Please enter a description')
            return
        }

        setLoading(true)
        try {
            const data = {
                type,
                amount: parseFloat(amount),
                description: description.trim(),
                fromWhere: fromWhere.trim(),
                notes: notes.trim(),
                date,
            }

            if (isEditing) {
                await transactionAPI.update(transaction._id, data)
                toast.success('Transaction updated!')
            } else {
                await transactionAPI.create(data)
                toast.success('Transaction added!')
            }

            onSuccess()
            onClose()
            resetForm()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
            <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <h2 className="text-xl font-semibold text-white">
                        {isEditing ? 'Edit Transaction' : 'Add Transaction'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Type Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Transaction Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setType('income')}
                                className={`py-3 px-4 rounded-lg font-medium transition-all ${type === 'income'
                                        ? 'bg-green-500/20 text-green-400 border-2 border-green-500'
                                        : 'bg-slate-700 text-gray-400 border-2 border-transparent hover:border-slate-600'
                                    }`}
                            >
                                💰 Income
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('expense')}
                                className={`py-3 px-4 rounded-lg font-medium transition-all ${type === 'expense'
                                        ? 'bg-red-500/20 text-red-400 border-2 border-red-500'
                                        : 'bg-slate-700 text-gray-400 border-2 border-transparent hover:border-slate-600'
                                    }`}
                            >
                                💸 Expense
                            </button>
                        </div>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Amount
                        </label>
                        <div className="relative">
                            <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description
                        </label>
                        <div className="relative">
                            <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500"
                                placeholder={type === 'income' ? 'e.g. Salary, Freelance' : 'e.g. Groceries, Rent'}
                            />
                        </div>
                    </div>

                    {/* From Where */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            {type === 'income' ? 'Source' : 'Where'}
                        </label>
                        <div className="relative">
                            <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={fromWhere}
                                onChange={(e) => setFromWhere(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500"
                                placeholder={type === 'income' ? 'e.g. Company ABC' : 'e.g. Amazon, Local Store'}
                            />
                        </div>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Date
                        </label>
                        <div className="relative">
                            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Notes (Optional)
                        </label>
                        <div className="relative">
                            <FiMessageSquare className="absolute left-3 top-3 text-gray-400" />
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 min-h-[80px] resize-none"
                                placeholder="Additional notes..."
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-semibold text-white btn-hover flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${type === 'income' ? 'income-gradient' : 'expense-gradient'
                            }`}
                    >
                        {loading ? (
                            <div className="spinner w-5 h-5"></div>
                        ) : isEditing ? (
                            'Update Transaction'
                        ) : (
                            `Add ${type === 'income' ? 'Income' : 'Expense'}`
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default TransactionModal
