const taskTableBody = document.getElementById('taskTableBody');

function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value ?? '';
    return div.innerHTML;
}

function showMessage(text) {
    taskTableBody.innerHTML = '';
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 3;
    td.textContent = text;
    tr.appendChild(td);
    taskTableBody.appendChild(tr);
}

async function loadTasks() {
    try {
        const response = await axios.get('/api/tasks');
        const tasks = response.data.tasks || [];

        if (tasks.length === 0) {
            showMessage('No tasks found.');
            return;
        }

        taskTableBody.innerHTML = tasks.map(task => `
            <tr>
                <td>${escapeHtml(task._id)}</td>
                <td>${escapeHtml(task.title)}</td>
                <td>${task.completed ? '✅ Yes' : '❌ No'}</td>
            </tr>
        `).join('');

    } catch (error) {
        if (error.response?.status === 401) {
            window.location.href = 'login.html';
            return;
        }

        const data = error.response?.data;
        if (data?.errors) {
            showMessage([].concat(data.errors).join(', '));
        } else {
            showMessage('An error occurred while loading tasks.');
        }
    }
}

loadTasks();