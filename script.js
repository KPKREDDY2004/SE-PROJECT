const API_URL = "http://localhost:5000"; // Ensure backend is running on port 5000

// Function to Show Pages Dynamically
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });

    document.getElementById(pageId).style.display = 'block';
}

//  Create User Function
async function createUser() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/admin/create-user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, role: "user" }) 
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to create user.");

        alert("✅ User created successfully!");
        fetchUsers(); // Refresh User List and Update Count
    } catch (error) {
        alert(`❌ ${error.message}`);
    }
}

//  Fetch Users and Display in Table
async function fetchUsers() {
    try {
        const response = await fetch(`${API_URL}/users`);
        if (!response.ok) throw new Error("Failed to fetch users.");
        const users = await response.json();

        // Update total users count in Dashboard
        document.querySelector("#totalUsersCount").textContent = users.length;

        const userList = document.getElementById("userList");
        userList.innerHTML = "";

        users.forEach(user => {
            userList.innerHTML += `
                <tr>
                    <td>${user.email}</td>
                    <td>
                        <select onchange="updateUser('${user._id}', this.value)">
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                            <option value="staff" ${user.role === 'staff' ? 'selected' : ''}>Staff</option>
                            <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                        </select>
                    </td>
                    <td>
                        <button onclick="deleteUser('${user._id}')">❌ Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        alert("❌ Error fetching users.");
    }
}

//  Delete User and Update Count
async function deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
        const response = await fetch(`${API_URL}/users/${userId}`, { method: "DELETE" });

        if (!response.ok) throw new Error("Failed to delete user.");
        alert("✅ User deleted successfully.");
        fetchUsers(); // Refresh user list and update count
    } catch (error) {
        console.error("❌ Error deleting user:", error);
        alert(error.message);
    }
}

//  Initialize Data on Page Load
document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
});
