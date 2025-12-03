const API_URL = 'https://backnode-50az.onrender.com';
let currentUser = null;

// Initialize Navigation Based on Login Status
function initializeNavigation() {
    const token = localStorage.getItem('userToken');
    const isLoggedIn = !!token;
    
    const navLinks = document.getElementById('navLinks');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (!navLinks) return;

    if (isLoggedIn) {
        // Logged in navigation
        navLinks.innerHTML = `
            <a href="home.html">Home</a>
            <a href="about.html">About</a>
            <a href="features.html">Features</a>
            <a href="robots.html">Robots</a>
            <a href="quiz.html">Quiz</a>
            <a href="contact.html">Contact</a>
            <a href="profile.html">Profile</a>
            <button class="btn btn-outline" onclick="handleLogout()" style="padding: 8px 16px;">Logout</button>
        `;
        
        if (mobileMenu) {
            mobileMenu.innerHTML = `
                <a href="home.html">Home</a>
                <a href="about.html">About</a>
                <a href="features.html">Features</a>
                <a href="robots.html">Robots</a>
                <a href="quiz.html">Quiz</a>
                <a href="contact.html">Contact</a>
                <a href="profile.html">Profile</a>
                <button class="btn btn-outline" onclick="handleLogout()" style="margin: 10px 0; width: 100%;">Logout</button>
            `;
        }
    } else {
        // Not logged in navigation - only home, contact, quiz
        navLinks.innerHTML = `
            <a href="home.html">Home</a>
            <a href="contact.html">Contact</a>
            <a href="quiz.html">Quiz</a>
            <a href="login.html" class="btn btn-outline" style="padding: 8px 16px;">Log In</a>
            <a href="signup.html" class="btn btn-primary" style="padding: 8px 16px;">Sign Up</a>
        `;
        
        if (mobileMenu) {
            mobileMenu.innerHTML = `
                <a href="home.html">Home</a>
                <a href="contact.html">Contact</a>
                <a href="quiz.html">Quiz</a>
                <a href="login.html" class="btn btn-outline" style="margin: 10px 0; width: 100%;">Log In</a>
                <a href="signup.html" class="btn btn-primary" style="width: 100%;">Sign Up</a>
            `;
        }
    }
}

// Check if user can access quiz
function checkQuizAccess() {
    const token = localStorage.getItem('userToken');
    const quizStart = document.getElementById('quizStart');
    
    if (quizStart && !token) {
        quizStart.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 80px; height: 80px; color: #a855f7; margin: 0 auto 24px;">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <h1 style="font-size: 2.5rem; margin-bottom: 16px;">Quiz Locked</h1>
            <p style="color: #d1d5db; margin-bottom: 32px; font-size: 1.2rem;">Please log in to take the quiz</p>
            <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
                <a href="login.html" class="btn btn-primary" style="padding: 18px 40px; font-size: 18px;">Log In</a>
                <a href="signup.html" class="btn btn-secondary" style="padding: 18px 40px; font-size: 18px;">Sign Up</a>
            </div>
        `;
        return false;
    }
    return true;
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

// Message Display
function showMessage(elementId, message, type) {
    const messageEl = document.getElementById(elementId);
    if (messageEl) {
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        messageEl.style.display = 'block';
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }
    
    if (profileStreet) profileStreet.textContent = addressData.street || '-';
    if (profileCity) profileCity.textContent = addressData.city || '-';
    if (profileZip) profileZip.textContent = addressData.zipCode || '-';
    if (profileCountry) profileCountry.textContent = addressData.country || '-';
}

// Login Handler
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showMessage('loginMessage', 'Please fill in all fields', 'error');
        return;
    }

    try {
        console.log('Attempting login with:', { email });
        
        const response = await fetch(`${API_URL}/api/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log('Login API response:', data);

        if (response.ok) {
            showMessage('loginMessage', 'Login successful! Welcome back.', 'success');
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user || { email }));
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1500);
        } else {
            showMessage('loginMessage', data.message || 'Login failed. Please check your credentials.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('loginMessage', 'Connection error. Please try again.', 'error');
    }
}

// Signup Handler
async function handleSignup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const phone = document.getElementById('signupPhone').value;
    const street = document.getElementById('signupStreet').value;
    const city = document.getElementById('signupCity').value;
    const zipCode = document.getElementById('signupZipCode').value;
    const country = document.getElementById('signupCountry').value;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showMessage('signupMessage', 'Please fill in all required fields', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('signupMessage', 'Password must be at least 6 characters', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showMessage('signupMessage', 'Passwords do not match!', 'error');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('signupMessage', 'Please enter a valid email address', 'error');
        return;
    }

    const userData = {
        name,
        email,
        password,
        phone,
        address: {
            street,
            city,
            zipCode,
            country
        }
    };

    try {
        console.log('Attempting registration with:', { name, email });
        
        const response = await fetch(`${API_URL}/api/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        console.log('Registration API response:', data);

        if (response.ok) {
            showMessage('signupMessage', 'Registration successful! Redirecting to login...', 'success');
            
            // Clear form fields
            document.getElementById('signupName').value = '';
            document.getElementById('signupEmail').value = '';
            document.getElementById('signupPassword').value = '';
            document.getElementById('signupConfirmPassword').value = '';
            document.getElementById('signupPhone').value = '';
            document.getElementById('signupStreet').value = '';
            document.getElementById('signupCity').value = '';
            document.getElementById('signupZipCode').value = '';
            document.getElementById('signupCountry').value = '';
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showMessage('signupMessage', data.message || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('signupMessage', 'Connection error. Please try again.', 'error');
    }
}

// Logout Handler
function handleLogout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    window.location.href = 'home.html';
}

// Load Robots from Backend
async function loadRobots() {
    const container = document.getElementById('robotsContainer');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_URL}/api/products`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch robots');
        }

        const data = await response.json();
        const products = data.data || data;

        if (!products || products.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 64px; height: 64px; margin: 0 auto 16px; color: #9ca3af;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <h3 style="color: white; margin-bottom: 8px;">No Robots Available</h3>
                    <p style="color: #9ca3af;">Check back soon for new robotics projects!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => {
            const stockStatus = product.stock === 0 ? 'out-of-stock' : 
                               product.stock < 10 ? 'low-stock' : 'in-stock';
            const stockText = product.stock === 0 ? 'Out of Stock' : 
                             product.stock < 10 ? `Only ${product.stock} left` : 
                             `${product.stock} in stock`;
            
            const hasDiscount = product.discount && product.discount.percentage > 0;
            const finalPrice = hasDiscount ? 
                (product.price * (1 - product.discount.percentage / 100)).toFixed(2) : 
                product.price.toFixed(2);

            const imageUrl = product.images && product.images.length > 0 ? 
                product.images[0].url : null;

            const stars = Math.round(product.rating?.average || 0);
            const ratingStars = '★'.repeat(stars) + '☆'.repeat(5 - stars);

            return `
                <div class="robot-card">
                    <div class="robot-image">
                        ${hasDiscount ? `<div class="discount-badge">-${product.discount.percentage}% OFF</div>` : ''}
                        ${imageUrl ? 
                            `<img src="${imageUrl}" alt="${product.name}">` : 
                            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                            </svg>`
                        }
                        <div class="robot-badge">${product.category}</div>
                    </div>
                    <div class="robot-details">
                        <div class="robot-header">
                            <div>
                                <h3>${product.name}</h3>
                                ${product.brand ? `<div class="robot-brand">${product.brand}</div>` : ''}
                            </div>
                            <div style="text-align: right;">
                                <div class="robot-price">
                                    ${hasDiscount ? `<span class="original-price">$${product.price.toFixed(2)}</span>` : ''}
                                    $${finalPrice}
                                </div>
                            </div>
                        </div>
                        
                        <p class="robot-description">${product.description}</p>
                        
                        ${product.tags && product.tags.length > 0 ? `
                            <div class="robot-specs">
                                ${product.tags.map(tag => `<span class="spec-tag">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                        
                        <div class="robot-footer">
                            <div class="stock-info">
                                <span class="stock-badge ${stockStatus}">${stockText}</span>
                                ${product.rating && product.rating.count > 0 ? `
                                    <div class="rating">
                                        <span>${ratingStars}</span>
                                        <span class="rating-count">(${product.rating.count})</span>
                                    </div>
                                ` : ''}
                            </div>
                            ${product.isAvailable && product.stock > 0 ? `
                                <a href="robot-detail.html?id=${product._id}" class="btn btn-primary" style="padding: 8px 20px;">View Details</a>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading robots:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 64px; height: 64px; margin: 0 auto 16px; color: #f87171;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <h3 style="color: white; margin-bottom: 8px;">Unable to Load Robots</h3>
                <p style="color: #9ca3af;">There was an error connecting to the server. Please try again later.</p>
                <button class="btn btn-primary" onclick="loadRobots()" style="margin-top: 16px;">Retry</button>
            </div>
        `;
    }
}

// Contact Form Handler
async function handleContactSubmit() {
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessageText').value;

    if (!name || !email || !subject || !message) {
        showMessage('contactMessage', 'Please fill in all required fields', 'error');
        return;
    }

    // Send email using mailto (opens user's email client)
    const mailtoLink = `mailto:yahyabentaher45@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
    window.location.href = mailtoLink;

    showMessage('contactMessage', 'Opening your email client...', 'success');
    
    // Clear form
    setTimeout(() => {
        document.getElementById('contactName').value = '';
        document.getElementById('contactEmail').value = '';
        document.getElementById('contactSubject').value = '';
        document.getElementById('contactMessageText').value = '';
    }, 1000);
}

// Profile Functions
function loadProfile() {
    const userData = localStorage.getItem('userData');
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }

    currentUser = JSON.parse(userData);
    
    // Update display elements
    document.getElementById('profileDisplayName').textContent = currentUser.name || 'User';
    document.getElementById('profileDisplayEmail').textContent = currentUser.email || '';
    document.getElementById('profileAvatar').textContent = (currentUser.name || 'U')[0].toUpperCase();
    
    document.getElementById('viewName').textContent = currentUser.name || '--';
    document.getElementById('viewEmail').textContent = currentUser.email || '--';
    document.getElementById('viewPhone').textContent = currentUser.phone || '--';
    document.getElementById('viewRole').textContent = currentUser.role || 'Member';
    
    if (currentUser.address) {
        document.getElementById('viewStreet').textContent = currentUser.address.street || '--';
        document.getElementById('viewCity').textContent = currentUser.address.city || '--';
        document.getElementById('viewZipCode').textContent = currentUser.address.zipCode || '--';
        document.getElementById('viewCountry').textContent = currentUser.address.country || '--';
    }
    
    if (currentUser.createdAt) {
        const year = new Date(currentUser.createdAt).getFullYear();
        document.getElementById('memberSince').textContent = year;
    }
}

function toggleEditMode() {
    const viewMode = document.getElementById('profileView');
    const editMode = document.getElementById('profileEdit');
    
    if (viewMode.style.display === 'none') {
        // Switch to view mode
        viewMode.style.display = 'block';
        editMode.style.display = 'none';
    } else {
        // Switch to edit mode
        viewMode.style.display = 'none';
        editMode.style.display = 'block';
        
        // Populate edit fields
        document.getElementById('editName').value = currentUser.name || '';
        document.getElementById('editEmail').value = currentUser.email || '';
        document.getElementById('editPhone').value = currentUser.phone || '';
        document.getElementById('editStreet').value = currentUser.address?.street || '';
        document.getElementById('editCity').value = currentUser.address?.city || '';
        document.getElementById('editZipCode').value = currentUser.address?.zipCode || '';
        document.getElementById('editCountry').value = currentUser.address?.country || '';
    }
}

async function saveProfile() {
    const updatedData = {
        name: document.getElementById('editName').value,
        phone: document.getElementById('editPhone').value,
        address: {
            street: document.getElementById('editStreet').value,
            city: document.getElementById('editCity').value,
            zipCode: document.getElementById('editZipCode').value,
            country: document.getElementById('editCountry').value
        }
    };

    // Update local storage
    currentUser = { ...currentUser, ...updatedData };
    localStorage.setItem('userData', JSON.stringify(currentUser));

    showMessage('profileMessage', 'Profile updated successfully!', 'success');
    
    // Switch back to view mode
    toggleEditMode();
    loadProfile();
}

// Quiz Functions
const quizQuestions = [
    {
        question: "What does 'Arduino' refer to in robotics?",
        options: ["A programming language", "An open-source electronics platform", "A type of robot", "A sensor"],
        correct: 1
    },
    {
        question: "Which component is used to control the speed of a DC motor?",
        options: ["Resistor", "Capacitor", "Motor Driver (H-Bridge)", "Diode"],
        correct: 2
    },
    {
        question: "What does LED stand for?",
        options: ["Light Emitting Device", "Light Emitting Diode", "Low Energy Display", "Laser Emitting Diode"],
        correct: 1
    },
    {
        question: "Which sensor is commonly used for obstacle detection in robots?",
        options: ["Temperature sensor", "Ultrasonic sensor", "Humidity sensor", "Light sensor"],
        correct: 1
    },
    {
        question: "What is the purpose of a servo motor in robotics?",
        options: ["Generate electricity", "Precise angular position control", "Measure temperature", "Amplify signals"],
        correct: 1
    },
    {
        question: "In our robotics club, what do we focus on?",
        options: ["Only theory", "Design, build, and program robots", "Only programming", "Only mechanical design"],
        correct: 1
    },
    {
        question: "What does PWM stand for?",
        options: ["Power Wave Modulation", "Pulse Width Modulation", "Programmable Wire Module", "Positive Wave Motion"],
        correct: 1
    },
    {
        question: "Which programming language is commonly used with Arduino?",
        options: ["Python", "Java", "C/C++", "Ruby"],
        correct: 2
    },
    {
        question: "What is a microcontroller?",
        options: ["A small computer on a single chip", "A type of sensor", "A motor driver", "A display screen"],
        correct: 0
    },
    {
        question: "What do we offer in our robotics club?",
        options: ["Only competitions", "Workshops, projects, and competitions", "Only theory classes", "Only hardware"],
        correct: 1
    }
];

let currentQuestionIndex = 0;
let userAnswers = [];
let quizScore = 0;

function startQuiz() {
    if (!checkQuizAccess()) return;
    
    currentQuestionIndex = 0;
    userAnswers = [];
    quizScore = 0;
    
    document.getElementById('quizStart').style.display = 'none';
    document.getElementById('quizInProgress').style.display = 'block';
    
    showQuestion();
}

function showQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    const container = document.getElementById('quizQuestionContainer');
    
    container.innerHTML = `
        <div class="quiz-question">
            <h3>${question.question}</h3>
            <div class="quiz-options">
                ${question.options.map((option, index) => `
                    <div class="quiz-option ${userAnswers[currentQuestionIndex] === index ? 'selected' : ''}" 
                         onclick="selectAnswer(${index})">
                        ${option}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('quizProgressBar').style.width = ((currentQuestionIndex + 1) / 10 * 100) + '%';
    
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    document.getElementById('nextBtn').textContent = currentQuestionIndex === 9 ? 'Finish' : 'Next';
}

function selectAnswer(index) {
    userAnswers[currentQuestionIndex] = index;
    showQuestion();
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

function nextQuestion() {
    if (currentQuestionIndex < 9) {
        currentQuestionIndex++;
        showQuestion();
    } else {
        finishQuiz();
    }
}

function finishQuiz() {
    quizScore = 0;
    const reviewHTML = [];
    
    quizQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.correct;
        if (isCorrect) quizScore++;
        
        reviewHTML.push(`
            <div class="quiz-answer ${isCorrect ? 'correct' : 'incorrect'}">
                <p><strong>Q${index + 1}:</strong> ${question.question}</p>
                <p class="answer-text">Your answer: ${question.options[userAnswer] || 'Not answered'}</p>
                ${!isCorrect ? `<p class="answer-text">Correct answer: ${question.options[question.correct]}</p>` : ''}
            </div>
        `);
    });
    
    document.getElementById('quizInProgress').style.display = 'none';
    document.getElementById('quizResults').style.display = 'block';
    document.getElementById('finalScore').textContent = `${quizScore}/10`;
    document.getElementById('answersReview').innerHTML = reviewHTML.join('');
    
    let feedback = '';
    if (quizScore >= 9) feedback = '🏆 Outstanding! You\'re a robotics expert!';
    else if (quizScore >= 7) feedback = '🎉 Great job! You know your robotics!';
    else if (quizScore >= 5) feedback = '👍 Good effort! Keep learning!';
    else feedback = '📚 Keep studying! You\'ll improve!';
    
    document.getElementById('quizFeedback').textContent = feedback;
}

function retakeQuiz() {
    document.getElementById('quizResults').style.display = 'none';
    document.getElementById('quizStart').style.display = 'block';
}

// Initialize on Page Load
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a protected page
    const protectedPages = ['profile.html', 'quiz.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        const token = localStorage.getItem('userToken');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
    }
    
    // Load profile if on profile page
    if (currentPage === 'profile.html') {
        loadProfile();
    }
    
    // Add Enter key support for login
    const loginPassword = document.getElementById('loginPassword');
    if (loginPassword) {
        loginPassword.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }
});
