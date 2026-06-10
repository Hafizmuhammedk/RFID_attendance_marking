# RFID Attendance System — Frontend

A production-ready **React 18 + Vite + TypeScript + Tailwind CSS** admin dashboard for an ESP32-based RFID attendance system, backed by **Firebase Realtime Database**.

---

## ⚡ Quick Start

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Configure Firebase (see Firebase Setup below)
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# 4. Start development server
npm run dev
# → Opens at http://localhost:3000
```

---

## 🔥 Firebase Setup

### 1. Create Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it (e.g. `rfid-attendance`)
3. Disable Google Analytics (optional) → **Create project**

### 2. Enable Realtime Database
1. Sidebar → **Build → Realtime Database**
2. Click **Create Database**
3. Choose your region (e.g. `asia-southeast1`)
4. Start in **locked mode** → **Done**
5. Go to **Rules** tab → paste the contents of `database.rules.json` → **Publish**

### 3. Enable Authentication
1. Sidebar → **Build → Authentication**
2. Click **Get started**
3. **Sign-in method** tab → Enable **Email/Password**
4. **Users** tab → **Add user** → enter your admin email + password

### 4. Register Web App & Copy Env Vars
1. Project Overview → click **`</>`** (Web) icon
2. Register app (name: `rfid-attendance-web`)
3. Copy the `firebaseConfig` object values into `.env.local`:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## 🗂 Firebase RTDB Schema

```json
{
  "system": {
    "enrollMode": false,
    "lastHeartbeat": 1715000000000,
    "esp32Status": "online",
    "pendingCardUID": ""
  },
  "users": {
    "AB12CD34": {
      "cardUID": "AB12CD34",
      "name": "Hafis Muhammed",
      "employeeId": "CSA2022001",
      "role": "student",
      "department": "Computer Applications",
      "enrolledAt": 1715000000000,
      "enrolledBy": "admin@school.edu",
      "isActive": true
    }
  },
  "attendance": {
    "2026-05-12": {
      "AB12CD34_1715000000000": {
        "cardUID": "AB12CD34",
        "userId": "AB12CD34",
        "name": "Hafis Muhammed",
        "timestamp": 1715000000000,
        "status": "check-in",
        "date": "2026-05-12"
      }
    }
  }
}
```

---

## 🤖 ESP32 Integration

Use `main_firebase.py` (in the root of this repo) as your ESP32 firmware:

### Required Steps:
1. **Install urequests and ujson** on your ESP32:
   - Download [`urequests.py`](https://raw.githubusercontent.com/micropython/micropython-lib/master/python-ecosys/urequests/urequests.py)
   - `ujson` is built into MicroPython — no install needed
   - Upload `urequests.py` to `/lib/` on the ESP32

2. **Edit `main_firebase.py`** — set your Firebase URL:
   ```python
   FIREBASE_URL = "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com"
   ```

3. **Keep your existing `config/settings.py`** — WiFi credentials and pin definitions are read from there.

4. **NTP sync is required** for accurate timestamps. The system uses `ntptime.settime()` at boot.

5. **Upload `main_firebase.py`** to the ESP32 root as `main.py`.

### What the ESP32 writes:
| Path | Operation | When |
|------|-----------|------|
| `system/lastHeartbeat` | PATCH | Every 10 seconds |
| `system/esp32Status` | PATCH | On boot and heartbeat |
| `system/pendingCardUID` | PUT | When in enrollMode and card scanned |
| `attendance/{date}/{uid}_{ts}` | PUT | On every card scan |

### What the ESP32 reads:
| Path | When |
|------|------|
| `system/enrollMode` | Every scan loop iteration |

---

## 🚀 Deployment to Firebase Hosting

```bash
# 1. Install Firebase CLI (first time only)
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Set your project ID in .firebaserc
# Edit .firebaserc → replace "your-firebase-project-id" with your actual project ID

# 4. Build the production bundle
npm run build

# 5. Deploy
firebase deploy --only hosting

# Or deploy hosting + database rules together:
firebase deploy --only hosting,database
```

The app will be live at: `https://YOUR_PROJECT_ID.web.app`

---

## 🏗 File Structure

```
frontend/
├── .env.example              ← Template env vars (safe to commit)
├── .env.local                ← Your actual credentials (gitignored)
├── .gitignore
├── .firebaserc               ← Firebase project alias
├── firebase.json             ← Firebase Hosting config
├── database.rules.json       ← RTDB security rules
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
└── src/
    ├── App.tsx               ← Router + providers
    ├── main.tsx
    ├── index.css
    ├── config/firebase.ts    ← Firebase init
    ├── types/index.ts        ← All TypeScript interfaces
    ├── context/
    │   ├── AuthContext.tsx
    │   └── AttendanceContext.tsx
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useAttendance.ts
    │   ├── useEnrollment.ts
    │   └── useESP32Status.ts
    ├── services/firebase/
    │   ├── attendance.ts
    │   ├── users.ts
    │   └── enrollment.ts
    ├── services/validation.ts
    ├── pages/
    │   ├── LoginPage.tsx
    │   ├── DashboardPage.tsx
    │   ├── HomePage.tsx
    │   ├── AttendancePage.tsx
    │   ├── EnrollmentPage.tsx
    │   ├── UsersPage.tsx
    │   ├── AnalyticsPage.tsx
    │   └── SettingsPage.tsx
    └── components/
        ├── layout/           ← Sidebar, TopBar, AuthGuard
        ├── attendance/       ← Table, Row, FilterBar, LiveBadge
        ├── enrollment/       ← Panel, Form, Waiting, Success
        ├── users/            ← Card, Table, DeleteModal
        ├── analytics/        ← DailyChart, SummaryCards
        └── ui/               ← Button, Input, Modal, Badge, etc.
```

---

## 🔐 Security Notes

- **Never commit `.env.local`** — it's in `.gitignore`
- The RTDB `attendance/.write = true` rule allows the ESP32 to write without auth
- All other nodes require Firebase Auth (`auth != null`)
- Admin login is Firebase Email/Password — add admin users in Firebase Console only

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v3 |
| Database | Firebase Realtime Database |
| Auth | Firebase Authentication |
| Hosting | Firebase Hosting |
| State | React Context API + useReducer |
| Date/Time | date-fns |
| Icons | lucide-react |
| Toasts | react-hot-toast |
| Charts | recharts |

---

## 🐛 Troubleshooting

| Problem | Fix |
|---------|-----|
| `VITE_FIREBASE_*` is undefined | Check `.env.local` exists and vars start with `VITE_` |
| Login fails | Verify user exists in Firebase Console → Authentication → Users |
| No real-time updates | Check browser console for RTDB permission errors; verify rules are published |
| ESP32 not writing | Check WiFi, Firebase URL, and that `system/` write rules allow the call |
| Enrollment stuck | Go to Settings → Force Stop Enrollment; or manually set `system/enrollMode = false` in Firebase Console |
