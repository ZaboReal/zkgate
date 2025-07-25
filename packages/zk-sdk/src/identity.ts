import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), '.zkid.json');

export interface Identity {
  secret: string;
  orgId: string;
}

export function generateIdentity(orgId = '123') {
  const secret = BigInt('0x' + crypto.randomUUID().replace(/-/g, '')).toString();
  const identity: Identity = { secret, orgId };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(identity, null, 2));
  console.log(`✅ Identity saved to ${CONFIG_PATH}`);
  return identity;
}

export function loadIdentity(): Identity {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`❌ Identity file not found. Please run: zk-sdk init`);
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}
