import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'

function TransactionCard({ transaction, onEdit, onDelete }) {
    const { type, amount, description, fromWhere, date, notes } = transaction

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
        <div className="glass-card p-4 flex items-center gap-4 hover:bg-slate-700/50 transition-colors">
            {/* Icon */}
            <div
                className={`p-3 rounded-xl ${type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}
            >
                {type === 'income' ? (
                    <FiTrendingUp className="text-green-400" size={20} />
                ) : (
                    <FiTrendingDown className="text-red-400" size={20} />
                )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white truncate">{description}</h4>
                    {fromWhere && (
                        <span className="text-xs text-gray-500 truncate">• {fromWhere}</span>
                    )}
                </div>
                <p className="text-sm text-gray-400">{formatDate(date)}</p>
                {notes && (
                    <p className="text-xs text-gray-500 truncate mt-1">{notes}</p>
                )}
            </div>

            {/* Amount */}
            <div className="text-right">
                <p
                    className={`font-semibold ${type === 'income' ? 'text-green-400' : 'text-red-400'
                        }`}
                >
                    {type === 'income' ? '+' : '-'} {formatCurrency(amount)}
                </p>
            </div>

            {/* Actions - Hidden by default, shown on hover */}
            {(onEdit || onDelete) && (
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                        <button
                            onClick={() => onEdit(transaction)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
                        >
                            Edit
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() => onDelete(transaction)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-600 rounded-lg transition-colors"
                        >
                            Delete
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default TransactionCard
