// Legacy JSON file DB — replaced by Supabase. Kept to avoid import errors during migration.
export function readJson<T>(_filename: string, defaultValue: T): T {
  return defaultValue
}

export function writeJson<T>(_filename: string, _data: T): void {}
