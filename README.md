# RFID Attendance Marking System

An ESP32 RFID attendance and door-lock project using an MFRC522 RFID reader, 1602 I2C LCD, DS3231 RTC, relay lock output, buzzer feedback, Firebase Realtime Database, and a React admin dashboard.

The system supports:

- RFID card attendance marking
- Door unlock on authorized card scan
- Firebase-based user enrollment
- Live attendance dashboard
- User management
- ESP32 online/offline status
- DS3231 RTC timekeeping with NTP sync
- LCD and buzzer status feedback

## Project Media

Paste your Google Drive links in this section after uploading each video/photo to Drive. In Google Drive, set sharing to `Anyone with the link` and permission to `Viewer`.

| Media | Google Drive link |
| --- | --- |
| Full circuit connection video/photo | [Open video](https://drive.google.com/file/d/1dgVEMReBqVqYYoX3DyCoEDrGOya38gLY/view?usp=sharing) |
| User adding video | [Open video](https://drive.google.com/file/d/1ZFlK5ClMJjPrCSiW7zxxtqAnvd7nFXeR/view?usp=sharing) |
| Enrolling video | [Open video](https://drive.google.com/file/d/1wywMF8EaxRGrlhLkk-YzL9NPKV7P6NXX/view?usp=sharing) |
| Attendance marking video | [Open video](https://drive.google.com/file/d/1YVTv3cFpiBh58skWB7okZiIOSw5h-iDh/view?usp=sharing) |

### Circuit Connection

[Watch circuit connection demo](https://drive.google.com/file/d/1dgVEMReBqVqYYoX3DyCoEDrGOya38gLY/view?usp=sharing)

### User Adding Flow

[Watch user adding demo](https://drive.google.com/file/d/1ZFlK5ClMJjPrCSiW7zxxtqAnvd7nFXeR/view?usp=sharing)

### RFID Enrollment Flow

[Watch RFID enrollment demo](https://drive.google.com/file/d/1wywMF8EaxRGrlhLkk-YzL9NPKV7P6NXX/view?usp=sharing)

### Attendance Marking Flow

[Watch attendance marking demo](https://drive.google.com/file/d/1YVTv3cFpiBh58skWB7okZiIOSw5h-iDh/view?usp=sharing)

## Hardware Required

| Component | Quantity | Notes |
| --- | ---: | --- |
| ESP32 DevKit V1 / ESP32-WROOM-32 board | 1 | Main controller |
| MFRC522 RFID reader | 1 | SPI RFID reader, use 3.3V only |
| RFID cards/tags | As needed | MIFARE-compatible cards/tags |
| 1602 LCD with I2C backpack | 1 | Default address in firmware is `0x27` |
| DS3231 RTC module | 1 | Keeps accurate date/time |
| Relay module | 1 | Active LOW relay output in firmware |
| Active buzzer | 1 | Audio feedback |
| Electronic door lock/solenoid/magnetic lock | 1 | Use an external supply if required |
| Jumper wires and breadboard/PCB | As needed | For wiring |
| External power supply | As needed | Required for most door locks |

## Circuit Connections

Important: power the MFRC522 RFID reader from `3.3V`, not `5V`. The ESP32 GPIO pins are not 5V tolerant.

### MFRC522 RFID Reader to ESP32

| MFRC522 pin | ESP32 pin | Purpose |
| --- | --- | --- |
| `SDA` / `SS` | `GPIO 5` | SPI chip select |
| `SCK` | `GPIO 18` | SPI clock |
| `MOSI` | `GPIO 23` | SPI data from ESP32 to RFID |
| `MISO` | `GPIO 19` | SPI data from RFID to ESP32 |
| `RST` | `GPIO 27` | RFID reset |
| `3.3V` | `3V3` | Power |
| `GND` | `GND` | Ground |

### 1602 I2C LCD to ESP32

| LCD I2C pin | ESP32 pin | Purpose |
| --- | --- | --- |
| `SDA` | `GPIO 21` | I2C data |
| `SCL` | `GPIO 22` | I2C clock |
| `VCC` | `5V` or `3.3V` | Depends on your LCD backpack |
| `GND` | `GND` | Ground |

If the LCD stays blank, adjust the contrast screw on the I2C backpack. If the LCD still does not display text, try changing `LCD_I2C_ADDR` from `0x27` to `0x3F` in `rfid_door_lock_v2.ino`.

### DS3231 RTC to ESP32

| DS3231 pin | ESP32 pin | Purpose |
| --- | --- | --- |
| `SDA` | `GPIO 21` | I2C data, shared with LCD |
| `SCL` | `GPIO 22` | I2C clock, shared with LCD |
| `VCC` | `3.3V` or `5V` | Most DS3231 modules support both |
| `GND` | `GND` | Ground |

The LCD and DS3231 share the same I2C bus. That is expected.

### Buzzer to ESP32

| Buzzer pin | ESP32 pin | Purpose |
| --- | --- | --- |
| `+` | `GPIO 2` | Buzzer signal |
| `-` | `GND` | Ground |

Use an active buzzer for the simplest setup. If your buzzer needs more current than an ESP32 pin can provide, drive it through a transistor.

### Relay Module to ESP32

| Relay module pin | ESP32 pin | Purpose |
| --- | --- | --- |
| `IN` | `GPIO 4` | Relay control |
| `VCC` | `5V` or relay-rated supply | Relay module power |
| `GND` | `GND` | Common ground |

The firmware treats the relay as active LOW:

- `GPIO 4 HIGH` means locked
- `GPIO 4 LOW` means unlocked

### Door Lock Power Wiring

Do not power a solenoid lock or magnetic lock directly from the ESP32.

Typical relay wiring:

| Lock supply/relay point | Connection |
| --- | --- |
| External supply positive | Relay `COM` |
| Relay `NO` | Door lock positive |
| Door lock negative | External supply negative |
| External supply negative | ESP32/relay `GND` if the relay module requires common ground |

Use `NO` if the lock should receive power only when access is granted. Use `NC` only if your lock design requires normally powered behavior.

## Firmware Pin Summary

These pin values are defined in `rfid_door_lock_v2.ino`.

| Function | ESP32 GPIO |
| --- | --- |
| Buzzer | `GPIO 2` |
| Relay | `GPIO 4` |
| RFID SS/SDA | `GPIO 5` |
| RFID RST | `GPIO 27` |
| RFID SCK | `GPIO 18` |
| RFID MOSI | `GPIO 23` |
| RFID MISO | `GPIO 19` |
| I2C SDA | `GPIO 21` |
| I2C SCL | `GPIO 22` |

## Repository Structure

```text
RFID_attendance_marking/
|-- rfid_door_lock_v2.ino       # ESP32 Arduino firmware
|-- esp32-20260406.bin          # ESP32 firmware image kept in repo
|-- create-admin.mjs            # Helper script for creating an admin user
|-- frontend/                   # React + Vite + Firebase dashboard
|-- docs/assets/                # Documentation notes
|-- README.md                   # Main project documentation
|-- LICENSE
```

## ESP32 Firmware Setup

### 1. Install Arduino IDE Support

1. Install Arduino IDE.
2. Add ESP32 board support from Espressif.
3. Select an ESP32 DevKit / ESP32-WROOM-32 board.
4. Select the correct COM port for your ESP32.

### 2. Install Arduino Libraries

Install these from Arduino Library Manager:

| Library | Author / package |
| --- | --- |
| `MFRC522` | GithubCommunity |
| `LiquidCrystal_I2C` | Frank de Brabander |
| `RTClib` | Adafruit |
| `Firebase ESP Client` | Mobizt |
| `ArduinoJson` | Benoit Blanchon, v6.x |

### 3. Configure Firmware

Open `rfid_door_lock_v2.ino` and update this block:

```cpp
#define WIFI_SSID        "YOUR_WIFI_NAME"
#define WIFI_PASSWORD    "YOUR_WIFI_PASSWORD"
#define FIREBASE_HOST    "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com"
#define FIREBASE_AUTH    "YOUR_DATABASE_SECRET_OR_TOKEN"
#define NTP_SERVER       "pool.ntp.org"
#define NTP_UTC_OFFSET   19800
```

For India, `NTP_UTC_OFFSET` is already set to `19800` seconds, which is UTC+5:30.

Security note: do not publish real WiFi passwords or Firebase secrets in public repositories.

### 4. Upload Firmware

1. Connect ESP32 with USB.
2. Open `rfid_door_lock_v2.ino` in Arduino IDE.
3. Choose board and port.
4. Click Upload.
5. Open Serial Monitor at `115200` baud.

Expected startup messages include:

```text
[RTC] DS3231 detected.
[RFID] MFRC522 detected.
[WIFI] Connected!
[FB] Firebase connected OK.
[SYSTEM] Ready - waiting for card scan.
```

## Firebase Setup

### 1. Create Firebase Project

1. Go to Firebase Console.
2. Create a new project.
3. Enable Realtime Database.
4. Enable Authentication with Email/Password sign-in.
5. Add an admin user in Firebase Authentication.

### 2. Database Rules

The rules are stored in `frontend/database.rules.json`.

Current behavior:

- `system` requires authenticated read/write.
- `users` requires authenticated read/write.
- `attendance` requires authenticated read and allows ESP32 write.

```json
{
  "rules": {
    "system": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "users": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "attendance": {
      ".read": "auth != null",
      ".write": true
    }
  }
}
```

### 3. Realtime Database Shape

```json
{
  "system": {
    "enrollMode": false,
    "lastHeartbeat": 1715000000,
    "esp32Status": "online",
    "pendingCardUID": "",
    "doorStatus": "locked",
    "failedAttempts": 0,
    "lastScan": {
      "uid": "AB:12:CD:34",
      "time": "12/05 09:30:00",
      "status": "granted"
    }
  },
  "users": {
    "AB:12:CD:34": {
      "cardUID": "AB:12:CD:34",
      "name": "Student Name",
      "employeeId": "CSA2026001",
      "role": "student",
      "department": "Computer Applications",
      "enrolledAt": 1715000000000,
      "enrolledBy": "admin@example.com",
      "isActive": true
    }
  },
  "attendance": {
    "2026-05-12": {
      "AB12CD34_1715000000000": {
        "cardUID": "AB:12:CD:34",
        "userId": "AB:12:CD:34",
        "name": "AB:12:CD:34",
        "timestamp": 1715000000000,
        "status": "check-in",
        "date": "2026-05-12"
      }
    }
  }
}
```

## Frontend Dashboard Setup

The dashboard is in `frontend/` and is built with React, Vite, TypeScript, Tailwind CSS, Firebase Auth, and Firebase Realtime Database.

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Create `frontend/.env.local`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. Run Development Server

```bash
npm run dev
```

Open the local Vite URL shown in the terminal.

### 4. Build for Production

```bash
npm run build
```

## How Enrollment Works

1. Log in to the dashboard.
2. Open the enrollment page.
3. Click `Start Enrollment`.
4. The dashboard writes `system/enrollMode = true`.
5. ESP32 reads `enrollMode` during polling.
6. LCD shows enrollment mode.
7. Scan a new RFID card.
8. ESP32 writes the scanned UID to `system/pendingCardUID`.
9. ESP32 also creates/activates `users/{UID}/isActive`.
10. Fill user details in the dashboard.
11. Click `Enroll Card`.
12. The dashboard saves the full user record under `users/{cardUID}`.

## How Attendance Marking Works

1. ESP32 waits for an RFID card.
2. User scans a card on the MFRC522 reader.
3. ESP32 formats the UID, for example `AB:12:CD:34`.
4. ESP32 checks the UID against active records in Firebase `users`.
5. If authorized:
   - LCD shows access granted.
   - Buzzer beeps once.
   - Relay unlocks the door for `UNLOCK_DURATION`.
   - Attendance is written to Firebase.
   - Door status is written as `unlocked`, then `locked`.
6. If unauthorized:
   - LCD shows access denied.
   - Buzzer beeps three times.
   - Denied attendance is written to Firebase.
   - Failed attempt count is updated.

## ESP32 and Firebase Paths

| Path | Direction | Description |
| --- | --- | --- |
| `/system/enrollMode` | Frontend to ESP32 | Starts or stops enrollment mode |
| `/system/pendingCardUID` | ESP32 to frontend | UID scanned during enrollment |
| `/system/lastHeartbeat` | ESP32 to frontend | Unix seconds heartbeat |
| `/system/esp32Status` | ESP32 to frontend | Online/offline status string |
| `/system/doorStatus` | ESP32 to frontend | `locked` or `unlocked` |
| `/system/lastScan` | ESP32 to frontend | Last scanned UID, time, status |
| `/system/failedAttempts` | ESP32 to frontend | Consecutive denied scans |
| `/users/{UID}` | Frontend and ESP32 | Registered RFID users |
| `/attendance/{date}/{recordId}` | ESP32 to frontend | Attendance records |

## Buzzer Feedback

| Event | Beep pattern |
| --- | --- |
| System ready | 2 short beeps |
| Firebase connected | 1 short beep |
| Firebase failed/offline | 2 short beeps |
| Access granted | 1 beep |
| Access denied | 3 beeps |
| Too many failed scans | 5 beeps |
| Enrollment mode started | 2 short beeps |

## LCD Messages

| State | LCD output |
| --- | --- |
| Boot | `RFID Lock v2` / `Initializing..` |
| Ready | Date and time from RTC |
| Waiting for scan | `Scan Your Card` |
| Enrollment | `ENROLL MODE` / `Scan Card Now` |
| Granted | `Access Granted!` |
| Denied | `Access Denied!` |
| Door locked | `Door Locked.` |
| RTC missing | `RTC not found!` |
| RFID wiring issue | `RFID Wiring Err` |

## Troubleshooting

| Problem | Check |
| --- | --- |
| RFID not detected | Confirm `SS=GPIO5`, `SCK=GPIO18`, `MOSI=GPIO23`, `MISO=GPIO19`, `RST=GPIO27`, and 3.3V power |
| Card scan does nothing | Check Serial Monitor at `115200`, verify card is close to antenna |
| LCD is blank | Adjust contrast screw, check `SDA=GPIO21`, `SCL=GPIO22`, try address `0x3F` |
| RTC not found | Check DS3231 wiring on shared I2C bus |
| Relay works backwards | Your relay may use different active logic; firmware currently uses active LOW |
| Door lock resets ESP32 | Use a separate lock power supply and common ground where required |
| Firebase not connected | Check WiFi, database URL, token/secret, and database rules |
| Dashboard cannot log in | Confirm Email/Password auth is enabled and admin user exists |
| Enrollment stuck | Set `/system/enrollMode` to `false` and clear `/system/pendingCardUID` |
| Attendance not visible | Check RTDB rules and browser console permission errors |

## Deployment

From `frontend/`:

```bash
npm run build
firebase deploy --only hosting,database
```

Deploy only after setting your Firebase project configuration in the Firebase CLI.

## Notes

- Keep all ESP32, relay module, LCD, RTC, and RFID grounds connected as required by your modules.
- Use 3.3V for the MFRC522 RFID reader.
- Use an external supply for door locks.
- Do not commit real WiFi passwords, Firebase secrets, or `.env.local`.
- Use Google Drive links in the Project Media section for large videos.
