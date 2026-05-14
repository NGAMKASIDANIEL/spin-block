// DOM Elements
const landingSection = document.getElementById('landing-section');
const authSection = document.getElementById('auth-section');
const profileSection = document.getElementById('profile-section');
const dashboardSection = document.getElementById('dashboard-section');
const semesterSection = document.getElementById('semester-section');
const coursesSection = document.getElementById('courses-section');
const pastQuestionsSection = document.getElementById('past-questions-section');
const quizSection = document.getElementById('quiz-section');
const resultsSection = document.getElementById('results-section');

// Auth Elements
const loginTab = document.getElementById('login-tab');
const signupTab = document.getElementById('signup-tab');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const switchToSignup = document.getElementById('switch-to-signup');
const switchToLogin = document.getElementById('switch-to-login');

// Dashboard Elements
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const dashboardContent = document.getElementById('dashboard-content');
const statsGrid = document.getElementById('stats-grid');
const actionButtons = document.getElementById('action-buttons');

// Semester/Course Elements
const semesterGrid = document.getElementById('semester-grid');
const coursesGrid = document.getElementById('courses-grid');
const pastQuestionsGrid = document.getElementById('past-questions-grid');

// Quiz Elements
const quizContainer = document.getElementById('quiz-container');
const quizTimer = document.getElementById('quiz-timer');
const quizContent = document.getElementById('quiz-content');
const quizNavigation = document.getElementById('quiz-navigation');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');

// Results Elements
const resultsContent = document.getElementById('results-content');
const scoreDisplay = document.getElementById('score-display');
const percentageDisplay = document.getElementById('percentage-display');
const resultsSummary = document.getElementById('results-summary');

// State Variables
let currentUser = null;
let currentSection = 'landing';
let selectedSemester = null;
let selectedCourse = null;
let quizQuestions = [];
let currentQuestionIndex = 0;
let quizAnswers = {};
let quizStartTime = null;
let quizTimerInterval = null;

// Initialize the application
async function init() {
  setupEventListeners();
  await loadUserSession();
  showSection(currentSection);
}

// Setup all event listeners
function setupEventListeners() {
  // Auth tabs
  loginTab.addEventListener('click', () => showAuthForm('login'));
  signupTab.addEventListener('click', () => showAuthForm('signup'));
  switchToSignup.addEventListener('click', () => showAuthForm('signup'));
  switchToLogin.addEventListener('click', () => showAuthForm('login'));

  // Auth forms
  loginForm.addEventListener('submit', handleLogin);
  signupForm.addEventListener('submit', handleSignup);

  // Profile form
  document.getElementById('profile-form').addEventListener('submit', handleProfileSubmit);

  // Sidebar navigation
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const section = e.target.closest('.sidebar-link').dataset.section;
      if (section) {
        showSection(section);
      }
    });
  });

  // Landing page actions
  document.getElementById('get-started-btn').addEventListener('click', () => showSection('auth'));
  document.getElementById('learn-more-btn').addEventListener('click', () => showSection('auth'));

  // Semester selection
  semesterGrid.addEventListener('click', handleSemesterClick);

  // Course selection
  coursesGrid.addEventListener('click', handleCourseClick);

  // Past questions
  pastQuestionsGrid.addEventListener('click', handlePastQuestionClick);

  // Quiz navigation
  prevBtn.addEventListener('click', showPreviousQuestion);
  nextBtn.addEventListener('click', showNextQuestion);
  submitBtn.addEventListener('click', handleQuizSubmit);

  // Results
  document.getElementById('retake-quiz-btn').addEventListener('click', () => showSection('courses'));
  document.getElementById('view-results-btn').addEventListener('click', () => showSection('results'));
}

// Section management
function showSection(sectionName) {
  // Hide all sections
  const sections = document.querySelectorAll('.page-section');
  sections.forEach(section => section.classList.add('hidden'));

  // Show target section
  const targetSection = document.getElementById(`${sectionName}-section`);
  if (targetSection) {
    targetSection.classList.remove('hidden');
    currentSection = sectionName;
    updateNavigation(sectionName);
  }

  // Handle special cases
  if (sectionName === 'dashboard') {
    renderDashboard();
  } else if (sectionName === 'semester') {
    renderSemesters();
  } else if (sectionName === 'profile') {
    // Make profile form visible
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      document.querySelectorAll('.form').forEach(form => form.classList.remove('active'));
      profileForm.classList.add('active');
    }
  }
}

// Update sidebar navigation
function updateNavigation(activeSection) {
  sidebarLinks.forEach(link => {
    link.classList.remove('active');
    if (link.dataset.section === activeSection) {
      link.classList.add('active');
    }
  });
}

// Auth functions
function showAuthForm(formType) {
  // Update tabs
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById(`${formType}-tab`).classList.add('active');

  // Show form
  document.querySelectorAll('.form').forEach(form => form.classList.remove('active'));
  document.getElementById(`${formType}-form`).classList.add('active');
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    currentUser = data.user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    if (currentUser.university && currentUser.course && currentUser.level) {
      showSection('dashboard');
    } else {
      showSection('profile');
    }
  } catch (error) {
    alert(error.message);
  }
}

async function handleSignup(event) {
  event.preventDefault();

  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim().toLowerCase();
  const password = document.getElementById('signup-password').value;

  try {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    currentUser = data.user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showSection('profile');
  } catch (error) {
    alert(error.message);
  }
}

async function handleProfileSubmit(event) {
  event.preventDefault();

  const university = document.getElementById('university').value.trim();
  const department = document.getElementById('department').value.trim();
  const level = document.getElementById('level').value;

  try {
    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser.email, university, department, level })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    currentUser = data.user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showSection('dashboard');
  } catch (error) {
    alert(error.message);
  }
}

// Dashboard functions
async function renderDashboard() {
  if (!currentUser) return;

  // Update user info in sidebar
  const userNameEl = document.getElementById('sidebar-user-name');
  const userLevelEl = document.getElementById('sidebar-user-level');
  
  if (userNameEl) userNameEl.textContent = currentUser.name;
  if (userLevelEl) userLevelEl.textContent = `${currentUser.level} Level`;

  // Render stats
  await renderStats();

  // Render quick actions
  renderQuickActions();
}

async function renderStats() {
  try {
    const response = await fetch('/api/stats');
    const stats = await response.json();

    statsGrid.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-info">
          <div class="stat-number">${stats.totalQuizzes || 0}</div>
          <div class="stat-label">Quizzes Taken</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-info">
          <div class="stat-number">${stats.averageScore || 0}%</div>
          <div class="stat-label">Average Score</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-info">
          <div class="stat-number">${stats.totalTime || 0}</div>
          <div class="stat-label">Study Hours</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-info">
          <div class="stat-number">${stats.bestStreak || 0}</div>
          <div class="stat-label">Best Streak</div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

function renderQuickActions() {
  actionButtons.innerHTML = `
    <button class="action-btn primary" onclick="showSection('semester')">
      <span>📖</span> Start Learning
    </button>
    <button class="action-btn secondary" onclick="showSection('past-questions')">
      <span>📝</span> Practice Questions
    </button>
  `;
}

// Semester functions
function renderSemesters() {
  semesterGrid.innerHTML = `
    <div class="semester-card" data-semester="100">
      <h3>100 Level</h3>
      <p>Foundation courses for first-year students</p>
      <button class="primary">Select Semester</button>
    </div>
    <div class="semester-card" data-semester="200">
      <h3>200 Level</h3>
      <p>Intermediate courses building on 100 level knowledge</p>
      <button class="primary">Select Semester</button>
    </div>
    <div class="semester-card" data-semester="300">
      <h3>300 Level</h3>
      <p>Advanced courses with specialized focus</p>
      <button class="primary">Select Semester</button>
    </div>
    <div class="semester-card" data-semester="400">
      <h3>400 Level</h3>
      <p>Final year courses and project work</p>
      <button class="primary">Select Semester</button>
    </div>
  `;
}

function handleSemesterClick(event) {
  const semesterCard = event.target.closest('.semester-card');
  if (semesterCard) {
    selectedSemester = semesterCard.dataset.semester;
    showSection('courses');
    renderCourses();
  }
}

// Course functions
async function renderCourses() {
  try {
    const response = await fetch(`/api/courses?semester=${selectedSemester}&university=${currentUser.university}&department=${currentUser.department}`);
    const data = await response.json();

    coursesGrid.innerHTML = data.courses.map(course => `
      <div class="course-card" data-course-id="${course.id}">
        <div class="course-code">${course.code}</div>
        <h3>${course.title}</h3>
        <p>${course.description}</p>
        <button class="primary">Start Quiz</button>
      </div>
    `).join('');
  } catch (error) {
    alert('Failed to load courses');
  }
}

function handleCourseClick(event) {
  const courseCard = event.target.closest('.course-card');
  if (courseCard) {
    selectedCourse = courseCard.dataset.courseId;
    startQuiz();
  }
}

// Past questions functions
async function renderPastQuestions() {
  try {
    const response = await fetch('/api/past-questions');
    const data = await response.json();

    pastQuestionsGrid.innerHTML = data.questions.map(question => `
      <div class="past-question-card" data-question-id="${question.id}">
        <h3>${question.year} ${question.semester}</h3>
        <p>${question.subject}</p>
        <button class="primary">Practice</button>
      </div>
    `).join('');
  } catch (error) {
    alert('Failed to load past questions');
  }
}

function handlePastQuestionClick(event) {
  const questionCard = event.target.closest('.past-question-card');
  if (questionCard) {
    const questionId = questionCard.dataset.questionId;
    startPastQuestionQuiz(questionId);
  }
}

// Quiz functions
async function startQuiz() {
  try {
    const response = await fetch(`/api/quiz/start?courseId=${selectedCourse}`);
    const data = await response.json();

    quizQuestions = data.questions;
    currentQuestionIndex = 0;
    quizAnswers = {};
    quizStartTime = Date.now();

    startQuizTimer();
    renderQuestion();
    showSection('quiz');
  } catch (error) {
    alert('Failed to start quiz');
  }
}

function startQuizTimer() {
  let timeLeft = 30 * 60; // 30 minutes

  quizTimerInterval = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    quizTimer.textContent = `⏱️ ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (timeLeft <= 0) {
      clearInterval(quizTimerInterval);
      handleQuizSubmit();
    }
    timeLeft--;
  }, 1000);
}

function renderQuestion() {
  const question = quizQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

  quizContent.innerHTML = `
    <div class="question-block">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3>Question ${currentQuestionIndex + 1} of ${quizQuestions.length}</h3>
        <div style="width: 200px; height: 8px; background: #e0f7ff; border-radius: 4px;">
          <div style="width: ${progress}%; height: 100%; background: var(--primary); border-radius: 4px; transition: width 0.3s ease;"></div>
        </div>
      </div>
      <h3>${question.text}</h3>
      <div class="options">
        ${question.options.map((option, index) => `
          <label>
            <input type="radio" name="question" value="${option}" ${quizAnswers[currentQuestionIndex] === option ? 'checked' : ''}>
            ${option}
          </label>
        `).join('')}
      </div>
    </div>
  `;

  updateQuizNavigation();
}

function updateQuizNavigation() {
  prevBtn.style.display = currentQuestionIndex > 0 ? 'block' : 'none';
  nextBtn.style.display = currentQuestionIndex < quizQuestions.length - 1 ? 'block' : 'none';
  submitBtn.style.display = currentQuestionIndex === quizQuestions.length - 1 ? 'block' : 'none';
}

function showPreviousQuestion() {
  saveCurrentAnswer();
  currentQuestionIndex--;
  renderQuestion();
}

function showNextQuestion() {
  saveCurrentAnswer();
  currentQuestionIndex++;
  renderQuestion();
}

function saveCurrentAnswer() {
  const selectedOption = document.querySelector('input[name="question"]:checked');
  if (selectedOption) {
    quizAnswers[currentQuestionIndex] = selectedOption.value;
  }
}

async function handleQuizSubmit() {
  saveCurrentAnswer();
  clearInterval(quizTimerInterval);

  try {
    const response = await fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId: selectedCourse,
        answers: quizAnswers,
        timeSpent: Math.floor((Date.now() - quizStartTime) / 1000)
      })
    });

    const result = await response.json();
    showResults(result);
  } catch (error) {
    alert('Failed to submit quiz');
  }
}

// Results functions
function showResults(result) {
  const percentage = Math.round((result.correctCount / result.total) * 100);

  scoreDisplay.textContent = `${result.correctCount}/${result.total}`;
  percentageDisplay.textContent = `${percentage}%`;

  resultsSummary.innerHTML = result.failed.map(item => `
    <div class="result-item incorrect">
      <strong>${item.question}</strong><br>
      Your answer: ${item.selected}<br>
      Correct: ${item.correct}
    </div>
  `).join('');

  showSection('results');
}

// Utility functions
async function loadUserSession() {
  const userData = localStorage.getItem('currentUser');
  if (userData) {
    currentUser = JSON.parse(userData);
    currentSection = currentUser.university ? 'dashboard' : 'profile';
  } else {
    currentSection = 'landing';
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  showSection('landing');
}

document.addEventListener('DOMContentLoaded', init);
