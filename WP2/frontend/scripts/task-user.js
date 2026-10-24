const assignTaskForm = document.getElementById('assignTaskForm');
const userSelect = document.getElementById('userSelect');
const taskSelect = document.getElementById('taskSelect');
const alertMessage = document.getElementById('alertMessage');

function showAlert(type, text) {
    alertMessage.className = `alert-message ${type}`;
    alertMessage.textContent = text;
}

function getErrorText(error, fallback) {
    const data = error.response?.data;
    if (data?.errors) return [].concat(data.errors).join(', ');
    if (data?.message) return data.message;
    return fallback;
}

function fillSelect(select, items, getLabel) {
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item._id;
        option.textContent = getLabel(item);
        select.appendChild(option);
    });
}

async function loadOptions() {
    try {
        const response = await axios.get('/api/task-user');

        const users = response.data.users || [];
        const tasks = response.data.tasks || [];

        fillSelect(userSelect, users, user => user.username);
        fillSelect(taskSelect, tasks, task => task.title);

    } catch (error) {
        if (error.response?.status === 401) {
            window.location.href = 'login.html';
            return;
        }
        showAlert('error', getErrorText(error, 'Failed to load users and tasks.'));
    }
}

assignTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        task_id: taskSelect.value,
        user_id: userSelect.value
    };

    try {
        const response = await axios.post('/api/task-user', payload);

        showAlert('success', response.data.message || 'Task Added to User Successfully!');
        assignTaskForm.reset();

    } catch (error) {
        if (error.response?.status === 401) {
            window.location.href = 'login.html';
            return;
        }
        showAlert('error', getErrorText(error, 'An error occurred while assigning the task.'));
    }
});

loadOptions();