const API_URL = 'https://backnode-50az.onrender.com';
let currentUser = null;
let userToken = null;
let isEditMode = false;

// Quiz data
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

// Mock products data
const mockProducts = [
    {
        name: "Line Following Robot Kit",
        description: "Complete kit for building a line-following robot with sensors",
        price: 89.99,
        stock: 15,
        category: "Électronique"
    },
    {
        name: "Arduino Starter Robot",
        description: "Perfect for beginners, includes Arduino Uno and basic components",
        price: 64.99,
        stock: 23,
        category: "Électronique"
    },
    {
        name: "Obstacle Avoidance Robot",
        description: "Autonomous robot with ultrasonic sensors",
        price: 119.99,
        stock: 8,
        category: "Électronique"
    },
    {
        name: "Robotic Arm Kit",
        description: "4-DOF robotic arm with servo motors",
        price: 149.99,
        stock: 5,
        category: "Électronique"
    },
    {
        name: "Bluetooth Controlled Car",
        description: "Control your robot car via smartphone",
        price: 79.99,
        stock: 12,
        category: "Électronique"
    },
    {
        name: "Humanoid Robot Kit",
        description: "Advanced bipedal robot with multiple servos",
        price: 299.99,
        stock: 3,
        category: "Électronique"
    },
    {
        name: "Drone Building Kit",
        description: "Build and program your own quadcopter",
        price: 199.99,
        stock: 0,
        category: "Électronique"
    },
    {
        name: "Robot Gripper Module",
        description: "Add-on gripper for picking and placing objects",
        price: 45.99,
        stock: 18,
        category: "Accessoire"
    },
    {
        name: "Sensor Pack Pro",
        description: "Collection of 15+ sensors for robotics projects",
        price: 54.99,
        stock: 20,
        category: "Accessoire"
    }
];

// Initialize Lucide icons and check auth status
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    
    // Check if user is logged in and load user data
    initializeUserData();
});

function initializeUserData() {
    const token = localStorage.getItem('userToken');
    const user = localStorage.getItem('currentUser');
    
    console.log('Initializing user data...');
    console.log('Token from localStorage:', token ? 'Present' : 'Missing');
    console.log('User from localStorage:', user);
    
    if (token && user) {
        userToken = token;
        try {
            currentUser = JSON.parse(user);
            console.log('Current user data:', currentUser);
            
            // Update UI with user data immediately
            updateUserUI();
            
            // If on profile page, load profile data
            if (window.location.pathname.includes('profile.html')) {
                loadProfileData();
            }
            
            // Load products if on dashboard
            if (window.location.pathname.includes('dashboard.html')) {
                loadProducts();
                updateDashboardData();
            }
            
            // Redirect to dashboard if on login/signup pages and logged in
            if (window.location.pathname.includes('index.html') && !window.location.hash.includes('login') && !window.location.hash.includes('signup')) {
                window.location.href = 'dashboard.html';
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            handleLogout();
        }
    } else if (window.location.pathname.includes('dashboard.html') || 
               window.location.pathname.includes('profile.html')) {
        // Redirect to home if not authenticated
        console.log('No user found, redirecting to index');
        window.location.href = 'index.html';
    }
}

function updateUserUI() {
    if (!currentUser) {
        console.log('No current user to update UI');
        return;
    }
    
    console.log('Updating UI with user data:', currentUser);
    
    // Update user name in dashboard and profile
    const userNameElements = document.querySelectorAll('#userName');
    userNameElements.forEach(element => {
        if (element) {
            element.textContent = currentUser.name || currentUser.email?.split('@')[0] || 'Member';
        }
    });
    
    // Update member since year in dashboard
    if (document.getElementById('memberSince')) {
        document.getElementById('memberSince').textContent = new Date().getFullYear();
    }
}

function updateDashboardData() {
    if (!currentUser) return;
    
    // Update quiz score if available
    const quizScore = localStorage.getItem('quizScore');
    if (quizScore && document.getElementById('dashboardQuizScore')) {
        document.getElementById('dashboardQuizScore').textContent = `${quizScore}/10`;
    }
}

// Load and display profile data
function loadProfileData() {
    console.log('Loading profile data for display...');
    
    if (!currentUser) {
        console.log('No current user found for profile');
        // Try to get from localStorage directly
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        } else {
            console.log('No user data in localStorage');
            return;
        }
    }
    
    console.log('Displaying profile for user:', currentUser);
    displayProfileData(currentUser);
}

function displayProfileData(user) {
    console.log('Displaying profile data:', user);
    
    if (!user) {
        console.log('No user data to display');
        return;
    }
    
    // Personal Information
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profilePhone = document.getElementById('profilePhone');
    const profileJoined = document.getElementById('profileJoined');
    
    if (profileName) profileName.textContent = user.name || '-';
    if (profileEmail) profileEmail.textContent = user.email || '-';
    if (profilePhone) profilePhone.textContent = user.phone || '-';
    if (profileJoined) {
        const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
        profileJoined.textContent = joinDate;
    }
    
    // Address Information
    const profileStreet = document.getElementById('profileStreet');
    const profileCity = document.getElementById('profileCity');
    const profileZip = document.getElementById('profileZip');
    const profileCountry = document.getElementById('profileCountry');
    
    // Handle address data - check both nested and flat structure
    let addressData = {};
    
    if (user.address && typeof user.address === 'object') {
        // Address is nested in address object
        addressData = user.address;
    } else {
        // Address might be at the root level
        addressData = {
            street: user.street,
            city: user.city,
            zipCode: user.zipCode,
            country: user.country
        };
    }
    
    if (profileStreet) profileStreet.textContent = addressData.street || '-';
    if (profileCity) profileCity.textContent = addressData.city || '-';
    if (profileZip) profileZip.textContent = addressData.zipCode || '-';
    if (profileCountry) profileCountry.textContent = addressData.country || '-';
}

// Enhanced login function with better data handling
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');
    
    if (!email || !password) {
        showMessage('loginMessage', 'Please enter both email and password', 'error');
        return;
    }
    
    clearMessage('loginMessage');
    btn.textContent = 'Logging in...';
    btn.disabled = true;

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
            showMessage('loginMessage', 'Login successful! Redirecting...', 'success');
            userToken = data.token;
            
            // Store complete user data - handle different response structures
            currentUser = {
                id: data.user?.id || data.id,
                name: data.user?.name || data.name || email.split('@')[0],
                email: data.user?.email || data.email || email,
                phone: data.user?.phone || data.phone,
                address: data.user?.address || data.address,
                createdAt: data.user?.createdAt || data.createdAt,
                // Include all data from response
                ...data.user,
                ...data
            };
            
            // Clean up the user object
            delete currentUser.token;
            delete currentUser.password;
            
            console.log('Processed user data for storage:', currentUser);
            
            localStorage.setItem('userToken', userToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Update UI immediately
            updateUserUI();
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showMessage('loginMessage', data.message || 'Login failed. Please check your credentials.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('loginMessage', 'Connection error. Please try again.', 'error');
    } finally {
        btn.textContent = 'Log In';
        btn.disabled = false;
    }
}

// Enhanced registration function
async function handleRegister() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    if (!name || !email || !password) {
        showMessage('signupMessage', 'Please fill in all required fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('signupMessage', 'Passwords do not match!', 'error');
        return;
    }
    
    const formData = {
        name: name,
        email: email,
        password: password,
        phone: document.getElementById('signupPhone').value || '',
        address: {
            street: document.getElementById('signupStreet').value || '',
            city: document.getElementById('signupCity').value || '',
            zipCode: document.getElementById('signupZip').value || '',
            country: document.getElementById('signupCountry').value || ''
        }
    };
    
    const btn = document.getElementById('signupBtn');
    clearMessage('signupMessage');
    btn.textContent = 'Creating Account...';
    btn.disabled = true;

    try {
        console.log('Attempting registration with:', { name, email });
        
        const response = await fetch(`${API_URL}/api/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Registration API response:', data);

        if (response.ok) {
            showMessage('signupMessage', 'Registration successful! You can now log in.', 'success');
            
            // Store user data if available
            if (data.user || data.id) {
                currentUser = {
                    id: data.user?.id || data.id,
                    name: data.user?.name || data.name || name,
                    email: data.user?.email || data.email || email,
                    phone: data.user?.phone || data.phone || formData.phone,
                    address: data.user?.address || data.address || formData.address,
                    createdAt: data.user?.createdAt || data.createdAt,
                    ...data.user,
                    ...data
                };
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
            
            // Redirect to login after delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            showMessage('signupMessage', data.message || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('signupMessage', 'Connection error. Please try again.', 'error');
    } finally {
        btn.textContent = 'Sign Up';
        btn.disabled = false;
    }
}

function toggleMenu() {
    const menu = document.querySelector('.mobile-menu.active, #mobileMenu, #mobileMenu2, #mobileMenu3');
    if (!menu) return;
    
    const icon = menu.previousElementSibling.querySelector('[data-lucide]');
    menu.classList.toggle('active');
    
    if (menu.classList.contains('active')) {
        icon.setAttribute('data-lucide', 'x');
    } else {
        icon.setAttribute('data-lucide', 'menu');
    }
    lucide.createIcons();
}

function showMessage(elementId, text, type) {
    const messageDiv = document.getElementById(elementId);
    if (messageDiv) {
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;
        setTimeout(() => {
            messageDiv.innerHTML = '';
        }, 5000);
    }
}

function clearMessage(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '';
    }
}

function handleLoginEnter(event) {
    if (event.key === 'Enter') {
        handleLogin();
    }
}

function handleLogout() {
    userToken = null;
    currentUser = null;
    localStorage.removeItem('userToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('quizScore');
    window.location.href = 'index.html';
}

function loadProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    mockProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">
                <i data-lucide="cpu"></i>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-footer">
                    <div class="product-price">$${product.price}</div>
                    <div class="product-stock ${product.stock === 0 ? 'out-of-stock' : ''}">
                        ${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
    
    setTimeout(() => lucide.createIcons(), 0);
}

function toggleEditMode() {
    isEditMode = !isEditMode;
    const profileInfo = document.getElementById('profileInfo');
    const addressInfo = document.getElementById('addressInfo');
    
    if (isEditMode) {
        profileInfo.classList.add('edit-mode');
        addressInfo.classList.add('edit-mode');
        
        // Convert text to input fields with current values
        const name = document.getElementById('profileName').textContent;
        const email = document.getElementById('profileEmail').textContent;
        const phone = document.getElementById('profilePhone').textContent;
        const street = document.getElementById('profileStreet').textContent;
        const city = document.getElementById('profileCity').textContent;
        const zip = document.getElementById('profileZip').textContent;
        const country = document.getElementById('profileCountry').textContent;
        
        document.getElementById('profileName').innerHTML = `<input type="text" value="${name === '-' ? '' : name}" class="form-input" id="editProfileName">`;
        document.getElementById('profileEmail').innerHTML = `<input type="email" value="${email === '-' ? '' : email}" class="form-input" id="editProfileEmail">`;
        document.getElementById('profilePhone').innerHTML = `<input type="tel" value="${phone === '-' ? '' : phone}" class="form-input" id="editProfilePhone">`;
        document.getElementById('profileStreet').innerHTML = `<input type="text" value="${street === '-' ? '' : street}" class="form-input" id="editProfileStreet">`;
        document.getElementById('profileCity').innerHTML = `<input type="text" value="${city === '-' ? '' : city}" class="form-input" id="editProfileCity">`;
        document.getElementById('profileZip').innerHTML = `<input type="text" value="${zip === '-' ? '' : zip}" class="form-input" id="editProfileZip">`;
        document.getElementById('profileCountry').innerHTML = `<input type="text" value="${country === '-' ? '' : country}" class="form-input" id="editProfileCountry">`;
        
        const editBtn = document.querySelector('#profilePage .btn-primary');
        if (editBtn) {
            editBtn.textContent = 'Save Changes';
            editBtn.onclick = saveProfileChanges;
        }
    } else {
        // Cancel edit mode without saving
        profileInfo.classList.remove('edit-mode');
        addressInfo.classList.remove('edit-mode');
        displayProfileData(currentUser);
        
        const editBtn = document.querySelector('#profilePage .btn-primary');
        if (editBtn) {
            editBtn.textContent = 'Edit Profile';
            editBtn.onclick = toggleEditMode;
        }
    }
}

// Save profile changes
async function saveProfileChanges() {
    if (!currentUser || !userToken) {
        showMessage('profileMessage', 'You must be logged in to update your profile.', 'error');
        return;
    }
    
    const updatedData = {
        name: document.getElementById('editProfileName')?.value || currentUser.name,
        email: document.getElementById('editProfileEmail')?.value || currentUser.email,
        phone: document.getElementById('editProfilePhone')?.value || currentUser.phone,
        address: {
            street: document.getElementById('editProfileStreet')?.value || currentUser.address?.street,
            city: document.getElementById('editProfileCity')?.value || currentUser.address?.city,
            zipCode: document.getElementById('editProfileZip')?.value || currentUser.address?.zipCode,
            country: document.getElementById('editProfileCountry')?.value || currentUser.address?.country
        }
    };
    
    try {
        showMessage('profileMessage', 'Updating profile...', 'success');
        
        const response = await fetch(`${API_URL}/api/users/${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        if (response.ok) {
            const updatedUser = await response.json();
            currentUser = { ...currentUser, ...updatedUser };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showMessage('profileMessage', 'Profile updated successfully!', 'success');
            
            // Exit edit mode
            isEditMode = false;
            const profileInfo = document.getElementById('profileInfo');
            const addressInfo = document.getElementById('addressInfo');
            profileInfo.classList.remove('edit-mode');
            addressInfo.classList.remove('edit-mode');
            
            // Reload profile data
            displayProfileData(currentUser);
            
            const editBtn = document.querySelector('#profilePage .btn-primary');
            if (editBtn) {
                editBtn.textContent = 'Edit Profile';
                editBtn.onclick = toggleEditMode;
            }
        } else {
            const errorData = await response.json();
            showMessage('profileMessage', errorData.message || 'Failed to update profile. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showMessage('profileMessage', 'Connection error. Please try again.', 'error');
    }
}

function changePassword() {
    const current = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    
    if (!current || !newPass) {
        showMessage('passwordMessage', 'Please fill in both fields', 'error');
        return;
    }
    
    // In a real app, you would make an API call to change the password
    // For now, we'll just show a success message
    showMessage('passwordMessage', 'Password updated successfully!', 'success');
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
}

// For the home page navigation
function showAuth(page) {
    document.getElementById('homePage').classList.add('hidden');
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('signupPage').classList.add('hidden');
    
    if (page === 'home') {
        document.getElementById('homePage').classList.remove('hidden');
        window.scrollTo(0, 0);
    } else {
        document.getElementById(page + 'Page').classList.remove('hidden');
    }
    
    setTimeout(() => lucide.createIcons(), 0);
}

function showDashboardTab(tab) {
    document.getElementById('overviewTab').classList.add('hidden');
    document.getElementById('productsTab').classList.add('hidden');
    document.getElementById('quizTab').classList.add('hidden');
    
    document.getElementById(tab + 'Tab').classList.remove('hidden');
    
    if (tab === 'products') {
        loadProducts();
    }
    
    setTimeout(() => lucide.createIcons(), 0);
}

// Quiz functions
function startQuiz() {
    currentQuestionIndex = 0;
    userAnswers = [];
    quizScore = 0;
    
    document.getElementById('quizStart').classList.add('hidden');
    document.getElementById('quizInProgress').classList.remove('hidden');
    
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
    
    document.getElementById('quizInProgress').classList.add('hidden');
    document.getElementById('quizResults').classList.remove('hidden');
    document.getElementById('finalScore').textContent = `${quizScore}/10`;
    
    // Store quiz score
    localStorage.setItem('quizScore', quizScore);
    
    if (document.getElementById('dashboardQuizScore')) {
        document.getElementById('dashboardQuizScore').textContent = `${quizScore}/10`;
    }
    
    document.getElementById('answersReview').innerHTML = reviewHTML.join('');
    
    let feedback = '';
    if (quizScore >= 9) feedback = '🏆 Outstanding! You\'re a robotics expert!';
    else if (quizScore >= 7) feedback = '🎉 Great job! You know your robotics!';
    else if (quizScore >= 5) feedback = '👍 Good effort! Keep learning!';
    else feedback = '📚 Keep studying! You\'ll improve!';
    
    document.getElementById('quizFeedback').textContent = feedback;
}

function retakeQuiz() {
    document.getElementById('quizResults').classList.add('hidden');
    document.getElementById('quizStart').classList.remove('hidden');
}

// Additional functions for profile page
function exportUserData() {
    if (!currentUser) return;
    
    const dataStr = JSON.stringify(currentUser, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `robo-club-profile-${currentUser.name || 'user'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showMessage('profileMessage', 'Your data has been exported!', 'success');
}

// Complete delete account functionality
async function deleteAccount() {
    if (!currentUser || !userToken) {
        showMessage('profileMessage', 'You must be logged in to delete your account.', 'error');
        return;
    }
    
    if (!confirm('⚠️ ARE YOU SURE YOU WANT TO DELETE YOUR ACCOUNT?\n\nThis action is PERMANENT and cannot be undone. All your data will be lost.')) {
        return;
    }
    
    // Ask for confirmation with password
    const password = prompt('Please enter your password to confirm account deletion:');
    if (!password) {
        showMessage('profileMessage', 'Account deletion cancelled.', 'error');
        return;
    }
    
    try {
        showMessage('profileMessage', 'Deleting your account...', 'success');
        
        // First verify the password
        const verifyResponse = await fetch(`${API_URL}/api/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email: currentUser.email, 
                password: password 
            })
        });
        
        if (!verifyResponse.ok) {
            showMessage('profileMessage', 'Incorrect password. Account deletion cancelled.', 'error');
            return;
        }
        
        // If password is correct, delete the account
        const deleteResponse = await fetch(`${API_URL}/api/users/${currentUser.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (deleteResponse.ok) {
            showMessage('profileMessage', 'Account successfully deleted. Redirecting to home page...', 'success');
            
            // Clear local storage and redirect
            setTimeout(() => {
                userToken = null;
                currentUser = null;
                localStorage.removeItem('userToken');
                localStorage.removeItem('currentUser');
                localStorage.removeItem('quizScore');
                window.location.href = 'index.html';
            }, 2000);
            
        } else {
            const errorData = await deleteResponse.json();
            showMessage('profileMessage', errorData.message || 'Failed to delete account. Please try again.', 'error');
        }
        
    } catch (error) {
        console.error('Error deleting account:', error);
        showMessage('profileMessage', 'Connection error. Please try again.', 'error');
    }
}