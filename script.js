const loginTab = document.getElementById('login-tab');
const signupTab = document.getElementById('signup-tab');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const switchToSignup = document.getElementById('switch-to-signup');
const switchToLogin = document.getElementById('switch-to-login');
const authSection = document.getElementById('auth-section');
const profileSection = document.getElementById('profile-section');
const coursesSection = document.getElementById('courses-section');
const quizSection = document.getElementById('quiz-section');
const resultsSection = document.getElementById('results-section');
const userNameSpan = document.getElementById('user-name');
const profileForm = document.getElementById('profile-form');
const coursesList = document.getElementById('courses-list');
const quizCard = document.getElementById('quiz-card');
const quizTitle = document.getElementById('quiz-title');
const resultSummary = document.getElementById('result-summary');
const restartBtn = document.getElementById('restart-btn');
const navBar = document.getElementById('nav-bar');
const navHome = document.getElementById('nav-home');
const navCourses = document.getElementById('nav-courses');
const navProfile = document.getElementById('nav-profile');
const signOutBtn = document.getElementById('sign-out-btn');

const currentUserKey = 'student-quiz-current-user';
let availableCourses = [];
let selectedCourse = null;

function getCurrentUser() {
  return JSON.parse(localStorage.getItem(currentUserKey) || 'null');
}

function setCurrentUser(user) {
  localStorage.setItem(currentUserKey, JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem(currentUserKey);
}

function showSection(section) {
  [authSection, profileSection, coursesSection, quizSection, resultsSection].forEach((panel) => {
    panel.classList.add('hidden');
  });
  section.classList.remove('hidden');

  // Show/hide navigation bar
  if (section === authSection) {
    navBar.classList.add('hidden');
  } else {
    navBar.classList.remove('hidden');
  }
}

function setActiveTab(tab) {
  [loginTab, signupTab].forEach((button) => button.classList.remove('active'));
  tab.classList.add('active');
}

function showLogin() {
  setActiveTab(loginTab);
  loginForm.classList.add('active');
  signupForm.classList.remove('active');
}

function showSignup() {
  setActiveTab(signupTab);
  signupForm.classList.add('active');
  loginForm.classList.remove('active');
}

function showProfileStep() {
  const user = getCurrentUser();
  if (!user) {
    showSection(authSection);
    return;
  }

  userNameSpan.textContent = user.name;
  profileForm.classList.add('active');

  // Populate form fields with current values
  document.getElementById('university').value = user.university || '';
  document.getElementById('course').value = user.course || '';
  document.getElementById('level').value = user.level || '';

  showSection(profileSection);
}

async function postJson(url, data) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const payload = await response.json().catch(() => ({ message: 'Server error' }));

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload;
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;

  try {
    const { user } = await postJson('/api/login', { email, password });
    setCurrentUser(user);
    showProfileStep();
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
    const { user } = await postJson('/api/signup', { name, email, password });
    setCurrentUser(user);
    showProfileStep();
  } catch (error) {
    alert(error.message);
  }
}

async function handleProfileSubmit(event) {
  event.preventDefault();

  const university = document.getElementById('university').value.trim();
  const course = document.getElementById('course').value.trim();
  const level = document.getElementById('level').value;
  const user = getCurrentUser();

  if (!user || !university || !course || !level) {
    alert('Please fill in all profile fields.');
    return;
  }

  try {
    const { user: updatedUser } = await postJson('/api/profile', {
      email: user.email,
      university,
      course,
      level,
    });

    setCurrentUser(updatedUser);
    showCourses();
  } catch (error) {
    alert(error.message);
  }
}

async function loadCourses() {
  const response = await fetch('/api/courses');
  if (!response.ok) {
    throw new Error('Unable to load course list.');
  }

  const data = await response.json();
  availableCourses = data.courses || [];
}

async function showCourses() {
  const user = getCurrentUser();
  if (!user) {
    showSection(authSection);
    return;
  }

  try {
    await loadCourses();
  } catch (error) {
    alert(error.message);
    return;
  }

  coursesList.innerHTML = '';

  availableCourses.forEach((course) => {
    const card = document.createElement('div');
    card.className = 'card course-card';
    card.innerHTML = `
      <h3>${course.title}</h3>
      <p>${course.description}</p>
      <button class="primary" data-course-id="${course.id}">Start Quiz</button>
    `;
    coursesList.appendChild(card);
  });

  showSection(coursesSection);
}

function renderQuiz(course) {
  selectedCourse = course;
  quizTitle.textContent = `${course.title} Quiz`;
  quizCard.innerHTML = '';

  course.questions.forEach((question, index) => {
    const block = document.createElement('div');
    block.className = 'question-block';
    block.innerHTML = `<h3>Question ${index + 1}</h3><p>${question.text}</p>`;

    const options = document.createElement('div');
    options.className = 'options';

    question.options.forEach((option) => {
      const optionId = `${course.id}-q${index}-${option}`;
      const label = document.createElement('label');
      label.innerHTML = `
        <input type="radio" name="question-${index}" value="${option}" id="${optionId}" />
        ${option}
      `;
      options.appendChild(label);
    });

    block.appendChild(options);
    quizCard.appendChild(block);
  });

  const submit = document.createElement('button');
  submit.className = 'primary';
  submit.textContent = 'Submit Answers';
  submit.addEventListener('click', handleQuizSubmit);
  quizCard.appendChild(submit);
  showSection(quizSection);
}

async function handleQuizSubmit() {
  const answers = {};
  const questionBlocks = quizCard.querySelectorAll('.question-block');
  let allAnswered = true;

  questionBlocks.forEach((block, index) => {
    const selected = block.querySelector('input[type="radio"]:checked');
    answers[index] = selected ? selected.value : null;
    if (!selected) {
      allAnswered = false;
    }
  });

  if (!allAnswered) {
    alert('Please answer every question before submitting.');
    return;
  }

  try {
    const result = await postJson('/api/quiz/submit', {
      courseId: selectedCourse.id,
      answers,
    });
    showResults(result);
  } catch (error) {
    alert(error.message);
  }
}

function showResults(result) {
  const { courseTitle, total, correctCount, failed } = result;
  const user = getCurrentUser();

  const summaryParts = [
    `<p><strong>${user.name}</strong>, you scored <strong>${correctCount} / ${total}</strong> on ${courseTitle}.</p>`,
    `<p>Passed: <strong>${correctCount}</strong></p>`,
    `<p>Failed: <strong>${failed.length}</strong></p>`,
  ];

  if (failed.length > 0) {
    summaryParts.push('<h3>Questions to review</h3>');
    failed.forEach((item, index) => {
      summaryParts.push(`
        <div class="card" style="margin-bottom:12px;">
          <p><strong>${index + 1}. ${item.question}</strong></p>
          <p>Your answer: ${item.selected}</p>
          <p>Correct answer: ${item.correct}</p>
        </div>
      `);
    });
  } else {
    summaryParts.push('<p>Great job! You got all the answers right.</p>');
  }

  resultSummary.innerHTML = summaryParts.join('');
  showSection(resultsSection);
}

async function init() {
  showLogin();
  const currentUser = getCurrentUser();

  if (currentUser && currentUser.university && currentUser.course && currentUser.level) {
    await showCourses();
  } else if (currentUser) {
    showProfileStep();
  } else {
    showSection(authSection);
  }
}

loginTab.addEventListener('click', showLogin);
signupTab.addEventListener('click', showSignup);
switchToSignup.addEventListener('click', showSignup);
switchToLogin.addEventListener('click', showLogin);
loginForm.addEventListener('submit', handleLogin);
signupForm.addEventListener('submit', handleSignup);
profileForm.addEventListener('submit', handleProfileSubmit);
coursesList.addEventListener('click', (event) => {
  if (event.target.matches('button[data-course-id]')) {
    const courseId = event.target.dataset.courseId;
    const course = availableCourses.find((item) => item.id === courseId);
    if (course) {
      renderQuiz(course);
    }
  }
});
restartBtn.addEventListener('click', () => {
  showCourses();
});

// Navigation event listeners
navHome.addEventListener('click', () => {
  const user = getCurrentUser();
  if (user && user.university && user.course && user.level) {
    showCourses();
  } else if (user) {
    showProfileStep();
  } else {
    showSection(authSection);
  }
});

navCourses.addEventListener('click', () => {
  const user = getCurrentUser();
  if (user && user.university && user.course && user.level) {
    showCourses();
  } else {
    alert('Please complete your profile first.');
    showProfileStep();
  }
});

navProfile.addEventListener('click', () => {
  showProfileStep();
});

signOutBtn.addEventListener('click', () => {
  clearCurrentUser();
  showSection(authSection);
});

init();
