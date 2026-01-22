import express from 'express';
import serverless from 'serverless-http';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        isConnected = true;
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

// User Schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Transaction Schema
const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    fromWhere: {
        type: String,
        trim: true,
        default: '',
    },
    notes: {
        type: String,
        trim: true,
        default: '',
    },
    date: {
        type: Date,
        default: Date.now,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

// JWT Middleware
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        await connectDB();
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        await connectDB();
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const user = new User({ email, password });
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: user._id, email: user.email },
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        await connectDB();
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Login successful',
            token,
            user: { id: user._id, email: user.email },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
    res.json({ user: { id: req.user._id, email: req.user.email } });
});

// Transaction Routes
app.get('/api/transactions', authMiddleware, async (req, res) => {
    try {
        await connectDB();
        const { page = 1, limit = 20, type, search, startDate, endDate, sortBy = 'date', sortOrder = 'desc' } = req.query;

        const query = { user: req.user._id };

        if (type && ['income', 'expense'].includes(type)) {
            query.type = type;
        }

        if (search) {
            query.$or = [
                { description: { $regex: search, $options: 'i' } },
                { fromWhere: { $regex: search, $options: 'i' } },
                { notes: { $regex: search, $options: 'i' } },
            ];
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const transactions = await Transaction.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Transaction.countDocuments(query);

        res.json({
            transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/transactions/stats', authMiddleware, async (req, res) => {
    try {
        await connectDB();

        const stats = await Transaction.aggregate([
            { $match: { user: req.user._id } },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' },
                },
            },
        ]);

        const income = stats.find(s => s._id === 'income')?.total || 0;
        const expense = stats.find(s => s._id === 'expense')?.total || 0;
        const balance = income - expense;

        // Get monthly stats for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyStats = await Transaction.aggregate([
            {
                $match: {
                    user: req.user._id,
                    date: { $gte: sixMonthsAgo },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' },
                        type: '$type',
                    },
                    total: { $sum: '$amount' },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        // Get expense breakdown by description/fromWhere
        const expenseBreakdown = await Transaction.aggregate([
            { $match: { user: req.user._id, type: 'expense' } },
            {
                $group: {
                    _id: { $ifNull: ['$fromWhere', '$description'] },
                    total: { $sum: '$amount' },
                },
            },
            { $sort: { total: -1 } },
            { $limit: 10 },
        ]);

        res.json({ income, expense, balance, monthlyStats, expenseBreakdown });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/transactions/recent', authMiddleware, async (req, res) => {
    try {
        await connectDB();

        const transactions = await Transaction.find({ user: req.user._id })
            .sort({ date: -1 })
            .limit(10);

        res.json({ transactions });
    } catch (error) {
        console.error('Get recent transactions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/transactions/all', authMiddleware, async (req, res) => {
    try {
        await connectDB();

        const transactions = await Transaction.find({ user: req.user._id })
            .sort({ date: -1 });

        res.json({ transactions });
    } catch (error) {
        console.error('Get all transactions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/transactions', authMiddleware, async (req, res) => {
    try {
        await connectDB();
        const { type, amount, description, fromWhere, notes, date } = req.body;

        if (!type || !amount || !description) {
            return res.status(400).json({ message: 'Type, amount, and description are required' });
        }

        if (!['income', 'expense'].includes(type)) {
            return res.status(400).json({ message: 'Type must be income or expense' });
        }

        if (amount < 0) {
            return res.status(400).json({ message: 'Amount must be positive' });
        }

        const transaction = new Transaction({
            type,
            amount: parseFloat(amount),
            description,
            fromWhere: fromWhere || '',
            notes: notes || '',
            date: date ? new Date(date) : new Date(),
            user: req.user._id,
        });

        await transaction.save();

        res.status(201).json({ message: 'Transaction created', transaction });
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/transactions/:id', authMiddleware, async (req, res) => {
    try {
        await connectDB();
        const { id } = req.params;
        const { type, amount, description, fromWhere, notes, date } = req.body;

        const transaction = await Transaction.findOne({ _id: id, user: req.user._id });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (type) transaction.type = type;
        if (amount !== undefined) transaction.amount = parseFloat(amount);
        if (description) transaction.description = description;
        if (fromWhere !== undefined) transaction.fromWhere = fromWhere;
        if (notes !== undefined) transaction.notes = notes;
        if (date) transaction.date = new Date(date);

        await transaction.save();

        res.json({ message: 'Transaction updated', transaction });
    } catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/transactions/:id', authMiddleware, async (req, res) => {
    try {
        await connectDB();
        const { id } = req.params;

        const transaction = await Transaction.findOneAndDelete({ _id: id, user: req.user._id });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json({ message: 'Transaction deleted' });
    } catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Export for Netlify
export const handler = serverless(app);
