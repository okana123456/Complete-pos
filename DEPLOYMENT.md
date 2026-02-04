# Complete Production Deployment Guide

## Quick Start (5 Minutes)

### 1. Clone and Install
```bash
git clone https://github.com/yourusername/dukapos-pro.git
cd dukapos-pro
cd backend && npm install
```

### 2. Database Setup
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres psql
CREATE DATABASE dukapos_pro;
CREATE USER dukapos WITH ENCRYPTED PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE dukapos_pro TO dukapos;
\q
```

### 3. Configure Environment
```bash
cp .env.example .env
nano .env  # Edit with your settings
```

Minimum required settings:
```env
DATABASE_URL=postgresql://dukapos:yourpassword@localhost:5432/dukapos_pro
JWT_SECRET=your-random-secret-key-here-make-it-long-and-complex
NODE_ENV=production
```

### 4. Initialize Database
```bash
npm run migrate  # Creates all tables
```

### 5. Start Server
```bash
npm start  # Production mode
# OR
npm run dev  # Development mode with auto-reload
```

Server will start on http://localhost:3000

### 6. First Login
Open browser to http://localhost:3000

**Default Admin Credentials:**
- Username: `admin`
- Password: `Admin@123`

**⚠️ CRITICAL: Change this password immediately after first login!**

---

## Production Deployment Options

### Option 1: Deploy to Render.com (Recommended - Free Tier Available)

1. **Create Render account** at https://render.com

2. **Create PostgreSQL database:**
   - Click "New +" → "PostgreSQL"
   - Name: dukapos-db
   - Copy the "Internal Database URL"

3. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Name: dukapos-pro
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`

4. **Set Environment Variables:**
   ```
   NODE_ENV=production
   DATABASE_URL=[paste internal database URL]
   JWT_SECRET=[generate random string]
   PORT=3000
   ```

5. **Deploy!**
   - Click "Create Web Service"
   - Wait 5-10 minutes for build

6. **Run Migrations:**
   - Go to "Shell" tab
   - Run: `cd backend && npm run migrate`

Your app is live at: https://your-app-name.onrender.com

---

### Option 2: Deploy to Railway.app

1. **Create account** at https://railway.app

2. **New Project** → "Deploy from GitHub repo"

3. **Add PostgreSQL:**
   - Click "+ New" → "Database" → "Add PostgreSQL"
   - Copy the DATABASE_URL from variables

4. **Configure Service:**
   - Click on your service
   - Settings → Environment Variables:
     ```
     NODE_ENV=production
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     JWT_SECRET=your-secret-here
     ```

5. **Deploy Settings:**
   - Start Command: `cd backend && npm start`
   - Deploy!

6. **Run Migrations:**
   - Open terminal in Railway dashboard
   - `cd backend && npm run migrate`

---

### Option 3: Deploy to Your VPS (DigitalOcean, Linode, AWS EC2)

#### Prerequisites
- Ubuntu 22.04 LTS server
- Root or sudo access
- Domain name (optional but recommended)

#### Step-by-Step Setup

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# 4. Install Nginx
sudo apt install -y nginx

# 5. Install PM2 (Process Manager)
sudo npm install -g pm2

# 6. Create database
sudo -u postgres psql
CREATE DATABASE dukapos_pro;
CREATE USER dukapos WITH ENCRYPTED PASSWORD 'strongpasswordhere';
GRANT ALL PRIVILEGES ON DATABASE dukapos_pro TO dukapos;
\q

# 7. Clone repository
cd /var/www
sudo git clone https://github.com/yourusername/dukapos-pro.git
cd dukapos-pro
sudo chown -R $USER:$USER .

# 8. Install dependencies
cd backend
npm install --production

# 9. Create .env file
nano .env
# Add your configuration

# 10. Run migrations
npm run migrate

# 11. Start with PM2
pm2 start server.js --name dukapos
pm2 save
pm2 startup  # Follow the instructions

# 12. Configure Nginx
sudo nano /etc/nginx/sites-available/dukapos
```

Add this Nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/dukapos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 13. Setup SSL with Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 14. Setup firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

Your app is now live at https://yourdomain.com

---

## M-Pesa Integration Setup

### 1. Get Daraja API Credentials

1. Go to https://developer.safaricom.co.ke
2. Sign up / Log in
3. Create a new app
4. Note your:
   - Consumer Key
   - Consumer Secret
   - Passkey (for Lipa Na M-Pesa Online)

### 2. Configure Callback URL

Your callback URL must be publicly accessible:
```
https://yourdomain.com/api/mpesa/callback
```

**For Development/Testing:**
- Use ngrok: `ngrok http 3000`
- Use the ngrok URL: `https://abc123.ngrok.io/api/mpesa/callback`

### 3. Update .env

```env
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_till_or_paybill_number
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
MPESA_ENVIRONMENT=sandbox  # Change to 'production' when ready
```

### 4. Test in Sandbox

1. Use test credentials from Daraja portal
2. Use test phone numbers provided
3. Test STK push flow
4. Verify callbacks are received

### 5. Go Live

1. Submit your app for review on Daraja portal
2. Get production credentials
3. Update .env with production values
4. Change `MPESA_ENVIRONMENT=production`
5. Restart server

---

## Email Notifications Setup

### Using Gmail

1. **Enable 2-Factor Authentication** on your Google account

2. **Create App Password:**
   - Go to Google Account Settings
   - Security → 2-Step Verification
   - App passwords
   - Generate password for "Mail"

3. **Update .env:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
```

### Using Other Email Services

**SendGrid:**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

**Mailgun:**
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your-mailgun-username
EMAIL_PASSWORD=your-mailgun-password
```

---

## Backup & Recovery

### Automated Backups

Backups run automatically based on schedule in .env:
```env
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *  # Daily at 2 AM
BACKUP_RETENTION_DAYS=30
```

### Manual Backup

```bash
npm run backup
```

Backup files saved to `backups/` directory.

### Restore from Backup

```bash
npm run restore -- backups/backup-2024-02-04-023000.sql
```

### Setup Automated Cloud Backups

#### To AWS S3:
```bash
# Install AWS CLI
sudo apt install -y awscli

# Configure
aws configure

# Add to crontab
crontab -e
# Add: 0 3 * * * aws s3 sync /var/www/dukapos-pro/backups s3://your-bucket/dukapos-backups
```

#### To Google Drive (using rclone):
```bash
# Install rclone
curl https://rclone.org/install.sh | sudo bash

# Configure
rclone config

# Add to crontab
crontab -e
# Add: 0 3 * * * rclone sync /var/www/dukapos-pro/backups remote:dukapos-backups
```

---

## Security Checklist

Before going live:

- [ ] Changed default admin password
- [ ] Set strong JWT_SECRET (min 32 characters)
- [ ] Configured firewall (ufw/iptables)
- [ ] Enabled HTTPS/SSL certificate
- [ ] Set NODE_ENV=production
- [ ] Configured proper CORS origins
- [ ] Set up automated backups
- [ ] Configured email notifications
- [ ] Set up monitoring (PM2, Uptime Robot)
- [ ] Reviewed all environment variables
- [ ] Tested M-Pesa integration
- [ ] Set up error logging
- [ ] Configured rate limiting
- [ ] Reviewed user permissions
- [ ] Set up database connection pooling
- [ ] Configured session timeout
- [ ] Set up audit logging

---

## Monitoring & Maintenance

### PM2 Monitoring
```bash
pm2 status      # Check status
pm2 logs        # View logs
pm2 restart all # Restart app
pm2 monit       # Real-time monitoring
```

### Database Maintenance
```bash
# Vacuum database (weekly)
sudo -u postgres psql dukapos_pro -c "VACUUM ANALYZE;"

# Check database size
sudo -u postgres psql dukapos_pro -c "SELECT pg_size_pretty(pg_database_size('dukapos_pro'));"
```

### Log Rotation
```bash
# Configure logrotate
sudo nano /etc/logrotate.d/dukapos

# Add:
/var/www/dukapos-pro/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

### Uptime Monitoring

Use free services:
- UptimeRobot (https://uptimerobot.com)
- StatusCake (https://www.statuscake.com)
- Pingdom (https://www.pingdom.com)

---

## Troubleshooting

### Server won't start
```bash
# Check logs
pm2 logs dukapos

# Check database connection
psql -U dukapos -d dukapos_pro -h localhost

# Check port availability
sudo netstat -tlnp | grep 3000
```

### Database errors
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check connection
psql -U dukapos -d dukapos_pro
```

### M-Pesa not working
- Verify callback URL is publicly accessible
- Check Daraja portal for errors
- Verify credentials in .env
- Check logs for callback responses

### 502 Bad Gateway (Nginx)
```bash
# Check if app is running
pm2 status

# Check Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Support & Updates

### Get Updates
```bash
cd /var/www/dukapos-pro
git pull origin main
cd backend
npm install
pm2 restart dukapos
```

### Rollback
```bash
git log  # Find commit hash
git checkout <commit-hash>
pm2 restart dukapos
```

### Community Support
- GitHub Issues: https://github.com/yourusername/dukapos-pro/issues
- Documentation: https://docs.dukapos.com
- Email: support@dukapos.com

---

## Performance Optimization

### Enable Gzip in Nginx
Add to nginx config:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### Database Indexing
Indexes are automatically created by migrations for optimal performance.

### Caching
Consider adding Redis for session storage and caching:
```bash
sudo apt install -y redis-server
npm install redis connect-redis
```

---

**You're all set! 🎉**

Your production-ready POS system is now deployed and secure.
