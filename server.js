const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Read data from file
const readData = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data file:', error);
    return { tools: [] };
  }
};

// Write data to file
const writeData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to data file:', error);
  }
};

// Get all tools sorted by votes
app.get('/api/tools', (req, res) => {
  const data = readData();
  const sortedTools = data.tools.sort((a, b) => b.votes - a.votes);
  res.json(sortedTools);
});

// Add a new tool
app.post('/api/tools', (req, res) => {
  const { name } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Tool name is required' });
  }
  
  const data = readData();
  
  // Check if tool already exists
  const existingTool = data.tools.find(tool => 
    tool.name.toLowerCase() === name.toLowerCase()
  );
  
  if (existingTool) {
    return res.status(400).json({ error: 'Tool already exists' });
  }
  
  // Add new tool
  const newTool = {
    id: Date.now().toString(),
    name: name.trim(),
    votes: 0
  };
  
  data.tools.push(newTool);
  writeData(data);
  
  res.status(201).json(newTool);
});

// Vote for a tool
app.post('/api/tools/:id/vote', (req, res) => {
  const { id } = req.params;
  const data = readData();
  
  const toolIndex = data.tools.findIndex(tool => tool.id === id);
  
  if (toolIndex === -1) {
    return res.status(404).json({ error: 'Tool not found' });
  }
  
  data.tools[toolIndex].votes += 1;
  writeData(data);
  
  res.json(data.tools[toolIndex]);
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
