# Supabase PostgreSQL Migration Guide

## 🔄 Database Migration Complete

Your backend has been successfully migrated from SQLite to PostgreSQL for Supabase compatibility.

## 📋 **Changes Made:**

### **1. Dependencies Updated:**
- ✅ Replaced `sqlite3` with `pg` (PostgreSQL client)
- ✅ Added `@types/pg` for TypeScript support

### **2. Database Configuration:**
- ✅ Updated connection to use PostgreSQL connection pool
- ✅ Added SSL configuration for production
- ✅ Environment-based database URL configuration

### **3. SQL Syntax Updates:**
- ✅ Converted SQLite syntax to PostgreSQL
- ✅ Changed `?` placeholders to `$1, $2, $3...` format
- ✅ Updated column names to snake_case (PostgreSQL convention)
- ✅ Changed `TEXT` to `VARCHAR(255)` and `DATETIME` to `TIMESTAMP`

### **4. Schema Mapping:**
| Frontend Field | Database Column |
|---------------|-----------------|
| userId | user_id |
| mantraId | mantra_id |
| providerId | provider_id |
| createdAt | created_at |
| updatedAt | updated_at |

## 🚀 **Deployment Steps:**

### **1. Set up Supabase Project:**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy your database URL from Settings → Database → Connection string

### **2. Install Dependencies:**
```bash
cd mantra-tracker-backend
npm install
```

### **3. Environment Variables:**
Add to your Vercel backend environment variables:
```env
DATABASE_URL=postgresql://[username]:[password]@[host]:[port]/[database]
JWT_SECRET=your_super_secure_jwt_secret_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://your-backend-domain.vercel.app
NEXT_PUBLIC_FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### **4. Deploy Backend:**
```bash
vercel --prod
```

The database tables will be automatically created on the first API request.

## ✅ **Ready for Production:**

Your backend now supports:
- ✅ **Persistent PostgreSQL database**
- ✅ **Scalable Supabase infrastructure**
- ✅ **Production-ready connection pooling**
- ✅ **SSL security**
- ✅ **No more ephemeral SQLite issues**

## 🔧 **Testing:**

After deployment, test user registration:
1. Go to your frontend signup page
2. Create a new account
3. Check Supabase dashboard to see the data

The 500 error should now be resolved! 🎉