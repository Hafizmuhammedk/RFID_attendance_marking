/**
 * Validates that a card UID string matches the expected RFID UID format.
 * Valid UIDs are hex strings of 8 characters (4-byte UID) or 14 characters (7-byte UID).
 * @param uid — raw card UID string
 * @returns true if the UID format is valid
 */
export function isValidCardUID(uid: string): boolean {
  if (!uid || typeof uid !== 'string') return false;
  const trimmed = uid.trim().replace(/:/g, '');
  return /^[0-9A-Fa-f]{8}$/.test(trimmed) || /^[0-9A-Fa-f]{14}$/.test(trimmed);
}

/**
 * Validates that a name is non-empty and does not exceed 100 characters.
 * @param name — user's full name
 * @returns true if valid
 */
export function isValidName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 100;
}

/**
 * Validates an employee/student ID: alphanumeric, 3–30 characters.
 * @param id — employee or student ID string
 * @returns true if valid
 */
export function isValidEmployeeId(id: string): boolean {
  return /^[A-Za-z0-9]{3,30}$/.test(id.trim());
}

/**
 * Validates that a department string is non-empty and within 100 chars.
 * @param department — department name string
 * @returns true if valid
 */
export function isValidDepartment(department: string): boolean {
  return department.trim().length >= 2 && department.trim().length <= 100;
}

/**
 * Validates an email address using a standard regex.
 * @param email — email string to validate
 * @returns true if valid
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Returns a standardized card UID: uppercase, no colons.
 * @param uid — raw UID string (may have colons from hardware output)
 * @returns normalized UID string
 */
export function normalizeCardUID(uid: string): string {
  return uid.trim().replace(/:/g, '').toUpperCase();
}
