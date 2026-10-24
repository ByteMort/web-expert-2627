const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const alertMessage = document.getElementById('alertMessage');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        username: usernameInput.value,
        password: passwordInput.value
    };

    try {
        const response = await axios.post('/api/login', payload);

        alertMessage.className = 'alert-message success';
        alertMessage.textContent = response.data.message || "Login!";

        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        setTimeout(() => {
            window.location.href = 'task_index.html';
        }, 1500);

    } catch (error) {
        alertMessage.className = 'alert-message error';

        const data = error.response?.data;

        if (data?.errors) {
            alertMessage.textContent = [].concat(data.errors).join(', ');
        } else if (data?.message) {
            alertMessage.textContent = data.message;
        } else {
            alertMessage.textContent = "An error occurred during login.";
        }
    }
});