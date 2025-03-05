const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Configure AWS SDK
// For EC2 instances with IAM role, we don't need to explicitly provide credentials
AWS.config.update({ region: 'us-west-2' }); // Change to your preferred region

// Initialize DynamoDB client
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'ToDoItems'; // Your DynamoDB table name

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
// Get all todo items
app.get('/api/todos', async (req, res) => {
    try {
        const params = {
            TableName: tableName,
            // Sort by most recently added items first
            ScanIndexForward: false
        };
        
        const data = await dynamoDB.scan(params).promise();
        
        res.json(data.Items);
    } catch (error) {
        console.error('Error fetching todos from DynamoDB:', error);
        res.status(500).json({ error: 'Failed to fetch todos' });
    }
});

// Add a new todo item
app.post('/api/todos', async (req, res) => {
    try {
        const { text } = req.body;
        console.log('Received request to add todo:', text);
        
        if (!text) {
            return res.status(400).json({ error: 'Todo text is required' });
        }
        
        const timestamp = new Date().toISOString();
        const todoId = uuidv4();
        
        const params = {
            TableName: tableName,
            Item: {
                id: todoId,
                text: text,
                createdAt: timestamp
            }
        };
        
        console.log('Attempting to write to DynamoDB:', params);
        await dynamoDB.put(params).promise();
        console.log('Successfully wrote to DynamoDB');
        
        res.status(201).json({
            id: todoId,
            text: text,
            createdAt: timestamp
        });
    } catch (error) {
        console.error('Error adding todo to DynamoDB:', error);
        res.status(500).json({ error: 'Failed to add todo' });
    }
});

// Serve the main application on all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});