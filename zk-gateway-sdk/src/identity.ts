import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Identity } from './types';

const CONFIG_PATH = path.join(process.cwd(), '.zkid.json');

export function generateIdentity(orgId: string): Identity {
  const secret = '0x' + crypto.randomBytes(32).toString('hex');
  const identity: Identity = { 
    secret, 
    orgId,
    createdAt: new Date().toISOString()
  };
  
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(identity, null, 2));
  console.log(`✅ Identity saved to ${CONFIG_PATH}`);
  return identity;
}

export function loadIdentity(): Identity {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`❌ Identity file not found. Please run: zk-gateway init <orgId>`);
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

export function hasIdentity(): boolean {
  return fs.existsSync(CONFIG_PATH);
} 