const API_URL = "http://localhost:5000"; // Ensure this is correct

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    try {
        console.log("🔍 Sending login request...");
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        console.log("🔍 Response received:", data);

        if (!response.ok) {
            throw new Error(data.error || "Login failed");
        }

        localStorage.setItem("authToken", data.token); // ✅ Store Token
        window.location.href = "home.html"; // ✅ Redirect to home page
    } catch (error) {
        console.error("❌ Login Error:", error);
        alert(error.message);
    }
});
