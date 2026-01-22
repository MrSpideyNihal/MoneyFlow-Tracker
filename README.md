# MoneyFlow Tracker 💰

A modern personal finance tracker built with MERN stack, designed for easy Netlify deployment.

![MoneyFlow Tracker](https://img.shields.io/badge/MoneyFlow-Tracker-blue)

## Features ✨

- **Authentication**: Secure JWT-based register/login
- **Dashboard**: Real-time balance, income & expense stats with beautiful charts
- **Transactions**: Full CRUD with search, filters, and pagination
- **Charts**: Expense breakdown pie chart & Income vs Expenses bar chart
- **Export**: Download transactions as CSV or generate PDF reports
- **Responsive**: Works seamlessly on desktop and mobile
- **Dark Mode**: Beautiful dark theme with glassmorphism design

## Tech Stack 🛠️

### Frontend
- React 18 (Vite)
- Tailwind CSS
- React Router v6
- Recharts
- jsPDF + autoTable
- React Hot Toast
- React Icons

### Backend (Netlify Functions)
- Express.js (Serverless)
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs

## Project Structure 📁

```
MoneyFlow-Tracker/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── netlify.toml
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── utils/
│   │   └── api.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── StatsCard.jsx
│   │   ├── Charts.jsx
│   │   ├── TransactionCard.jsx
│   │   ├── TransactionModal.jsx
│   │   ├── ConfirmModal.jsx
│   │   └── ExportButtons.jsx
│   └── pages/
│       ├── Login.jsx
│       ├── Register.jsx
│       ├── Dashboard.jsx
│       └── Transactions.jsx
└── netlify/
    └── functions/
        ├── api.js
        └── package.json
```

## Local Development 🚀

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Netlify CLI (optional, for testing functions locally)

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd MoneyFlow-Tracker
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install

   # Install function dependencies
   cd netlify/functions
   npm install
   cd ../..
   ```

3. **Create environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/moneyflow?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random
   ```

4. **Run with Netlify CLI (recommended)**
   ```bash
   # Install Netlify CLI globally
   npm install -g netlify-cli

   # Start development server
   netlify dev
   ```
   This will run both frontend and functions together at http://localhost:8888

5. **Alternative: Run frontend only**
   ```bash
   npm run dev
   ```
   Note: API calls won't work without the Netlify functions running.

## Deployment to Netlify 🌐

### Option 1: Deploy via Git (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket

2. Go to [Netlify](https://app.netlify.com) and click "Add new site" → "Import an existing project"

3. Connect your repository

4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`

5. Add environment variables in Netlify:
   - Go to Site settings → Environment variables
   - Add `MONGODB_URI`: Your MongoDB connection string
   - Add `JWT_SECRET`: A strong random secret (generate one: `openssl rand -base64 32`)

6. Deploy!

### Option 2: Deploy via Netlify CLI

```bash
# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

## MongoDB Setup 🍃

1. Create a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account

2. Create a new cluster

3. Create a database user with read/write access

4. Get your connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user's password
   - Add your database name: `mongodb+srv://..../moneyflow?retryWrites=true&w=majority`

5. Whitelist IP addresses:
   - Go to Network Access → Add IP Address
   - For Netlify deployment, add `0.0.0.0/0` (allows all IPs)

## API Endpoints 📡

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Transactions
- `GET /api/transactions` - Get paginated transactions (with filters)
- `GET /api/transactions/recent` - Get last 10 transactions
- `GET /api/transactions/stats` - Get income/expense stats
- `GET /api/transactions/all` - Get all transactions (for export)
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction



## Environment Variables 🔐

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens (min 32 chars recommended) |

## License 📄

MIT License - feel free to use this project for your own purposes!

---

Made with ❤️ by Me * AI
