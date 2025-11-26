const API_URL = 'https://backnode-50az.onrender.com';

// Initialize Lucide icons
lucide.createIcons();

function showPage(page) {
    document.getElementById('homePage').classList.add('hidden');
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('signupPage').classList.add('hidden');
    
    document.getElementById(page + 'Page').classList.remove('hidden');
    
    // Reinitialize icons for the new page
    setTimeout(() => lucide.createIcons(), 0);
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    const icon = document.getElementById('menuIcon');
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
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
}

function clearMessage(elementId) {
    document.getElementById(elementId).innerHTML = '';
}

function handleLoginEnter(event) {
    if (event.key === 'Enter') {
        handleLogin();
    }
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');
    
    clearMessage('loginMessage');
    btn.textContent = 'Logging in...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/api/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('loginMessage', 'Login successful! Welcome back.', 'success');
            // Store token in memory instead of localStorage
            window.userToken = data.token;
            setTimeout(() => showPage('home'), 2000);
        } else {
            showMessage('loginMessage', data.message || 'Login failed. Please check your credentials.', 'error');
        }
    } catch (error) {
        showMessage('loginMessage', 'Connection error. Please try again.', 'error');
    } finally {
        btn.textContent = 'Log In';
        btn.disabled = false;
    }
}

async function handleRegister() {
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    // Check if passwords match
    if (password !== confirmPassword) {
        showMessage('signupMessage', 'Passwords do not match!', 'error');
        return;
    }
    
    const formData = {
        name: document.getElementById('signupName').value,
        email: document.getElementById('signupEmail').value,
        password: password,
        phone: document.getElementById('signupPhone').value,
        address: {
            street: document.getElementById('signupStreet').value,
            city: document.getElementById('signupCity').value,
            zipCode: document.getElementById('signupZip').value,
            country: document.getElementById('signupCountry').value
        }
    };
    
    const btn = document.getElementById('signupBtn');
    clearMessage('signupMessage');
    btn.textContent = 'Creating Account...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/api/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('signupMessage', 'Registration successful! Redirecting to login...', 'success');
            setTimeout(() => showPage('login'), 2000);
        } else {
            showMessage('signupMessage', data.message || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        showMessage('signupMessage', 'Connection error. Please try again.', 'error');
    } finally {
        btn.textContent = 'Sign Up';
        btn.disabled = false;
    }
}