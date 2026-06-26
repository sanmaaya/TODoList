# 🚀 PriorityFlow Workspace

PriorityFlow is a minimalist, document-centric task planning dashboard designed with **Notion-style aesthetics** and a **multi-page architecture** built with React (Vite) and Node.js + Express. 

It features an integrated marketing **Landing Page** and persistent **Light & Dark Mode toggling** across all screens.

---

## 🎨 Aesthetic & Design Theme

- **Notion Layout Framework**: Designed as a physical multi-page application with clean table listings, checklists, collapsible sidebars, and customizable categories.
- **Obsidian Dark Mode**: Deep space obsidian black background (`#0c0d10`), slate sidebars (`#13151b`), soft slate text (`#e2e8f0`), and glowing pastel indicator pills.
- **Alabaster Sand Light Mode**: Clean sand-white background (`#fafaf9`), sand sidebars (`#f4f4f3`), charcoal text (`#292524`), and soft pastel tags.
- **Typography Stack**:
  - UI Sans-serif: **Outfit** (a clean, modern geometric sans-serif) for buttons, sidebars, search inputs, tags, and properties.
  - Editor Serif: **Lora** (a gorgeous bookish serif) for document titles and rich notes.
- **Banner Artwork**: Featuring a sleek, theme-aware abstract gradient that shifts colors based on light and dark mode choices.

---

## ⚡ Main Features

### 1. SaaS Landing Page (`index.html`)
- Interactive, detailed CSS-rendered Notion workspace preview mockup displaying active checklists, tags, and the gradient cover banner.
- Smooth entry animations and a clear CTA button pointing to the dashboard workspace.
- Global light/dark theme toggle.

### 2. Main Workspace Dashboard (`dashboard.html`)
- **Collapsible Sidebar**: Workspace switcher, links to active task counters, completed archives, and categories (Work, Personal, Shopping, Health).
- **Inline Database Row Adder**: Add tasks instantly by typing and pressing Enter inside the list, mirroring Notion's database rows interface.
- **Database Filters**: Refined searches, priority filter dropdowns, and sorting parameters (Date Created, Due Date, Alphabetical).

### 3. Task Document View (`todo.html`)
- Reads the task `id` parameter from URL query strings (e.g. `?id=123`).
- **Properties Table**: Edit completion checkboxes, priority levels, category tags, due dates, and add tag pills.
- **Auto-Saving Notes Block**: A borderless editor canvas where description logs are saved back to the database automatically using request debouncing.

### 4. Express REST API Backend
- Serves CRUD routes on port 5000:
  - `GET /api/todos`: Retrieve, filter, and sort tasks.
  - `GET /api/todos/:id`: Retrieve single item details.
  - `POST /api/todos`: Create a new item.
  - `PUT /api/todos/:id`: Sync changes.
  - `DELETE /api/todos/:id`: Delete a task.
- Saves todos persistently in a local JSON storage file: `backend/data/todos.json`.

---

## 📁 Project Structure

```
d:/study/ToDoList/
├── package.json                   # Root package coordinate scripts
├── README.md                      # Project documentation
├── .gitignore                     # Git tracking exclusions
├── backend/
│   ├── server.js                  # Express API server & file-based storage database
│   └── data/
│       └── todos.json             # Persistent JSON database storage
└── frontend/
    ├── package.json               # Frontend react & vite requirements
    ├── vite.config.js             # Configured for 3 page targets and API proxies
    ├── index.html                 # Landing Page template
    ├── dashboard.html             # Workspace Dashboard template
    ├── todo.html                  # Detail page template
    └── src/
        ├── theme.js               # Persistence theme manager (light/dark)
        ├── main.jsx               # Boots Landing Page loader
        ├── dashboard.jsx          # Boots Workspace Dashboard loader
        ├── todo-detail.jsx        # Boots Detail Document loader
        ├── App.jsx                # Landing Page app component
        ├── DashboardApp.jsx       # Workspace Dashboard view component
        ├── TodoDetailApp.jsx      # Detail Document properties & notes component
        └── styles.css             # Notion stylesheet design system
```

---

## 🚀 Setup & Launch

To launch the project locally:

1. **Install all dependencies** (run in root directory):
   ```bash
   npm run install:all
   ```
2. **Start the development servers (Concurrently)**:
   ```bash
   npm run dev
   ```
   - **Frontend App**: served at `http://localhost:3000/`
   - **Workspace Dashboard**: served at `http://localhost:3000/dashboard.html`
   - **Express API Backend**: runs at `http://localhost:5000/`
3. **Build the production package**:
   ```bash
   npm run build:frontend
   ```
