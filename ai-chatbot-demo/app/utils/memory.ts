import fs from 'fs/promises';
import path from 'path';
import type { User} from '@/utils/types';

const DATA_FILE = path.join(process.cwd(), 'app', 'data', 'users.json');


export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    console.log("Running getUserByEmail");
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    const users: User[] = JSON.parse(data);
    return users.find(user => user.email === email) || null;
  } catch {
    return null;
  }
}

export async function saveUser(user: User): Promise<void> {
  let users: User[] = [];
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    users = JSON.parse(data);
    const index = users.findIndex(u => u.email === user.email);

    if (index !== -1) users[index] = user;
    else users.push(user);
  } catch {
    users = [user]; // First user, if file doesn’t exist
  }

  await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
}
