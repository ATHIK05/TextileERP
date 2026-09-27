# 🛠️ TextileERP Application Setup Guide

This guide details how to set up the **TextileERP** application on a new developer machine. The application is built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and uses **Prisma** with **MySQL** for the database.

## 📋 Prerequisites

Ensure the following are installed on the system:

1.  **Node.js**: Version 20.x or higher (Recommended for Next.js 15).
    *   Verify with: `node -v`
2.  **npm**: Installed automatically with Node.js.
3.  **MySQL Server**: A running MySQL instance (local or remote).
4.  **Git**: For cloning the repository.

## 🚀 Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/ATHIK05/TextileERP.git
cd ERP
```

### 2. Install Dependencies

Install the project dependencies using npm:

```bash
npm install
```

## ⚙️ Environment Configuration

1.  Create a file named `.env` in the root directory of the project.
2.  Add the following required environment variables to the `.env` file:

```env
# Database Connection
# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="mysql://root:password@localhost:3306/textile_erp"

# NextAuth Configuration
# You can generate a secret using: openssl rand -base64 32
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

> **Note:** Update the `DATABASE_URL` with your actual MySQL credentials and database name.

## 🗄️ Database Setup

The project uses Prisma ORM. You need to push the schema to your MySQL database.

### Option A: Development Push (Quick Start)
This syncs the schema with the database without creating migration history files. Good for initial setup.

```bash
npm run db:push
# or
npx prisma db push
```

### Option B: Migration (Production-like)
If you want to manage migration history:

```bash
npm run db:migrate
# or
npx prisma migrate dev --name init
```

### Option C: Seed Database (If available)
If there is a seed script configured in `package.json`, run it to populate initial data:
```bash
npx prisma db seed
```
*(Note: Check `package.json` to see if a seed script is defined).*

## 🏃‍♂️ Running the Application

### Development Server

Start the development server with hot-reloading:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

To test the production build locally:

```bash
npm run build
npm start
```

## 🛠️ Common Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server |
| `npm run build` | Builds the application for production |
| `npm start` | Starts the production server |
| `npm run lint` | Runs ESLint to check for code issues |
| `npm run db:push` | Pushes Prisma schema changes to the DB |
| `npx prisma studio` | Opens a GUI to view/edit database records |

## 🐛 Troubleshooting

*   **Database Connection Errors:** Ensure MySQL is running and the credentials in `DATABASE_URL` are correct.
*   **Prisma Client Errors:** If you change `schema.prisma`, remember to run `npx prisma generate` to update the client (usually happens automatically with `db:push` or `dev`).
*   **Port Conflicts:** If port 3000 is in use, Next.js usually tries 3001, but you can specify a port: `npm run dev -- -p 4000`.

---
**System Ready!** You should now have a fully functional development environment.
