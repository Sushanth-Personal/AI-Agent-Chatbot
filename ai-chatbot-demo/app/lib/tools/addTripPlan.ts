import { User } from '@/types'; // Import your types
import fs from 'fs';
import path from 'path';

export async function addTripPlan({
  email,
  tripData,
}: {
  email: string;
  tripData: Record<string, string>;
}) {
  const filePath = path.join(process.cwd(), 'data', 'users.json');
  const file = fs.readFileSync(filePath, 'utf8');
  const users: User[] = JSON.parse(file); // Use the User type here

  const userIndex = users.findIndex((u) => u.email === email);

  if (userIndex !== -1) {
    users[userIndex].history.push({
      role: 'assistant',
      content: `Added new trip plan: ${JSON.stringify(tripData)}`,
    });
  } else {
    users.push({ email, history: [{ role: 'assistant', content: 'New user created.' }] });
  }

  // Save the updated users array back to the JSON file
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
  return { status: 'success', saved: tripData };
}
