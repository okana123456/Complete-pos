# DukaPOS Pro - Production Ready

A complete, production-ready Point of Sale (POS) and business management system with backend, database, security, and real payment integrations.

## 🚀 Features

### Core POS Features
- ✅ Multi-user authentication with JWT
- ✅ Role-based access control (Admin & Seller)
- ✅ Real-time inventory management
- ✅ Sales tracking & reporting
- ✅ Credit sales management
- ✅ Expense tracking
- ✅ KRA/VAT compliance reports
- ✅ Profit & Loss statements
- ✅ Excel export functionality

### Production Features
- ✅ PostgreSQL database with migrations
- ✅ Bcrypt password hashing
- ✅ JWT authentication
- ✅ API rate limiting
- ✅ CORS protection
- ✅ Input validation & sanitization
- ✅ Automated backups
- ✅ Receipt PDF generation
- ✅ M-Pesa API integration (Daraja)
- ✅ Email notifications
- ✅ Audit logging
- ✅ Multi-device synchronization

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/dukapos-pro.git
cd dukapos-pro
```

### 2. Install dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (if separate)
cd ../frontend
npm install
```

### 3. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE dukapos_pro;
\q

# Run migrations
cd backend
npm run migrate
```

### 4. Environment Configuration

Create `.env` file in the `backend` folder:

```env
# Server Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/dukapos_pro

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# M-Pesa Integration (Safaricom Daraja API)
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_SHORTCODE=your-paybill-or-till
MPESA_PASSKEY=your-passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30

# Security
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### 5. Start the application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🌐 Deployment

### Deploy to Render/Railway/Heroku

1. **Set environment variables** in your platform dashboard
2. **Add PostgreSQL addon**
3. **Deploy** using Git

### Deploy to VPS (Ubuntu)

```bash
# Install Node.js, PostgreSQL, Nginx
sudo apt update
sudo apt install nodejs npm postgresql nginx

# Clone and setup
git clone https://github.com/yourusername/dukapos-pro.git
cd dukapos-pro/backend
npm install --production

# Setup PM2 for process management
npm install -g pm2
pm2 start npm --name "dukapos" -- start
pm2 startup
pm2 save

# Configure Nginx as reverse proxy
sudo nano /etc/nginx/sites-available/dukapos
# [Add Nginx configuration]
sudo ln -s /etc/nginx/sites-available/dukapos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 📱 M-Pesa Integration Setup

1. **Register on Safaricom Daraja Portal**: https://developer.safaricom.co.ke
2. **Create an app** and get your Consumer Key & Secret
3. **Configure callback URL** (must be publicly accessible)
4. **Update .env** with your credentials
5. **Test in sandbox** before going live

## 🔒 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: All inputs sanitized
- **CORS Protection**: Configured for your domain
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input/output sanitization
- **HTTPS Enforced**: In production

## 🗄️ Database Schema

Tables:
- `users` - User accounts with hashed passwords
- `products` - Product catalog
- `sales` - Sales transactions
- `sale_items` - Individual sale items
- `credit_sales` - Credit records
- `expenses` - Business expenses
- `categories` - Product categories
- `suppliers` - Supplier information
- `journal_entries` - Accounting entries
- `audit_logs` - System activity logs
- `mpesa_transactions` - M-Pesa payment records

## 📊 API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token

### Users
- `GET /api/users` - List users (admin only)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Sales
- `GET /api/sales` - List sales
- `POST /api/sales` - Create sale
- `GET /api/sales/:id` - Get sale details
- `GET /api/sales/:id/receipt` - Generate PDF receipt

### Reports
- `GET /api/reports/dashboard` - Dashboard statistics
- `GET /api/reports/sales` - Sales report
- `GET /api/reports/inventory` - Inventory report
- `GET /api/reports/profit-loss` - P&L statement
- `GET /api/reports/kra` - KRA/VAT report

### M-Pesa
- `POST /api/mpesa/stk-push` - Initiate STK push
- `POST /api/mpesa/callback` - M-Pesa callback
- `GET /api/mpesa/status/:id` - Check payment status

## 🔄 Backup & Recovery

Automated daily backups at 2 AM (configurable):
```bash
# Manual backup
npm run backup

# Restore from backup
npm run restore -- backup-2024-02-04.sql
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📝 Default Credentials

**After first run, login with:**
- Username: `admin`
- Password: `Admin@123`

**⚠️ IMPORTANT:** Change the default admin password immediately after first login!

## 🛠️ Development

```bash
# Run in development mode with hot reload
npm run dev

# Run database migrations
npm run migrate

# Seed database with demo data
npm run seed

# Generate new migration
npm run migrate:create migration-name
```

## 📄 License

MIT License - See LICENSE file

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support

For issues and questions:
- GitHub Issues: https://github.com/yourusername/dukapos-pro/issues
- Email: support@dukapos.com

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Barcode scanner integration
- [ ] Customer loyalty program
- [ ] SMS notifications
- [ ] Multi-currency support
- [ ] Advanced analytics with charts
- [ ] Employee time tracking
- [ ] Customer management CRM

## ⚠️ Production Checklist

Before deploying to production:

- [ ] Change default admin password
- [ ] Set strong JWT_SECRET
- [ ] Configure real M-Pesa credentials
- [ ] Set up SSL certificate (HTTPS)
- [ ] Configure email notifications
- [ ] Enable automated backups
- [ ] Set up monitoring (e.g., PM2, Sentry)
- [ ] Configure firewall rules
- [ ] Set up domain and DNS
- [ ] Test all features thoroughly
- [ ] Review security settings
- [ ] Set up error logging

---

**Made with ❤️ for small businesses in Kenya and beyond**
