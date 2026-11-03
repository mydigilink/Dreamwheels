// Restores data/db.json from data/seed.json (wipes all admin edits, leads and orders).
import { copyFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'data');
copyFileSync(join(dir, 'seed.json'), join(dir, 'db.json'));
console.log('data/db.json reset from seed.json');
