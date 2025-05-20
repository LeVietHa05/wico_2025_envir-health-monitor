const firebaseConfig = {
    apiKey: "AIzaSyBBaBiBrEeJnmcZiDeoAar3IaahZQK0u6Q",
    authDomain: "wico-2025-envir-health-monitor.firebaseapp.com",
    projectId: "wico-2025-envir-health-monitor",
    storageBucket: "wico-2025-envir-health-monitor.firebasestorage.app",
    messagingSenderId: "488672167826",
    appId: "1:488672167826:web:df2fcedc990e11c714e34b",
    measurementId: "G-P9YLLB6VP8"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(app);


const token = localStorage.getItem('token') || '';

// Hiển thị nút đăng xuất nếu đã đăng nhập
if (token) {
    document.getElementById('logoutBtn').style.display = 'block';
    document.querySelector('a[href="/auth.html"]').style.display = 'none';
}

// Đăng ký sự kiện cho các nút
document.getElementById('registerBtn')?.addEventListener('click', register);
document.getElementById('loginBtn')?.addEventListener('click', login);
document.getElementById('assignSensorBtn')?.addEventListener('click', assignSensor);
document.getElementById('forgotPasswordBtn')?.addEventListener('click', forgotPassword);
document.getElementById('logoutBtn')?.addEventListener('click', logout);

async function register() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    console.log('Attempting to register with email:', email);
    try {
        await auth.createUserWithEmailAndPassword(email, password);
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        showModal(data.message);
    } catch (err) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Error during registration:", errorCode, errorMessage);

        // Ví dụ: Hiển thị thông báo lỗi thân thiện với người dùng
        if (errorCode === 'auth/invalid-email') {
            alert('Địa chỉ email không hợp lệ.');
        } else if (errorCode === 'auth/email-already-in-use') {
            alert('Email này đã được đăng ký.');
        } else if (errorCode === 'auth/weak-password') {
            alert('Mật khẩu quá yếu. Vui lòng sử dụng ít nhất 6 ký tự.');
        } else {
            showModal('Đăng nhập thất bại');
        }
    }
}

async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    console.log('Attempting to login with email:', email);
    try {
        await auth.signInWithEmailAndPassword(email, password);
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            showModal('Đăng nhập thành công');
            window.location.href = '/';
        } else {
            showModal(data.message);
        }
    } catch (err) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Error during login:", errorCode, errorMessage);

        if (errorCode === 'auth/user-not-found') {
            showModal('Sai thông tin đăng nhập');
        } else if (errorCode === 'auth/wrong-password') {
            showModal('Sai thông tin đăng nhập');
        } else if (errorCode === 'auth/user-disabled') {
            showModal('Tài khoản của bạn đã bị vô hiệu hóa.');
        } else if (errorCode === 'auth/too-many-requests') {
            showModal('Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau.');
        } else {
            showModal('Đăng nhập thất bại');
        }
    }
}

async function assignSensor() {
    const token = localStorage.getItem('token') || '';
    if (!token) {
        showModal('Bạn cần đăng nhập để thực hiện hành động này');
        return;
    }
    const sensorId = document.getElementById('sensor-id').value;
    console.log('Assigning sensor ID:', sensorId);
    try {
        const response = await fetch('/api/auth/assign-sensor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ sensorId }),
        });
        const data = await response.json();
        showModal(data.message);
        window.location.reload();
    } catch (err) {
        console.error('Assign sensor error:', err);
        showModal('Gán sensor thất bại: ' + err.message);
    }
}

async function forgotPassword() {
    const email = document.getElementById('forgot-email').value;
    console.log('Sending password reset for email:', email);
    try {
        await auth.sendPasswordResetEmail(email);
        showModal('Email reset mật khẩu đã được gửi');
    } catch (err) {
        console.error('Password reset error:', err);
        showModal('Gửi email reset thất bại: ' + err.message);
    }
}

async function logout() {
    const token = localStorage.getItem('token') || '';
    if (!token) {
        showModal('Bạn cần đăng nhập để thực hiện hành động này');
        return;
    }
    try {
        // Đăng xuất khỏi Firebase
        await auth.signOut();
        // Gọi API logout
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = await response.json();
        if (response.ok) {
            // Xóa token khỏi localStorage
            localStorage.removeItem('token');
            showModal(data.message);
            // Chuyển hướng về trang chủ
            window.location.href = '/';
        } else {
            console.error('Logout error:', data);
            showModal(data.message);
        }
    } catch (err) {
        console.error('Logout error:', err);
        showModal('Đăng xuất thất bại: ' + err.message);
    }
}
