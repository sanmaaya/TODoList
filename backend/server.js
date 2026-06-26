import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Dynamic File DB Helper
const getFilePath = (table) => path.join(__dirname, 'data', `${table}.json`);

async function readTable(table) {
  const filePath = getFilePath(table);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(filePath, JSON.stringify([]));
      return [];
    }
    console.error(`Error reading ${table} database:`, error);
    throw error;
  }
}

async function writeTable(table, data) {
  const filePath = getFilePath(table);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing to ${table} database:`, error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// 1. TODOS CRUD APIs (with subjectId mapping support)
// ---------------------------------------------------------------------------

app.get('/api/todos', async (req, res) => {
  try {
    let todos = await readTable('todos');
    const { search, status, priority, category, subjectId, sortBy } = req.query;

    if (search) {
      const term = search.toLowerCase();
      todos = todos.filter(todo => 
        (todo.title && todo.title.toLowerCase().includes(term)) ||
        (todo.description && todo.description.toLowerCase().includes(term))
      );
    }

    if (status && status !== 'all') {
      const isCompleted = status === 'completed';
      todos = todos.filter(todo => todo.completed === isCompleted);
    }

    if (priority && priority !== 'all') {
      todos = todos.filter(todo => todo.priority === priority);
    }

    if (category && category !== 'all') {
      todos = todos.filter(todo => todo.category === category);
    }

    if (subjectId && subjectId !== 'all') {
      todos = todos.filter(todo => todo.subjectId === subjectId);
    }

    if (sortBy) {
      todos.sort((a, b) => {
        if (sortBy === 'dueDate') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        } else if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        } else if (sortBy === 'createdAt') {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return 0;
      });
    }

    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

app.get('/api/todos/:id', async (req, res) => {
  try {
    const todos = await readTable('todos');
    const todo = todos.find(t => t.id === req.params.id);
    if (!todo) return res.status(404).json({ error: 'Task not found' });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve task' });
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    const { title, description, priority, category, dueDate, tags, subjectId } = req.body;
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const todos = await readTable('todos');
    const newTodo = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'Medium',
      category: category || 'General',
      dueDate: dueDate || null,
      completed: false,
      tags: Array.isArray(tags) ? tags : [],
      subjectId: subjectId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    todos.push(newTodo);
    await writeTable('todos', todos);
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/todos/:id', async (req, res) => {
  try {
    const { title, description, priority, category, dueDate, completed, tags, subjectId } = req.body;
    const todos = await readTable('todos');
    const idx = todos.findIndex(t => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Task not found' });

    const current = todos[idx];
    const updated = {
      ...current,
      title: title !== undefined ? title.trim() : current.title,
      description: description !== undefined ? description.trim() : current.description,
      priority: priority !== undefined ? priority : current.priority,
      category: category !== undefined ? category : current.category,
      dueDate: dueDate !== undefined ? dueDate : current.dueDate,
      completed: completed !== undefined ? !!completed : current.completed,
      tags: Array.isArray(tags) ? tags : current.tags,
      subjectId: subjectId !== undefined ? subjectId : current.subjectId,
      updatedAt: new Date().toISOString()
    };

    if (updated.title === '') {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }

    todos[idx] = updated;
    await writeTable('todos', todos);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    const todos = await readTable('todos');
    const filtered = todos.filter(t => t.id !== req.params.id);
    if (todos.length === filtered.length) {
      return res.status(404).json({ error: 'Task not found' });
    }
    await writeTable('todos', filtered);
    res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// ---------------------------------------------------------------------------
// 2. SUBJECTS CRUD APIs
// ---------------------------------------------------------------------------

app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await readTable('subjects');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve subjects' });
  }
});

app.post('/api/subjects', async (req, res) => {
  try {
    const { name, status } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Subject Name is required' });
    }
    const subjects = await readTable('subjects');
    const newSubject = {
      id: 'sub-' + Date.now().toString(),
      name: name.trim(),
      status: status || 'Not Started'
    };
    subjects.push(newSubject);
    await writeTable('subjects', subjects);
    res.status(201).json(newSubject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

app.put('/api/subjects/:id', async (req, res) => {
  try {
    const { name, status } = req.body;
    const subjects = await readTable('subjects');
    const idx = subjects.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Subject not found' });

    subjects[idx] = {
      ...subjects[idx],
      name: name !== undefined ? name.trim() : subjects[idx].name,
      status: status !== undefined ? status : subjects[idx].status
    };
    await writeTable('subjects', subjects);
    res.json(subjects[idx]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

app.delete('/api/subjects/:id', async (req, res) => {
  try {
    const subjects = await readTable('subjects');
    const filtered = subjects.filter(s => s.id !== req.params.id);
    if (subjects.length === filtered.length) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    await writeTable('subjects', filtered);
    res.json({ message: 'Subject deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

// ---------------------------------------------------------------------------
// 3. NOTES CRUD APIs
// ---------------------------------------------------------------------------

app.get('/api/notes', async (req, res) => {
  try {
    const notes = await readTable('notes');
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve notes' });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const { title, content, subjectId } = req.body;
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }
    const notes = await readTable('notes');
    const newNote = {
      id: 'note-' + Date.now().toString(),
      title: title.trim(),
      content: content ? content.trim() : '',
      subjectId: subjectId || null,
      createdAt: new Date().toISOString()
    };
    notes.push(newNote);
    await writeTable('notes', notes);
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

app.put('/api/notes/:id', async (req, res) => {
  try {
    const { title, content, subjectId } = req.body;
    const notes = await readTable('notes');
    const idx = notes.findIndex(n => n.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Note not found' });

    notes[idx] = {
      ...notes[idx],
      title: title !== undefined ? title.trim() : notes[idx].title,
      content: content !== undefined ? content.trim() : notes[idx].content,
      subjectId: subjectId !== undefined ? subjectId : notes[idx].subjectId
    };
    await writeTable('notes', notes);
    res.json(notes[idx]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const notes = await readTable('notes');
    const filtered = notes.filter(n => n.id !== req.params.id);
    if (notes.length === filtered.length) {
      return res.status(404).json({ error: 'Note not found' });
    }
    await writeTable('notes', filtered);
    res.json({ message: 'Note deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// ---------------------------------------------------------------------------
// 4. EXAMS CRUD APIs
// ---------------------------------------------------------------------------

app.get('/api/exams', async (req, res) => {
  try {
    const exams = await readTable('exams');
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve exams' });
  }
});

app.post('/api/exams', async (req, res) => {
  try {
    const { name, subjectId, examDate, status, grade } = req.body;
    if (!name || name.trim() === '') return res.status(400).json({ error: 'Exam Name is required' });

    const exams = await readTable('exams');
    const newExam = {
      id: 'exam-' + Date.now().toString(),
      name: name.trim(),
      subjectId: subjectId || null,
      examDate: examDate || null,
      status: status || 'Not Started',
      grade: grade || ''
    };
    exams.push(newExam);
    await writeTable('exams', exams);
    res.status(201).json(newExam);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create exam record' });
  }
});

app.put('/api/exams/:id', async (req, res) => {
  try {
    const { name, subjectId, examDate, status, grade } = req.body;
    const exams = await readTable('exams');
    const idx = exams.findIndex(e => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Exam not found' });

    exams[idx] = {
      ...exams[idx],
      name: name !== undefined ? name.trim() : exams[idx].name,
      subjectId: subjectId !== undefined ? subjectId : exams[idx].subjectId,
      examDate: examDate !== undefined ? examDate : exams[idx].examDate,
      status: status !== undefined ? status : exams[idx].status,
      grade: grade !== undefined ? grade : exams[idx].grade
    };
    await writeTable('exams', exams);
    res.json(exams[idx]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update exam' });
  }
});

app.delete('/api/exams/:id', async (req, res) => {
  try {
    const exams = await readTable('exams');
    const filtered = exams.filter(e => e.id !== req.params.id);
    if (exams.length === filtered.length) return res.status(404).json({ error: 'Exam not found' });
    await writeTable('exams', filtered);
    res.json({ message: 'Exam deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete exam' });
  }
});

// ---------------------------------------------------------------------------
// 5. PROGRESS TRACKER CRUD APIs
// ---------------------------------------------------------------------------

app.get('/api/tracker', async (req, res) => {
  try {
    const tracker = await readTable('tracker');
    // Sort logs by date created (newest first)
    tracker.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(tracker);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve tracker logs' });
  }
});

app.post('/api/tracker', async (req, res) => {
  try {
    const { date, summary, mood, focusLevel, hoursStudied } = req.body;
    if (!date) return res.status(400).json({ error: 'Date is required' });

    const tracker = await readTable('tracker');
    const newLog = {
      id: 'log-' + Date.now().toString(),
      date,
      summary: summary || '',
      mood: mood || 'Calm',
      focusLevel: focusLevel !== undefined ? Number(focusLevel) : 3,
      hoursStudied: hoursStudied !== undefined ? Number(hoursStudied) : 0
    };
    tracker.push(newLog);
    await writeTable('tracker', tracker);
    res.status(201).json(newLog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log progress' });
  }
});

app.put('/api/tracker/:id', async (req, res) => {
  try {
    const { date, summary, mood, focusLevel, hoursStudied } = req.body;
    const tracker = await readTable('tracker');
    const idx = tracker.findIndex(t => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Study log not found' });

    tracker[idx] = {
      ...tracker[idx],
      date: date !== undefined ? date : tracker[idx].date,
      summary: summary !== undefined ? summary : tracker[idx].summary,
      mood: mood !== undefined ? mood : tracker[idx].mood,
      focusLevel: focusLevel !== undefined ? Number(focusLevel) : tracker[idx].focusLevel,
      hoursStudied: hoursStudied !== undefined ? Number(hoursStudied) : tracker[idx].hoursStudied
    };
    await writeTable('tracker', tracker);
    res.json(tracker[idx]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update study log' });
  }
});

app.delete('/api/tracker/:id', async (req, res) => {
  try {
    const tracker = await readTable('tracker');
    const filtered = tracker.filter(t => t.id !== req.params.id);
    if (tracker.length === filtered.length) return res.status(404).json({ error: 'Log not found' });
    await writeTable('tracker', filtered);
    res.json({ message: 'Study log deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete log' });
  }
});

// ---------------------------------------------------------------------------
// 6. GOALS CRUD APIs
// ---------------------------------------------------------------------------

app.get('/api/goals', async (req, res) => {
  try {
    const goals = await readTable('goals');
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve goals' });
  }
});

app.post('/api/goals', async (req, res) => {
  try {
    const { title, type, priority, dueDate } = req.body;
    if (!title || title.trim() === '') return res.status(400).json({ error: 'Title is required' });

    const goals = await readTable('goals');
    const newGoal = {
      id: 'goal-' + Date.now().toString(),
      title: title.trim(),
      type: type || 'Short Term',
      priority: priority || 'Medium',
      dueDate: dueDate || '',
      completed: false
    };
    goals.push(newGoal);
    await writeTable('goals', goals);
    res.status(201).json(newGoal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

app.put('/api/goals/:id', async (req, res) => {
  try {
    const { title, type, priority, dueDate, completed } = req.body;
    const goals = await readTable('goals');
    const idx = goals.findIndex(g => g.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Goal not found' });

    goals[idx] = {
      ...goals[idx],
      title: title !== undefined ? title.trim() : goals[idx].title,
      type: type !== undefined ? type : goals[idx].type,
      priority: priority !== undefined ? priority : goals[idx].priority,
      dueDate: dueDate !== undefined ? dueDate : goals[idx].dueDate,
      completed: completed !== undefined ? !!completed : goals[idx].completed
    };
    await writeTable('goals', goals);
    res.json(goals[idx]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

app.delete('/api/goals/:id', async (req, res) => {
  try {
    const goals = await readTable('goals');
    const filtered = goals.filter(g => g.id !== req.params.id);
    if (goals.length === filtered.length) return res.status(404).json({ error: 'Goal not found' });
    await writeTable('goals', filtered);
    res.json({ message: 'Goal deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
