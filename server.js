const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');
const usersFilePath = path.join(dataDir, 'users.json');

const sampleCourses = [
  {
    id: 'math101',
    title: 'Mathematics 101',
    description: 'Basic mathematics questions for your level.',
    questions: [
      {
        text: 'What is 7 + 5?',
        options: ['10', '12', '13', '15'],
        answer: '12',
      },
      {
        text: 'What is 9 × 3?',
        options: ['18', '21', '27', '30'],
        answer: '27',
      },
      {
        text: 'What is 15 ÷ 3?',
        options: ['3', '4', '5', '6'],
        answer: '5',
      },
    ],
  },
  {
    id: 'science101',
    title: 'Science 101',
    description: 'Simple science questions to test your understanding.',
    questions: [
      {
        text: 'What planet is known as the Red Planet?',
        options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
        answer: 'Mars',
      },
      {
        text: 'What do plants need to make food?',
        options: ['Oxygen', 'Carbon Dioxide', 'Sunlight', 'Nitrogen'],
        answer: 'Sunlight',
      },
      {
        text: 'What is H2O commonly called?',
        options: ['Salt', 'Water', 'Sugar', 'Oil'],
        answer: 'Water',
      },
    ],
  },
  {
    id: 'english101',
    title: 'English 101',
    description: 'Basic English comprehension and grammar questions.',
    questions: [
      {
        text: 'Which word is a noun?',
        options: ['Run', 'Happy', 'School', 'Quickly'],
        answer: 'School',
      },
      {
        text: 'Choose the correct sentence.',
        options: ['She dont like it.', 'She doesn\'t like it.', 'She doesn\'t likes it.', 'She don\'t likes it.'],
        answer: 'She doesn\'t like it.',
      },
      {
        text: 'Which is an adjective?',
        options: ['Blue', 'Run', 'Him', 'Eat'],
        answer: 'Blue',
      },
    ],
  },
];

function ensureDataDirectory() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify({}), 'utf-8');
  }
}

function loadUsers() {
  ensureDataDirectory();
  const raw = fs.readFileSync(usersFilePath, 'utf-8');
  return JSON.parse(raw || '{}');
}

function saveUsers(users) {
  ensureDataDirectory();
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
}

function sendError(res, message, status = 400) {
  res.status(status).json({ message });
}

app.use(express.json());
app.use('/data', (req, res) => res.status(404).json({ message: 'Not found' }));
app.use(express.static(path.join(__dirname)));

app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return sendError(res, 'Name, email, and password are required.');
  }

  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users[normalizedEmail]) {
    return sendError(res, 'An account already exists with that email.', 409);
  }

  users[normalizedEmail] = {
    name: name.trim(),
    password,
  };

  saveUsers(users);
  res.json({ user: { email: normalizedEmail, name: name.trim() } });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return sendError(res, 'Email and password are required.');
  }

  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users[normalizedEmail];

  if (!user || user.password !== password) {
    return sendError(res, 'Login failed. Please check your email and password.', 401);
  }

  res.json({ user: { email: normalizedEmail, name: user.name, university: user.university || '', course: user.course || '', level: user.level || '' } });
});

app.post('/api/profile', (req, res) => {
  const { email, university, course, level } = req.body || {};
  if (!email || !university || !course || !level) {
    return sendError(res, 'Email, university, course, and level are required.');
  }

  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users[normalizedEmail];

  if (!user) {
    return sendError(res, 'User not found.', 404);
  }

  users[normalizedEmail] = {
    ...user,
    university: university.trim(),
    course: course.trim(),
    level: level.toString(),
  };

  saveUsers(users);
  res.json({ user: { email: normalizedEmail, name: user.name, university: university.trim(), course: course.trim(), level: level.toString() } });
});

app.get('/api/courses', (req, res) => {
  const courses = sampleCourses.map(({ id, title, description, questions }) => ({ id, title, description, questions }));
  res.json({ courses });
});

app.post('/api/quiz/submit', (req, res) => {
  const { courseId, answers } = req.body || {};
  if (!courseId || typeof answers !== 'object') {
    return sendError(res, 'Course ID and answers are required.');
  }

  const course = sampleCourses.find((item) => item.id === courseId);
  if (!course) {
    return sendError(res, 'Course not found.', 404);
  }

  const results = course.questions.map((question, index) => {
    const selected = answers[index] || null;
    return {
      question: question.text,
      selected,
      correct: question.answer,
      isCorrect: selected === question.answer,
    };
  });

  const correctCount = results.filter((item) => item.isCorrect).length;
  const failed = results.filter((item) => !item.isCorrect);

  res.json({
    courseTitle: course.title,
    total: results.length,
    correctCount,
    failed,
    results,
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
