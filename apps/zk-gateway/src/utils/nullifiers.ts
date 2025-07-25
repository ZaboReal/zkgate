import fs from 'fs';
import path from 'path';

const NULLIFIER_DB = path.join(__dirname, '../../nullifiers.json');

// In-memory cache (optional for performance)
let cache = new Set<string>();

export function loadNullifiers() {
  if (fs.existsSync(NULLIFIER_DB)) {
    const content = fs.readFileSync(NULLIFIER_DB, 'utf8');
    cache = new Set(JSON.parse(content));
  }
}

export function hasNullifier(n: string): boolean {
  return cache.has(n);
}

export function addNullifier(n: string) {
  cache.add(n);
  fs.writeFileSync(NULLIFIER_DB, JSON.stringify([...cache], null, 2));
}
