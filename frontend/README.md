# Daily Workflow

## Quick Reference

```bash
# Start working
cd project-name
git pull origin main
git checkout your-branch-name

cd frontend
npm install  # only if needed
npm run dev

# Stop working
Ctrl+C
cd ..
git add .
git commit -m "your message"
git push origin your-branch-name
```


## Not so quick reference

### 1. Navigate to the project root
```bash
cd path/to/project-name
```

### 2. Get the latest code from main
```bash
git pull origin main
```

### 3. Switch to your branch
```bash
# If your branch already exists:
git checkout your-branch-name

### 4. Go to the frontend folder
```bash
cd frontend
```

### 5. Install any new dependencies (in case there are new ones)
```bash
npm install
```


### 6. Start the development server
```bash
npm run dev
```

### 7. Open your browser
Go to `http://localhost:5173/`

You're ready to code:D The browser will automatically refresh when you save files.

---

Finally, push your changes to the repository when you're done coding!

### 1. Stop the dev server
Press `Ctrl+C` in the terminal

### 2. Go back to project root
```bash
cd ..
```

### 3. Save your work to Git
```bash
git add .
git commit -m "brief description of what you did"
git push origin your-branch-name
```