import { FiTrendingUp, FiTrendingDown, FiCreditCard } from 'react-icons/fi'

function StatsCard({ type, amount, label }) {
    const config = {
        income: {
            icon: FiTrendingUp,
            gradient: 'income-gradient',
            iconBg: 'bg-green-500/20',
            iconColor: 'text-green-400',
        },
        expense: {
            icon: FiTrendingDown,
            gradient: 'expense-gradient',
            iconBg: 'bg-red-500/20',
            iconColor: 'text-red-400',
        },
        balance: {
            icon: FiCreditCard,
            gradient: 'balance-gradient',
            iconBg: 'bg-blue-500/20',
            iconColor: 'text-blue-400',
        },
    }

    const { icon: Icon, gradient, iconBg, iconColor } = config[type]

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(value)
    }

    return (
        <div className="glass-card p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform">
            {/* Background gradient accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${gradient} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity`}></div>

            <div className="flex items-start justify-between relative z-10">
                <div>
                    <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
                    <p className="text-2xl md:text-3xl font-bold text-white">
                        {formatCurrency(amount)}
                    </p>
                </div>
                <div className={`p-3 rounded-xl ${iconBg}`}>
                    <Icon className={iconColor} size={24} />
                </div>
            </div>
        </div>
    )
}

export default StatsCard
