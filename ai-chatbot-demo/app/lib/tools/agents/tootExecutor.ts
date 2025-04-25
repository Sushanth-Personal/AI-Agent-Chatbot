// lib/tools/addTripPlan.ts

import fs from 'fs/promises';
import path from 'path';

interface TripData {
  destination: string;
  date: string;
  transportation: string;
  duration: string;
  companions: string;
}

export async function addTripPlan({ email, tripData }: { email: string; tripData: TripData }) {
  const filePath = path.resolve(process.cwd(), 'data/users.json');
  const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));

  let user = data.find((u: any) => u.email === email);
  if (!user) {
    user = { email, trips: [] };
    data.push(user);
  }

  user.trips.push(tripData);

  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  return `Trip for ${tripData.destination} added successfully.`;
}
