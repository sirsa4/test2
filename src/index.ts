import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import fs from 'fs/promises';
import path from 'path';


// Define the path to the JSON file
const dataFilePath = path.join(__dirname, 'eksempel_data.json');

// Create a new Hono app
const app = new Hono();

// CORS middleware
app.use('*', (c, next) => {
  c.res.headers.set('Access-Control-Allow-Origin', '*');
  c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  if (c.req.method === 'OPTIONS') {
    return c.text('OK', 204); // Handle preflight requests
  }
  return next();
});

// Function to read data from the JSON file
async function readData() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return an empty array
      return [];
    }
    throw error;
  }
}

// Function to write data to the JSON file
async function writeData(data) {
  try {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to write data:', error);
  }
}

// Endpoint to get projects
app.get('/projects', async (c) => {
  const data = await readData();
  return c.json(data);
});

// Endpoint to add a new project
app.post('/projects', async (c) => {
  const newProject = await c.req.json();
  const data = await readData();
  data.push(newProject);
  await writeData(data);
  return c.json(data);
});

// Start the server
const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
