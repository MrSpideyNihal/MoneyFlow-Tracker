import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#0ea5e9', '#8b5cf6', '#ec4899', '#64748b', '#84cc16']

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
                <p className="text-gray-300 text-sm mb-1">{label}</p>
                {payload.map((item, index) => (
                    <p key={index} className="text-sm" style={{ color: item.color }}>
                        {item.name}: ₹{item.value.toLocaleString()}
                    </p>
                ))}
            </div>
        )
    }
    return null
}

export function ExpensePieChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Expense Breakdown</h3>
                <div className="h-64 flex items-center justify-center text-gray-400">
                    No expense data to display
                </div>
            </div>
        )
    }

    const chartData = data.map((item) => ({
        name: item._id || 'Unknown',
        value: item.total,
    }))

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Expense Breakdown</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            labelLine={false}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export function IncomeExpenseChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Income vs Expenses</h3>
                <div className="h-64 flex items-center justify-center text-gray-400">
                    No data to display
                </div>
            </div>
        )
    }

    // Process monthly stats into chart format
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    const monthlyData = {}

    data.forEach((item) => {
        const key = `${item._id.year}-${item._id.month}`
        if (!monthlyData[key]) {
            monthlyData[key] = {
                name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
                income: 0,
                expense: 0,
            }
        }
        if (item._id.type === 'income') {
            monthlyData[key].income = item.total
        } else {
            monthlyData[key].expense = item.total
        }
    })

    const chartData = Object.values(monthlyData).slice(-6)

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Income vs Expenses</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: 10 }} />
                        <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
