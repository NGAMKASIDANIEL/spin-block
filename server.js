const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');

// Database file paths
const usersFile = path.join(dataDir, 'users.json');
const profilesFile = path.join(dataDir, 'profiles.json');
const subjectsFile = path.join(dataDir, 'subjects.json');
const pastQuestionsFile = path.join(dataDir, 'pastQuestions.json');
const resultsFile = path.join(dataDir, 'results.json');
const referralsFile = path.join(dataDir, 'referrals.json');

// Sample data for subjects and courses
const sampleSubjects = {
  'University of Lagos': {
    'Computer Science': {
      '100': [
        { id: 'csc101', code: 'CSC 101', title: 'Introduction to Computer Science', description: 'Basic programming concepts and algorithms' },
        { id: 'csc103', code: 'CSC 103', title: 'Computer Programming I', description: 'Introduction to programming with C' },
        { id: 'mat101', code: 'MAT 101', title: 'Elementary Mathematics I', description: 'Basic mathematics for computer science' }
      ],
      '200': [
        { id: 'csc201', code: 'CSC 201', title: 'Data Structures and Algorithms', description: 'Fundamental data structures and algorithm design' },
        { id: 'csc203', code: 'CSC 203', title: 'Computer Programming II', description: 'Object-oriented programming with Java' },
        { id: 'csc205', code: 'CSC 205', title: 'Discrete Mathematics', description: 'Mathematical foundations for computer science' }
      ],
      '300': [
        { id: 'csc301', code: 'CSC 301', title: 'Database Systems', description: 'Database design and SQL programming' },
        { id: 'csc303', code: 'CSC 303', title: 'Operating Systems', description: 'Operating system concepts and design' },
        { id: 'csc305', code: 'CSC 305', title: 'Software Engineering', description: 'Software development methodologies' }
      ],
      '400': [
        { id: 'csc401', code: 'CSC 401', title: 'Artificial Intelligence', description: 'AI concepts and applications' },
        { id: 'csc403', code: 'CSC 403', title: 'Computer Networks', description: 'Network protocols and architecture' },
        { id: 'csc405', code: 'CSC 405', title: 'Project', description: 'Final year project development' }
      ]
    },
    'Electrical Engineering': {
      '100': [
        { id: 'eee101', code: 'EEE 101', title: 'Introduction to Electrical Engineering', description: 'Basic electrical engineering concepts' },
        { id: 'eee103', code: 'EEE 103', title: 'Circuit Theory I', description: 'DC circuit analysis and theorems' },
        { id: 'mat101', code: 'MAT 101', title: 'Elementary Mathematics I', description: 'Mathematics for engineering' }
      ],
      '200': [
        { id: 'eee201', code: 'EEE 201', title: 'Electromagnetic Fields', description: 'Electromagnetic theory and applications' },
        { id: 'eee203', code: 'EEE 203', title: 'Circuit Theory II', description: 'AC circuit analysis' },
        { id: 'eee205', code: 'EEE 205', title: 'Electronic Devices', description: 'Semiconductor devices and circuits' }
      ],
      '300': [
        { id: 'eee301', code: 'EEE 301', title: 'Power Systems', description: 'Power generation and distribution' },
        { id: 'eee303', code: 'EEE 303', title: 'Control Systems', description: 'Feedback control theory' },
        { id: 'eee305', code: 'EEE 305', title: 'Communication Systems', description: 'Analog and digital communications' }
      ],
      '400': [
        { id: 'eee401', code: 'EEE 401', title: 'Power Electronics', description: 'Power electronic converters' },
        { id: 'eee403', code: 'EEE 403', title: 'Renewable Energy', description: 'Solar and wind power systems' },
        { id: 'eee405', code: 'EEE 405', title: 'Project', description: 'Final year engineering project' }
      ]
    }
  },
  'University of Ibadan': {
    'Computer Science': {
      '100': [
        { id: 'csc101', code: 'CSC 101', title: 'Introduction to Computer Science', description: 'Basic programming concepts and algorithms' },
        { id: 'csc103', code: 'CSC 103', title: 'Computer Programming I', description: 'Introduction to programming with Python' },
        { id: 'mat101', code: 'MAT 101', title: 'Elementary Mathematics I', description: 'Basic mathematics for computer science' }
      ],
      '200': [
        { id: 'csc201', code: 'CSC 201', title: 'Data Structures and Algorithms', description: 'Fundamental data structures and algorithm design' },
        { id: 'csc203', code: 'CSC 203', title: 'Object-Oriented Programming', description: 'OOP concepts and design patterns' },
        { id: 'csc205', code: 'CSC 205', title: 'Computer Organization', description: 'Computer architecture and assembly language' }
      ],
      '300': [
        { id: 'csc301', code: 'CSC 301', title: 'Database Systems', description: 'Database design and management' },
        { id: 'csc303', code: 'CSC 303', title: 'Web Technologies', description: 'Web development and frameworks' },
        { id: 'csc305', code: 'CSC 305', title: 'Software Engineering', description: 'Software development lifecycle' }
      ],
      '400': [
        { id: 'csc401', code: 'CSC 401', title: 'Machine Learning', description: 'ML algorithms and applications' },
        { id: 'csc403', code: 'CSC 403', title: 'Cybersecurity', description: 'Information security principles' },
        { id: 'csc405', code: 'CSC 405', title: 'Project', description: 'Final year project development' }
      ]
    }
  }
};

// Sample quiz questions for each subject
const sampleQuestions = {
  'csc101': [
    { text: 'What is an algorithm?', options: ['A programming language', 'A step-by-step procedure to solve a problem', 'A type of computer hardware', 'A database system'], answer: 'A step-by-step procedure to solve a problem' },
    { text: 'Which of the following is a high-level programming language?', options: ['Assembly', 'Machine Code', 'Python', 'Binary'], answer: 'Python' },
    { text: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Control Processing Unit'], answer: 'Central Processing Unit' },
    { text: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], answer: 'O(log n)' },
    { text: 'Which data structure follows LIFO principle?', options: ['Queue', 'Stack', 'Array', 'Linked List'], answer: 'Stack' }
  ],
  'csc201': [
    { text: 'What is the worst-case time complexity of quicksort?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], answer: 'O(n²)' },
    { text: 'Which traversal visits the root node first?', options: ['Inorder', 'Preorder', 'Postorder', 'Level order'], answer: 'Preorder' },
    { text: 'What is a hash table?', options: ['A sorted array', 'A data structure that maps keys to values', 'A type of tree', 'A linked list'], answer: 'A data structure that maps keys to values' },
    { text: 'Which algorithm is used for finding shortest path in a graph?', options: ['DFS', 'BFS', 'Dijkstra\'s algorithm', 'Binary search'], answer: 'Dijkstra\'s algorithm' },
    { text: 'What is the space complexity of a linked list?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], answer: 'O(n)' }
  ]
};

// Utility functions
function ensureDataDirectory() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function loadData(filePath, defaultData = {}) {
  ensureDataDirectory();
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return defaultData;
  }
}

function saveData(filePath, data) {
  ensureDataDirectory();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function sendError(res, message, status = 400) {
  res.status(status).json({ message });
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API Routes

// Auth routes
app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return sendError(res, 'Name, email, and password are required.');
  }

  const users = loadData(usersFile);
  const normalizedEmail = email.trim().toLowerCase();

  if (users[normalizedEmail]) {
    return sendError(res, 'An account already exists with that email.', 409);
  }

  const userId = crypto.randomUUID();
  users[normalizedEmail] = {
    id: userId,
    name: name.trim(),
    email: normalizedEmail,
    password,
    createdAt: new Date().toISOString()
  };

  saveData(usersFile, users);
  res.json({ user: { id: userId, email: normalizedEmail, name: name.trim() } });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendError(res, 'Email and password are required.');
  }

  const users = loadData(usersFile);
  const normalizedEmail = email.trim().toLowerCase();
  const user = users[normalizedEmail];

  if (!user || user.password !== password) {
    return sendError(res, 'Invalid email or password.', 401);
  }

  const profiles = loadData(profilesFile);
  const profile = profiles[user.id] || {};

  res.json({
    user: {
      id: user.id || crypto.randomUUID(),
      email: user.email || normalizedEmail,
      name: user.name,
      university: profile.university || '',
      department: profile.department || '',
      courseOfStudy: profile.courseOfStudy || '',
      level: profile.level || ''
    }
  });
});

// Profile routes
app.post('/api/profile', (req, res) => {
  const { email, university, department, courseOfStudy, level } = req.body;
  const missing = [];
  if (!email) missing.push('email');
  if (!university) missing.push('university');
  if (!department) missing.push('department');
  if (!courseOfStudy) missing.push('courseOfStudy');
  if (!level) missing.push('level');
  
  if (missing.length > 0) {
    return sendError(res, `Missing fields: ${missing.join(', ')}. Please do a hard refresh (Ctrl+Shift+R).`);
  }

  const users = loadData(usersFile);
  const normalizedEmail = email.trim().toLowerCase();
  const user = users[normalizedEmail];

  if (!user) {
    return sendError(res, 'User not found.', 404);
  }

  // Ensure user has an id, fallback to generating one if missing
  if (!user.id) {
    user.id = crypto.randomUUID();
    user.email = normalizedEmail; // Add missing email field back into DB
    saveData(usersFile, users);
  }

  const profiles = loadData(profilesFile);
  profiles[user.id] = {
    university: university.trim(),
    department: department.trim(),
    courseOfStudy: courseOfStudy.trim(),
    level: level.toString(),
    updatedAt: new Date().toISOString()
  };

  saveData(profilesFile, profiles);
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      university: university.trim(),
      department: department.trim(),
      courseOfStudy: courseOfStudy.trim(),
      level: level.toString()
    }
  });
});

// Course routes
app.get('/api/courses', (req, res) => {
  const { semester, university, department } = req.query;

  if (!university || !department || !semester) {
    return sendError(res, 'University, department, and semester are required.');
  }

  const subjects = sampleSubjects[university]?.[department]?.[semester] || [];
  res.json({ courses: subjects });
});

// Quiz routes
app.get('/api/quiz/start', (req, res) => {
  const { courseId } = req.query;
  if (!courseId) {
    return sendError(res, 'Course ID is required.');
  }

  const questions = sampleQuestions[courseId] || [];
  if (questions.length === 0) {
    return sendError(res, 'No questions available for this course.', 404);
  }

  res.json({ questions });
});

app.post('/api/quiz/submit', (req, res) => {
  const { courseId, answers, timeSpent } = req.body;
  if (!courseId || !answers) {
    return sendError(res, 'Course ID and answers are required.');
  }

  const questions = sampleQuestions[courseId] || [];
  if (questions.length === 0) {
    return sendError(res, 'Course not found.', 404);
  }

  const results = questions.map((question, index) => {
    const selected = answers[index] || null;
    return {
      question: question.text,
      selected,
      correct: question.answer,
      isCorrect: selected === question.answer
    };
  });

  const correctCount = results.filter(r => r.isCorrect).length;
  const failed = results.filter(r => !r.isCorrect);

  // Save results
  const resultsData = loadData(resultsFile, []);
  resultsData.push({
    id: crypto.randomUUID(),
    courseId,
    answers,
    results,
    correctCount,
    total: questions.length,
    timeSpent: timeSpent || 0,
    submittedAt: new Date().toISOString()
  });
  saveData(resultsFile, resultsData);

  res.json({
    courseId,
    total: questions.length,
    correctCount,
    failed,
    results,
    percentage: Math.round((correctCount / questions.length) * 100)
  });
});

// Stats route
app.get('/api/stats', (req, res) => {
  // This would normally get user from session/token
  // For now, return mock stats
  const results = loadData(resultsFile, []);
  const totalQuizzes = results.length;
  const totalCorrect = results.reduce((sum, r) => sum + r.correctCount, 0);
  const totalQuestions = results.reduce((sum, r) => sum + r.total, 0);
  const averageScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  res.json({
    totalQuizzes,
    averageScore,
    totalTime: results.reduce((sum, r) => sum + (r.timeSpent || 0), 0),
    bestStreak: 5 // Mock data
  });
});

// Past questions route
app.get('/api/past-questions', (req, res) => {
  // Mock past questions data
  const pastQuestions = [
    { id: 'pq1', year: '2023', semester: 'First Semester', subject: 'CSC 101' },
    { id: 'pq2', year: '2023', semester: 'Second Semester', subject: 'CSC 201' },
    { id: 'pq3', year: '2022', semester: 'First Semester', subject: 'EEE 101' },
    { id: 'pq4', year: '2022', semester: 'Second Semester', subject: 'MAT 101' }
  ];

  res.json({ questions: pastQuestions });
});

// Catch-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
