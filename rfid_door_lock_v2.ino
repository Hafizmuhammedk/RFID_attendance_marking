/*
 * ============================================================
 *  RFID Door Lock System v2.0 — Arduino C++ (ESP32)
 * ============================================================
 *  Hardware:
 *    Board   : ESP32 NodeMCU DevKit V1 (ESP32-WROOM-32)
 *    RFID    : MFRC522 (SPI)
 *    Display : 1602 I2C LCD (0x27)
 *    RTC     : DS3231 (I2C)
 *    Buzzer  : Active buzzer — GPIO 2
 *    Relay   : Relay module  — GPIO 4 (active LOW)
 *
 *  Pin Mapping:
 *    MFRC522 : SS=5, SCK=18, MOSI=23, MISO=19, RST=27
 *    I2C     : SDA=21, SCL=22
 *    Buzzer  : GPIO 2
 *    Relay   : GPIO 4
 *
 *  Libraries (install via Arduino Library Manager):
 *    - MFRC522            (GithubCommunity)
 *    - LiquidCrystal_I2C  (Frank de Brabander)
 *    - RTClib             (Adafruit)
 *    - Firebase ESP Client (Mobizt)
 *    - ArduinoJson        (Benoit Blanchon, v6.x)
 * ============================================================
 */

// === INCLUDES ===
#include <Arduino.h>
#include <SPI.h>
#include <Wire.h>
#include <WiFi.h>
#include <MFRC522.h>
#include <LiquidCrystal_I2C.h>
#include <RTClib.h>
#include <Firebase_ESP_Client.h>
#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>
#include <ArduinoJson.h>
#include <time.h>

// === CONFIGURATION (edit only this block) ===
#define WIFI_SSID        "doorwifi"       // ← replace with your WiFi name
#define WIFI_PASSWORD    "12345678"    // ← replace with your WiFi password
#define FIREBASE_HOST    "FIREBASE_HOST"
#define FIREBASE_AUTH    "your DB secret"  // ← replace with your DB secret
#define NTP_SERVER       "pool.ntp.org"
#define NTP_UTC_OFFSET   19800          // IST = UTC+5:30
#define UNLOCK_DURATION  3000           // ms door stays unlocked
#define MAX_CARDS        50
#define LCD_I2C_ADDR     0x27

// === PIN DEFINITIONS ===
#define PIN_BUZZER       2
#define PIN_RELAY        4
#define PIN_RFID_SS      5
#define PIN_RFID_RST     27
#define PIN_I2C_SDA      21
#define PIN_I2C_SCL      22

// === TIMING ===
#define ENROLL_POLL_MS   30000
#define HEARTBEAT_MS     30000
#define UID_REFRESH_MS   60000
#define MSG_DISPLAY_MS   2000
#define CLOCK_REFRESH_MS 1000

// === OBJECTS ===
MFRC522          mfrc522(PIN_RFID_SS, PIN_RFID_RST);
LiquidCrystal_I2C lcd(LCD_I2C_ADDR, 16, 2);
RTC_DS3231       rtc;
FirebaseData     fbdo;
FirebaseConfig   config;
FirebaseAuth     auth;

// === GLOBAL STATE ===
String  authorizedUIDs[MAX_CARDS];
int     numAuthorizedUIDs = 0;
bool    enrollMode        = false;
bool    prevEnrollMode    = false;
bool    doorUnlocked      = false;
bool    showingMsg        = false;
bool    firebaseReady     = false;
bool    rtcAvailable      = false;
bool    wifiConnected     = false;
int     failedAttempts    = 0;
unsigned long lockTimer       = 0;
unsigned long msgTimer        = 0;
unsigned long clockTimer      = 0;
unsigned long enrollPollTimer = 0;
unsigned long heartbeatTimer  = 0;
unsigned long uidRefreshTimer = 0;

// === FORWARD DECLARATIONS ===
void connectWiFi();
void syncNTP();
void syncRTCfromNTP();
void loadUsersFromFirebase();
bool isAuthorized(const String &uid);
void scanRFID();
void handleAccessGranted(const String &uid);
void handleAccessDenied(const String &uid);
void handleEnroll(const String &uid);
void lockDoor();
void sendHeartbeat();
void pollEnrollMode();
void writeAttendance(const String &uid, const String &name, const String &status);
void writeDoorStatus(const String &status);
void writeLastScan(const String &uid, const String &timeStr, const String &status);
void beepBuzzer(int times, int durationMs, int gapMs = 100);
void lcdPrint(const String &row0, const String &row1);
void displayClock();
String getTimestamp();
String getTodayDate();
unsigned long getUnixMs();
String formatUID(MFRC522::Uid &uid);
void checkMemory();

// ============================================================
// === SETUP ===
// ============================================================
void setup() {
  Serial.begin(115200);
  delay(200);
  Serial.println("\n===============================================");
  Serial.println("   RFID Door Lock System v2.0 — Arduino C++");
  Serial.println("   ESP32 DevKit V1");
  Serial.println("===============================================");

  // Output pins
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_RELAY,  OUTPUT);
  digitalWrite(PIN_BUZZER, LOW);
  digitalWrite(PIN_RELAY,  HIGH); // HIGH = locked

  // I2C
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);

  // LCD init
  lcd.init();
  lcd.backlight();
  lcdPrint("  RFID Lock v2  ", " Initializing.. ");
  delay(1200);

  // RTC init
  if (rtc.begin()) {
    rtcAvailable = true;
    Serial.println("[RTC] DS3231 detected.");
  } else {
    Serial.println("[RTC] DS3231 not found — using uptime fallback.");
    lcdPrint("RTC not found!", "Check I2C wiring");
    delay(2000);
  }

  // SPI + MFRC522
  SPI.begin();
  mfrc522.PCD_Init();
  delay(100);
  byte ver = mfrc522.PCD_ReadRegister(MFRC522::VersionReg);
  if (ver == 0x91 || ver == 0x92 || ver == 0x88 || ver == 0x12) {
    Serial.printf("[RFID] MFRC522 detected. Firmware: 0x%02X\n", ver);
  } else {
    Serial.printf("[RFID] WARNING: Unexpected version 0x%02X — check SPI wiring.\n", ver);
    lcdPrint("RFID Wiring Err", "Check SPI pins");
    beepBuzzer(3, 300);
    delay(2000);
  }

  // WiFi + NTP + Firebase
  connectWiFi();

  if (wifiConnected) {
    syncNTP();
    if (rtcAvailable) syncRTCfromNTP();

    // Firebase init
    config.database_url                    = FIREBASE_HOST;
    config.signer.tokens.legacy_token      = FIREBASE_AUTH;
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);
    fbdo.setResponseSize(4096);

    // Wait for Firebase to be ready (max 5s)
    unsigned long fbWait = millis();
    while (!Firebase.ready() && millis() - fbWait < 5000) delay(100);

    if (Firebase.ready()) {
      firebaseReady = true;
      Serial.println("[FB] Firebase connected OK.");
      lcdPrint("Firebase:  OK! ", "DB Connected   ");
      // Mark system online
      Firebase.RTDB.setString(&fbdo, "/system/esp32Status", "online");
      Firebase.RTDB.setBool(&fbdo,   "/system/enrollMode", false);
      Firebase.RTDB.setString(&fbdo, "/system/pendingCardUID", "");
      beepBuzzer(1, 150);
    } else {
      Serial.println("[FB] Firebase init failed — continuing offline.");
      lcdPrint("Firebase: FAIL", "Offline Mode  ");
      beepBuzzer(2, 150);
    }
    delay(1500);

    if (firebaseReady) loadUsersFromFirebase();
  }

  beepBuzzer(2, 150, 80); // Two beeps = system ready
  Serial.println("[SYSTEM] Ready — waiting for card scan.");
  lcdPrint("  System Ready  ", " Scan Your Card ");
  delay(1000);
  displayClock();
}

// ============================================================
// === LOOP ===
// ============================================================
void loop() {
  unsigned long now = millis();

  // Auto-lock after UNLOCK_DURATION
  if (doorUnlocked && (now - lockTimer >= UNLOCK_DURATION)) {
    lockDoor();
    showingMsg = true;
    msgTimer   = now;
  }

  // Clear message, return to clock/enroll screen
  if (showingMsg && (now - msgTimer >= MSG_DISPLAY_MS)) {
    showingMsg = false;
    if (enrollMode) {
      lcdPrint(" ENROLL  MODE  ", " Scan Card Now ");
    } else {
      displayClock();
    }
  }

  // Clock refresh every second (only when idle)
  if (!doorUnlocked && !showingMsg && !enrollMode) {
    if (now - clockTimer >= CLOCK_REFRESH_MS) {
      displayClock();
      clockTimer = now;
    }
  }

  // Firebase tasks (only when connected)
  if (firebaseReady && Firebase.ready()) {
    // Poll enrollMode every 500ms
    if (now - enrollPollTimer >= ENROLL_POLL_MS) {
      pollEnrollMode();
      enrollPollTimer = now;
    }
    // Heartbeat every 30s
    if (now - heartbeatTimer >= HEARTBEAT_MS) {
      sendHeartbeat();
      heartbeatTimer = now;
    }
    // Refresh UID list every 60s
    if (now - uidRefreshTimer >= UID_REFRESH_MS) {
      loadUsersFromFirebase();
      uidRefreshTimer = now;
    }
  }

  // RFID scan
  scanRFID();

  checkMemory();
}

// ============================================================
// === WIFI FUNCTIONS ===
// ============================================================
void connectWiFi() {
  lcdPrint("Connecting WiFi", String(WIFI_SSID).substring(0, 16));
  Serial.print("[WIFI] Connecting to: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    Serial.print(".");
    retries++;
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    String ip = WiFi.localIP().toString();
    Serial.print("[WIFI] Connected! IP: ");
    Serial.println(ip);
    lcdPrint("WiFi Connected!", ip);
    delay(1000);
  } else {
    wifiConnected = false;
    Serial.println("[WIFI] Timeout — continuing in offline mode.");
    lcdPrint("WiFi Timeout.", "Offline Mode   ");
    beepBuzzer(1, 400);
    delay(2000);
  }
}

// ============================================================
// === NTP + RTC FUNCTIONS ===
// ============================================================
void syncNTP() {
  lcdPrint("NTP Syncing...", "pool.ntp.org   ");
  Serial.println("[NTP] Syncing from pool.ntp.org...");
  configTime(NTP_UTC_OFFSET, 0, NTP_SERVER);

  // Wait for NTP (max 5s)
  struct tm ti;
  unsigned long start = millis();
  while (!getLocalTime(&ti) && millis() - start < 5000) delay(200);

  if (getLocalTime(&ti)) {
    char buf[32];
    strftime(buf, sizeof(buf), "%d/%m/%Y %H:%M:%S", &ti);
    Serial.print("[NTP] Time synced: ");
    Serial.println(buf);
    lcdPrint("Time Updated!", String(buf).substring(0, 16));
    delay(1500);
  } else {
    Serial.println("[NTP] Sync failed — using RTC or uptime.");
    lcdPrint("NTP Failed.", "Using DS3231   ");
    delay(1500);
  }
}

void syncRTCfromNTP() {
  struct tm ti;
  if (!getLocalTime(&ti)) return;
  // Adjust from IST offset back to UTC for DS3231
  rtc.adjust(DateTime(
    ti.tm_year + 1900,
    ti.tm_mon  + 1,
    ti.tm_mday,
    ti.tm_hour,
    ti.tm_min,
    ti.tm_sec
  ));
  Serial.println("[RTC] DS3231 updated from NTP.");
}

// ============================================================
// === RFID FUNCTIONS ===
// ============================================================
void scanRFID() {
  // Check for new card
  if (!mfrc522.PICC_IsNewCardPresent()) return;
  if (!mfrc522.PICC_ReadCardSerial())   return;

  // Reject short reads
  if (mfrc522.uid.size < 4) {
    Serial.println("[RFID] Ignored — bad UID length.");
    mfrc522.PICC_HaltA();
    return;
  }

  String uid = formatUID(mfrc522.uid);
  Serial.print("[SCAN] Card detected: ");
  Serial.println(uid);

  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();

  if (enrollMode) {
    handleEnroll(uid);
  } else {
    if (isAuthorized(uid)) {
      handleAccessGranted(uid);
    } else {
      handleAccessDenied(uid);
    }
  }
}

String formatUID(MFRC522::Uid &uid) {
  String s = "";
  for (byte i = 0; i < uid.size; i++) {
    if (i > 0) s += ":";
    if (uid.uidByte[i] < 0x10) s += "0";
    s += String(uid.uidByte[i], HEX);
  }
  s.toUpperCase();
  return s;
}

// ============================================================
// === ACCESS CONTROL ===
// ============================================================
bool isAuthorized(const String &uid) {
  for (int i = 0; i < numAuthorizedUIDs; i++) {
    if (authorizedUIDs[i].equalsIgnoreCase(uid)) return true;
  }
  return false;
}

void handleAccessGranted(const String &uid) {
  String ts = getTimestamp();
  Serial.println("┌─ ACCESS GRANTED ─────────────────────────────");
  Serial.println("│ UID:  " + uid);
  Serial.println("│ Time: " + ts);
  Serial.println("└───────────────────────────────────────────────");

  lcdPrint("Access Granted!", ts.substring(0, 16));
  digitalWrite(PIN_RELAY, LOW); // Unlock
  beepBuzzer(1, 200);

  doorUnlocked = true;
  lockTimer    = millis();
  showingMsg   = true;
  msgTimer     = millis();
  failedAttempts = 0;

  if (firebaseReady && Firebase.ready()) {
    writeLastScan(uid, ts, "granted");
    writeAttendance(uid, uid, "check-in");
    writeDoorStatus("unlocked");
    Firebase.RTDB.setInt(&fbdo, "/system/failedAttempts", 0);
  }
}

void handleAccessDenied(const String &uid) {
  String ts = getTimestamp();
  failedAttempts++;
  Serial.println("┌─ ACCESS DENIED ──────────────────────────────");
  Serial.println("│ UID:      " + uid);
  Serial.println("│ Time:     " + ts);
  Serial.println("│ Failures: " + String(failedAttempts));
  Serial.println("└───────────────────────────────────────────────");

  lcdPrint("Access Denied!", uid.substring(0, 11));
  beepBuzzer(3, 150, 100);

  showingMsg = true;
  msgTimer   = millis();

  if (failedAttempts >= 5) {
    Serial.println("[ALERT] " + String(failedAttempts) + " consecutive failures — possible intrusion!");
    lcdPrint(" !! ALERT !!    ", "Too many fails! ");
    beepBuzzer(5, 200, 100);
  }

  if (firebaseReady && Firebase.ready()) {
    writeLastScan(uid, ts, "denied");
    writeAttendance(uid, "Unknown", "denied");
    Firebase.RTDB.setInt(&fbdo, "/system/failedAttempts", failedAttempts);
  }
}

void lockDoor() {
  digitalWrite(PIN_RELAY, HIGH); // Lock
  doorUnlocked = false;
  Serial.println("[DOOR] Locked.");
  if (firebaseReady && Firebase.ready()) {
    writeDoorStatus("locked");
  }
  lcdPrint("Door Locked.    ", " Scan Your Card ");
  beepBuzzer(1, 60);
}

// ============================================================
// === ENROLL FUNCTIONS ===
// ============================================================
void handleEnroll(const String &uid) {
  Serial.println("═══════════════════════════════════════════════");
  Serial.println("[ENROLL] New card found: " + uid);
  Serial.println("═══════════════════════════════════════════════");

  lcdPrint("Card Enrolled!", uid.substring(0, 16));
  beepBuzzer(2, 100);

  if (firebaseReady && Firebase.ready()) {
    // Write to users/{UID} = true (authorizedUIDs)
    if (Firebase.RTDB.setBool(&fbdo, "/users/" + uid + "/isActive", true)) {
      Serial.println("[FB] users/" + uid + " written.");
    } else {
      Serial.println("[FB] users write failed: " + fbdo.errorReason());
    }
    // Write pendingCardUID for frontend form auto-fill
    if (Firebase.RTDB.setString(&fbdo, "/system/pendingCardUID", uid)) {
      Serial.println("[FB] pendingCardUID set: " + uid);
    } else {
      Serial.println("[FB] pendingCardUID failed: " + fbdo.errorReason());
    }
    // Turn off enrollMode
    if (Firebase.RTDB.setBool(&fbdo, "/system/enrollMode", false)) {
      Serial.println("[FB] enrollMode cleared.");
    } else {
      Serial.println("[FB] enrollMode clear failed: " + fbdo.errorReason());
    }
  }

  enrollMode     = false;
  prevEnrollMode = false;

  // Refresh local UID cache
  loadUsersFromFirebase();

  showingMsg = true;
  msgTimer   = millis();
}

// ============================================================
// === FIREBASE SYNC FUNCTIONS ===
// ============================================================
void pollEnrollMode() {
  if (!Firebase.RTDB.getBool(&fbdo, "/system/enrollMode")) {
    Serial.println("[FB] enrollMode read failed: " + fbdo.errorReason());
    return;
  }
  bool current = fbdo.boolData();

  // Transition OFF → ON
  if (current && !prevEnrollMode) {
    enrollMode = true;
    Serial.println("═══════════════════════════════════════════════");
    Serial.println("[ENROLL] Enrollment mode started from frontend!");
    Serial.println("[ENROLL] Scan the RFID card on the reader now...");
    Serial.println("═══════════════════════════════════════════════");
    lcdPrint(" ENROLL  MODE  ", " Scan Card Now ");
    beepBuzzer(2, 100, 80);
  }
  // Transition ON → OFF (cancelled without scan)
  else if (!current && prevEnrollMode) {
    enrollMode = false;
    Serial.println("[ENROLL] Enrollment mode cancelled/completed.");
    lcdPrint("Enroll Stopped ", "  Normal Mode  ");
    showingMsg = true;
    msgTimer   = millis();
  }

  prevEnrollMode = current;
  if (!current) Serial.println("[FB] enrollMode = false");
}

void sendHeartbeat() {
  // Send Unix timestamp in SECONDS (fits in 32-bit: ~1.747B < 4.29B max).
  // Milliseconds overflow unsigned long on ESP32, storing a garbage value.
  unsigned long secs = 0;
  if (rtcAvailable) {
    secs = (unsigned long)rtc.now().unixtime();
  } else {
    time_t t; time(&t);
    secs = (t > 1000000000UL) ? (unsigned long)t : millis() / 1000UL;
  }
  if (Firebase.RTDB.setInt(&fbdo, "/system/lastHeartbeat", secs) &&
      Firebase.RTDB.setString(&fbdo, "/system/esp32Status", "online")) {
    Serial.printf("[FB] Heartbeat OK (ts=%lu)\n", secs);
  } else {
    Serial.println("[FB] Heartbeat failed: " + fbdo.errorReason());
  }
}

void loadUsersFromFirebase() {
  Serial.println("[FB] Loading authorized UIDs from /users/...");
  if (!Firebase.RTDB.getJSON(&fbdo, "/users")) {
    Serial.println("[FB] loadUsers failed: " + fbdo.errorReason());
    return;
  }

  numAuthorizedUIDs = 0;
  FirebaseJson    json;
  FirebaseJsonData result;
  json.setJsonData(fbdo.stringData());

  FirebaseJsonArray arr;
  json.keys(arr);
  for (size_t i = 0; i < arr.size() && numAuthorizedUIDs < MAX_CARDS; i++) {
    FirebaseJsonData keyData;
    arr.get(keyData, i);
    String key = keyData.stringValue;
    // Only add if isActive is not explicitly false
    FirebaseJsonData activeData;
    json.get(activeData, key + "/isActive");
    bool active = !activeData.success || activeData.boolValue;
    if (active) {
      authorizedUIDs[numAuthorizedUIDs++] = key;
    }
  }
  Serial.println("[FB] Loaded " + String(numAuthorizedUIDs) + " authorized UIDs.");
}

void writeAttendance(const String &uid, const String &name, const String &status) {
  unsigned long ts   = getUnixMs();
  String        date = getTodayDate();
  String        recId = uid + "_" + String(ts);
  recId.replace(":", "");
  String path = "/attendance/" + date + "/" + recId;

  FirebaseJson json;
  json.set("cardUID",    uid);
  json.set("userId",     uid);
  json.set("name",       name);
  json.set("timestamp",  (int)ts);
  json.set("status",     status);
  json.set("date",       date);

  if (Firebase.RTDB.setJSON(&fbdo, path, &json)) {
    Serial.println("[FB] Attendance written: " + status + " " + uid);
  } else {
    Serial.println("[FB] Attendance failed: " + fbdo.errorReason());
  }
}

void writeLastScan(const String &uid, const String &timeStr, const String &status) {
  FirebaseJson json;
  json.set("uid",    uid);
  json.set("time",   timeStr);
  json.set("status", status);
  if (Firebase.RTDB.setJSON(&fbdo, "/system/lastScan", &json)) {
    Serial.println("[FB] lastScan written OK.");
  } else {
    Serial.println("[FB] lastScan failed: " + fbdo.errorReason());
  }
}

void writeDoorStatus(const String &status) {
  if (Firebase.RTDB.setString(&fbdo, "/system/doorStatus", status)) {
    Serial.println("[DOOR] doorStatus → " + status);
  } else {
    Serial.println("[FB] doorStatus failed: " + fbdo.errorReason());
  }
}

// ============================================================
// === LCD FUNCTIONS ===
// ============================================================
void lcdPrint(const String &row0, const String &row1) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(row0.substring(0, 16));
  lcd.setCursor(0, 1);
  lcd.print(row1.substring(0, 16));
}

void displayClock() {
  String row0, row1;
  if (rtcAvailable) {
    DateTime now = rtc.now();
    char buf0[17], buf1[17];
    snprintf(buf0, sizeof(buf0), "%02d/%02d/%04d     ",
             now.day(), now.month(), now.year());
    float temp = rtc.getTemperature();
    snprintf(buf1, sizeof(buf1), "%02d:%02d:%02d %.1fC  ",
             now.hour(), now.minute(), now.second(), temp);
    row0 = String(buf0).substring(0, 16);
    row1 = String(buf1).substring(0, 16);
  } else {
    unsigned long up = millis() / 1000;
    char buf0[17];
    snprintf(buf0, sizeof(buf0), "Up:%02luh%02lum%02lus  ",
             up / 3600, (up % 3600) / 60, up % 60);
    row0 = String(buf0).substring(0, 16);
    row1 = " Scan Your Card ";
  }
  lcd.setCursor(0, 0);
  lcd.print(row0);
  lcd.setCursor(0, 1);
  lcd.print(row1);
}

// ============================================================
// === BUZZER FUNCTIONS ===
// ============================================================
void beepBuzzer(int times, int durationMs, int gapMs) {
  for (int i = 0; i < times; i++) {
    digitalWrite(PIN_BUZZER, HIGH);
    delay(durationMs);
    digitalWrite(PIN_BUZZER, LOW);
    if (i < times - 1) delay(gapMs);
  }
}

// ============================================================
// === UTILITY FUNCTIONS ===
// ============================================================
String getTimestamp() {
  if (rtcAvailable) {
    DateTime now = rtc.now();
    char buf[20];
    snprintf(buf, sizeof(buf), "%02d/%02d %02d:%02d:%02d",
             now.day(), now.month(), now.hour(), now.minute(), now.second());
    return String(buf);
  }
  unsigned long up = millis() / 1000;
  char buf[20];
  snprintf(buf, sizeof(buf), "Up %02lu:%02lu:%02lu",
           up / 3600, (up % 3600) / 60, up % 60);
  return String(buf);
}

String getTodayDate() {
  if (rtcAvailable) {
    DateTime now = rtc.now();
    char buf[12];
    snprintf(buf, sizeof(buf), "%04d-%02d-%02d",
             now.year(), now.month(), now.day());
    return String(buf);
  }
  struct tm ti;
  if (getLocalTime(&ti)) {
    char buf[12];
    strftime(buf, sizeof(buf), "%Y-%m-%d", &ti);
    return String(buf);
  }
  return "1970-01-01";
}

unsigned long getUnixMs() {
  if (rtcAvailable) {
    DateTime now = rtc.now();
    return (unsigned long)now.unixtime() * 1000UL;
  }
  time_t t;
  time(&t);
  if (t > 1000000000UL) return (unsigned long)t * 1000UL;
  return millis(); // last resort: uptime ms
}

void checkMemory() {
  uint32_t free = ESP.getFreeHeap();
  if (free < 30000) {
    Serial.printf("[SYSTEM] Low heap: %u bytes free\n", free);
  }
}
