const registerForm = document.getElementById('registerForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const alertMessage = document.getElementById('alertMessage');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        username: usernameInput.value,
        password: passwordInput.value
    };

    try {
        await axios.post('/api/register', payload);

        alertMessage.className = 'alert-message success';
        alertMessage.textContent = "User successfully created!";

        registerForm.reset();

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);

    } catch (error) {
        alertMessage.className = 'alert-message error';

        const data = error.response?.data;

        if (data?.errors) {
            alertMessage.textContent = [].concat(data.errors).join(', ');
        } else if (data?.message) {
            alertMessage.textContent = data.message;
        } else {
            alertMessage.textContent = "An error occurred during registration.";
        }
    }
});