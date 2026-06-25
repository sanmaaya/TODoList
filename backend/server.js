import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data', 'todos.json');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to read todos
async function readTodos() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty array
      await fs.writeFile(DATA_FILE, JSON.stringify([]));
      return [];
    }
    console.error('Error reading todos database:', error);
    throw error;
  }
}

// Helper function to write todos
async function writeTodos(todos) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2));
  } catch (error) {
    console.error('Error writing to todos database:', error);
    throw error;
  }
}

// API Routes

// 1. GET /api/todos - Get all todos (with optional filtering & sorting)
app.get('/api/todos', async (req, res) => {
  try {
    let todos = await readTodos();
    const { search, status, priority, category, sortBy } = req.query;

    // Apply Search Filter (title & description)
    if (search) {
      const term = search.toLowerCase();
      todos = todos.filter(todo => 
        (todo.title && todo.title.toLowerCase().includes(term)) ||
        (todo.description && todo.description.toLowerCase().includes(term))
      );
    }

    // Apply Status Filter
    if (status && status !== 'all') {
      const isCompleted = status === 'completed';
      todos = todos.filter(todo => todo.completed === isCompleted);
    }

    // Apply Priority Filter
    if (priority && priority !== 'all') {
      todos = todos.filter(todo => todo.priority === priority);
    }

    // Apply Category Filter
    if (category && category !== 'all') {
      todos = todos.filter(todo => todo.category === category);
    }

    // Apply Sorting
    if (sortBy) {
      todos.sort((a, b) => {
        if (sortBy === 'dueDate') {
          // Sort by due date (closest first), missing dates go to bottom
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        } else if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        } else if (sortBy === 'createdAt') {
          return new Date(b.createdAt) - new Date(a.createdAt); // Newest first
        }
        return 0;
      });
    }

    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve todos' });
  }
});

// 2. GET /api/todos/:id - Get a single todo
app.get('/api/todos/:id', async (req, res) => {
  try {
    const todos = await readTodos();
    const todo = todos.find(t => t.id === req.params.id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve the todo' });
  }
});

// 3. POST /api/todos - Create a new todo
app.post('/api/todos', async (req, res) => {
  try {
    const { title, description, priority, category, dueDate, tags } = req.body;
    
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const todos = await readTodos();
    const newTodo = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'Medium',
      category: category || 'General',
      dueDate: dueDate || null,
      completed: false,
      tags: Array.isArray(tags) ? tags : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    todos.push(newTodo);
    await writeTodos(todos);
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// 4. PUT /api/todos/:id - Update an existing todo
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { title, description, priority, category, dueDate, completed, tags } = req.body;
    const todos = await readTodos();
    const todoIndex = todos.findIndex(t => t.id === req.params.id);

    if (todoIndex === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const currentTodo = todos[todoIndex];
    const updatedTodo = {
      ...currentTodo,
      title: title !== undefined ? title.trim() : currentTodo.title,
      description: description !== undefined ? description.trim() : currentTodo.description,
      priority: priority !== undefined ? priority : currentTodo.priority,
      category: category !== undefined ? category : currentTodo.category,
      dueDate: dueDate !== undefined ? dueDate : currentTodo.dueDate,
      completed: completed !== undefined ? !!completed : currentTodo.completed,
      tags: Array.isArray(tags) ? tags : currentTodo.tags,
      updatedAt: new Date().toISOString()
    };

    if (updatedTodo.title === '') {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }

    todos[todoIndex] = updatedTodo;
    await writeTodos(todos);
    res.json(updatedTodo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// 5. DELETE /api/todos/:id - Delete a todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const todos = await readTodos();
    const filteredTodos = todos.filter(t => t.id !== req.params.id);
    
    if (todos.length === filteredTodos.length) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    await writeTodos(filteredTodos);
    res.json({ message: 'Todo deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
