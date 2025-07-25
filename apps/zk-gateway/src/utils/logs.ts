import fs from 'fs';
import path from 'path';

const LOG_PATH = path.join(__dirname, '../../logs.json');

type LogEntry = {
  timestamp: string;
  nullifier: string;
  apiTarget: string;
  payload: any;
  method?: string;
  organizationId?: string;
  endpointId?: string;
  endpointHash?: string;
};

export function appendLog(entry: LogEntry) {
  const logs = fs.existsSync(LOG_PATH)
    ? JSON.parse(fs.readFileSync(LOG_PATH, 'utf8'))
    : [];

  logs.push(entry);
  fs.writeFileSync(LOG_PATH, JSON.stringify(logs, null, 2));
}
