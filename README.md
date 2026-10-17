# MediTrack 💊

**Dual-Sided Healthcare Marketplace for Real-Time Medicine Availability**

Connecting patients with verified local pharmacies in real-time. Features handwritten prescription OCR powered by **Gemini Vision** and a multilingual AI pharmacy assistant powered by the **Gemini API**, built on top of **Next.js App Router**, **Tailwind CSS**, **Shadcn UI**, and **Supabase PostgreSQL** with Row Level Security (RLS).

---

## ✨ Key Features

### 1. 🏥 Patient Portal (Demand Side)
- **Live Inventory Search**: Real-time search across local pharmacy stocks by brand or generic formula.
- **Geolocation & Distance**: Automatically calculates Haversine distance in km from patient coordinates to each pharmacy.
- **Prescription OCR (Gemini Vision)**: Upload or snap a photo of a doctor's handwritten prescription. MediTrack extracts medicine names, decodes medical shorthand (`1-0-1, AC` ➔ morning & night before meals), and checks local stock.
- **Stock Status Badges**: Clear visual badges (`In Stock`, `Low Stock`, `Out of Stock`) and direct phone call links.

### 2. 🏪 Pharmacy Owner Portal (Supply Side)
- **Store KPIs**: Real-time metrics for total SKUs, total units, low stock alerts (<30 units), and restock warnings.
- **Inventory Management**: Add, update, and remove medicines with quantity, price (₹ INR), dosage, and expiry dates.
- **Supabase RLS Protected**: Owners can only manage their own pharmacy's inventory; patients have read-only access.
- **Quick Presets**: 1-click popular medicine templates for fast stock additions.

### 3. 🤖 Multilingual AI Chatbot (Gemini API)
- **Floating AI Assistant**: Available on all pages to answer medicine inquiries.
- **Multilingual Support**: Real-time answers in **ಕನ್ನಡ (Kannada)**, **हिंदी (Hindi)**, **English**, **தமிழ் (Tamil)**, and **తెలుగు (Telugu)**.
- **Inventory Grounding**: Chat responses are strictly grounded on live Supabase inventory to quote exact stores, prices, and stock numbers.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Styling**: Tailwind CSS & Shadcn UI
- **Database & Auth**: Supabase Cloud PostgreSQL with Row Level Security (RLS)
- **AI Models**: Google Gemini 3.8 Flash (Multimodal OCR & Multilingual Chat)
- **Icons**: Lucide React

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/prembt1206/MediTrack.git
cd MediTrack
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Optional: Direct PostgreSQL URI for migration script
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Google Gemini API Key
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```

### 4. Database Setup & Migrations
Apply the initial schema to Supabase:
```bash
npm run migrate
```
*Or copy and paste `supabase/migrations/001_initial_schema.sql` into the Supabase Dashboard SQL Editor.*

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📂 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts      # Multilingual Gemini Chatbot API
│   │   │   └── ocr/route.ts       # Gemini Vision Prescription OCR API
│   │   ├── login/page.tsx         # Auth: Google OAuth, Email/Pass, Email OTP
│   │   ├── patient/page.tsx       # Patient search & prescription scanner
│   │   ├── pharmacy/page.tsx      # Pharmacy Owner dashboard & stock table
│   │   ├── layout.tsx             # Root layout with AuthProvider
│   │   └── page.tsx               # Landing page
│   ├── components/
│   │   ├── ui/                    # Reusable Shadcn UI components
│   │   ├── ChatWidget.tsx         # Floating multilingual chat widget
│   │   └── Navbar.tsx             # Responsive header with role switcher
│   ├── context/
│   │   └── AuthContext.tsx        # Authentication & Role state management
│   ├── lib/
│   │   ├── supabase/              # Supabase clients & fallback data service
│   │   └── utils.ts               # Helper utilities & Haversine distance
│   └── types/
│       └── database.ts            # TypeScript interfaces
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Core SQL DDL, RLS policies & seed data
└── scripts/
    └── migrate.js                 # Node.js automated migration runner
```
