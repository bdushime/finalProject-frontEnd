#  Tracknity - Frontend Website

The modern, responsive, and role-driven user interface for the **Tracknity Equipment Tracking System**. Built to streamline university/company equipment management across different user types.

##  Tech Stack
* **Framework:** React.js (via Vite)
* **Styling:** Tailwind CSS & Shadcn UI
* **Routing:** React Router v6
* **Data Visualization:** Recharts
* **Document Generation:** jsPDF & jsPDF-AutoTable
* **File Parsing:** SheetJS (xlsx) for bulk uploads

##  Key Features
* **Multi-Role Dashboards:** Unique, tailored interfaces for Students, IT Staff, Security, and System Admins.
* **Automated PDF Reports:** Generates professional, downloadable PDF ledgers of equipment history.
* **Bulk Device Upload:** Allows Admins/Security to import dozens of devices instantly via Excel/CSV.
* **Dynamic Analytics:** Visualizes system health, equipment usage, and overdue trends.
* **Internationalization:** Prepared for multi-language support (i18next).

## 🛠️ Getting Started

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/tracknity-frontend.git
cd tracknity-frontend
\`\`\`

### 2. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Environment Variables
Create a `.env` file in the root directory and point it to your backend API:
\`\`\`env
# Use localhost for development, or your live Render URL for production
VITE_API_URL=http://localhost:5000/api
\`\`\`

### 4. Run the development server
\`\`\`bash
npm run dev
\`\`\`
The app should now be running on `http://localhost:3000` (or `5173` depending on your Vite config).

## 📦 Building for Production
\`\`\`bash
npm run build
\`\`\`
This will generate an optimized `dist` folder ready to be deployed to Netlify, Vercel, or any static host.
