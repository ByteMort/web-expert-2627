const userTableBody = document.getElementById('userTableBody');

function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value ?? '';
    return div.innerHTML;
}

function showMessage(text) {
    userTableBody.innerHTML = '';
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 3;
    td.textContent = text;
    tr.appendChild(td);
    userTableBody.appendChild(tr);
}

async function loadUsers() {
    try {
        const response = await axios.get('/api/users');
        const users = response.data.users || [];

        if (users.length === 0) {
            showMessage('No users found.');
            return;
        }

        userTableBody.innerHTML = users.map(user => `
            <tr>
                <td>${escapeHtml(user._id)}</td>
                <td>${escapeHtml(user.username)}</td>
                <td>${escapeHtml([].concat(user.role).join(', '))}</td>
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
            showMessage('An error occurred while loading users.');
        }
    }
}

loadUsers();