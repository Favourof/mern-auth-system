# MERN Authentication System

A production-ready authentication system built with MongoDB, Express, React, Node.js, and TypeScript.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-brightgreen)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey)](https://expressjs.com/)

## 🚀 Features

### Authentication

- ✅ User registration with email verification
- ✅ Secure login with JWT (Access + Refresh tokens)
- ✅ Password reset via email
- ✅ Change password (for logged-in users)
- ✅ Session management with token rotation
- ✅ True logout (token invalidation)

### Security

- ✅ Password hashing with bcrypt
- ✅ httpOnly cookies for refresh tokens
- ✅ Rate limiting on auth endpoints
- ✅ Input validation and sanitization
- ✅ Role-based access control (RBAC)
- ✅ XSS protection
- ✅ CORS configuration

### Admin Features

- ✅ User management dashboard
- ✅ View all users
- ✅ Update user roles
- ✅ Delete users
- ✅ User statistics

### Email Features

- ✅ Email verification
- ✅ Welcome emails
- ✅ Password reset emails
- ✅ Resend verification option

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🛠 Tech Stack

**Backend:**

- Node.js & Express.js
- TypeScript
- MongoDB & Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- Resend
- express-rate-limit
- express-validator
- cookie-parser

**Development:**

- ts-node-dev
- TypeScript
- ESLint (optional)
- Prettier (optional)

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/Favourof/mern-auth-system
cd mern-auth-system
```

2. **Install dependencies**

```bash
npm install
```

3. **Create .env file**

```bash
cp .env.example .env
```

4. **Configure environment variables** (see [Environment Variables](#environment-variables))

5. **Start development server**

```bash
npm run dev
```

Server will run on `http://localhost:5000`

## 🔐 Environment Variables

Create a `.env` file in the server directory:

```env
# Server Configuration
PORT=
NODE_ENV=development

# Database
MONGO_URL=mongodb://localhost:27017/auth-db

# JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your_access_token_secret_here
JWT_REFRESH_SECRET=your_refresh_token_secret_here

# Client URL
CLIENT_URL=https://client-mu-ebon.vercel.app/

# Email Configuration
RESEND_API_KEY=
EMAIL_FROM=noreply@yourapp.com
```

### Generate JWT Secrets

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run this twice to generate two different secrets.

## 📖 API Documentation

### Base URL

- `base_url`: `http://localhost:4002/api`

---

## 🧪 Testing

### Manual Testing with Postman

1. **Import Collection**
2. **Set Environment Variables**
   - `base_url`: `http://localhost:4002/api`
   - `access_token`: (set after login)

### Test Flow

```bash
# 1. Register
POST /api/auth/register

# 2. Check console for verification link

# 3. Verify email
POST /api/auth/verify-email

# 4. Login
POST /api/auth/login

# 5. Access protected route
GET /api/auth/me

# 6. Logout
POST /api/auth/logout

# 7. Refreash-token
POST /api/auth/refresh

# 8. Request Password Reset
POST /api/auth/forgot-password

# 9. Reset-password
POST /api/auth/reset-password

# 10. Change-password
GET /api/auth/change-password

# 11. Get All user
GET api/admin/users

# 12. Get user by id
GET api/admin/users/:id

# 13. Change User Role
PUT api/admin/users/:id

# 14. get user stats
GET api/admin/stats

# 15. Delete user by id

Delete api/admin/:id
```

### Postman test Screenshot

- ![Register with email](./docs/images/assets/screenshots/Registration%20with%20email.png)
  ![login without verifying](./docs/images/assets/screenshots/login%20without%20verify.png)
  ![verify email](./docs/images/assets/screenshots/verify%20email.png)
  ![verification token from emal](./docs/images/assets/screenshots/verification%20token%20from%20email.png)
  ![resend verification email ](./docs/images/assets/screenshots/Resend%20verification%20.png)
  ![login after verifying](./docs/images/assets/screenshots/login%20after%20verifying%20.png)
  ![welcome email](./docs/images/assets/screenshots/welcome%20email%20after%20verivication.png)
  ![Protested Route](./docs/images/assets/screenshots/protect%20route%20.png)
  ![Refresh token](./docs/images/assets/screenshots/Refresh%20Token.png)
  ![log out](./docs/images/assets/screenshots/Log%20out.png)
  ![Password Resent](./docs/images/assets/screenshots/password%20Reset%20.png)
  ![password reset with emali and newpassword](./docs/images/assets/screenshots/password%20reset%20with%20token%20and%20nwepassword.png)
  ![Change password for login user](./docs/images/assets/screenshots/change%20password%20for%20login%20user.png)
  ![making request without acesstoken](./docs/images/assets/screenshots/making%20request%20without%20accessToken%20expire.png)
  ![get all user](./docs/images/assets/screenshots/get%20all%20users.png)
  ![Get user by id](./docs/images/assets/screenshots/Get%20user%20by%20Id.png)
  ![change user role](./docs/images/assets/screenshots/Change%20user%20role.png)
  ![admin route with unathtorized user](./docs/images/assets/screenshots/admin%20route%20with%20unauthorized%20user.png)

## 🚀 Deployment

### Deploy to Railway/Render

1. **Push to GitHub**

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Connect to Railway/Render**

- Import repository
- Add environment variables
- Deploy

3. **MongoDB Atlas Setup**

- Create cluster
- Whitelist Railway/Render IPs (or allow all)
- Update `MONGO_URL` in environment variables

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secrets
- [ ] Configure real email service (SendGrid, AWS SES)
- [ ] Enable CORS for your frontend domain only
- [ ] Set secure cookie options
- [ ] Add monitoring (e.g., Sentry)
- [ ] Enable HTTPS
- [ ] Set up proper logging

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👤 Author

**Your Name**

- GitHub: [@favourof](https://github.com/favourof)
- LinkedIn: [Favour Omotosho Ezekiel](https://www.linkedin.com/in/favour-omotosho-ezekiel/)

---

## 🙏 Acknowledgments

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT.io](https://jwt.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

---

## 📞 Support

For support, email favourtobiloba200@gmail.com or open an issue on GitHub.

---

## Frontend url

https://client-mu-ebon.vercel.app/

**⭐ If you find this project helpful, please give it a star!**
