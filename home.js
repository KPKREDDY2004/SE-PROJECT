const socket = io();
const token = localStorage.getItem("authToken");

if (!token) {
    window.location.href = "/login.html"; // Redirect if no token
}

const API_URL = "http://localhost:5000"; // Your backend URL

function formatDateTime(dateTime) {
    const options = { 
        year: 'numeric', month: 'short', day: 'numeric', 
        hour: '2-digit', minute: '2-digit'
    };
    return new Date(dateTime).toLocaleDateString(undefined, options);
}

function getUsernameFromToken() {
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.username;
}

const currentUser = getUsernameFromToken();

// Fetch and display only YOUR events
async function displayEvents() {
    try {
        const response = await fetch("/events", { method: "GET" });

        const events = await response.json();
        const calendar = document.getElementById("eventList");
        calendar.innerHTML = "";

        if (events.length === 0) {
            calendar.innerHTML = "<p>No Events Scheduled</p>";
        } else {
            const yourEvents = events.filter(event => event.createdBy === currentUser);

            if (yourEvents.length === 0) {
                calendar.innerHTML = "<p>You have no events.</p>";
            } else {
                yourEvents.forEach(event => {
                    const listItem = document.createElement("li");
                    listItem.innerHTML = `
                        <strong>${event.title}</strong> - ${formatDateTime(event.dateTime)}<br>
                        <em>Venue:</em> ${event.venue || "N/A"}<br>
                        <em>Created by:</em> ${event.createdBy || "N/A"}
                        <button onclick="deleteEvent('${event._id}')">Delete</button>
                    `;
                    calendar.appendChild(listItem);
                });
            }
        }
    } catch (error) {
        console.error("Error fetching events:", error);
    }
}

// Create Event
document.getElementById("eventForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const eventTitle = document.getElementById("eventTitle").value.trim();
    const eventDateTime = document.getElementById("eventDateTime").value.trim();
    const eventVenue = document.getElementById("eventVenue").value.trim();

    if (!eventTitle || !eventDateTime || !eventVenue) {
        alert("⚠️ Please fill all fields!");
        return;
    }

    try {
        const response = await fetch("/events", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ 
                title: eventTitle, 
                dateTime: eventDateTime, 
                venue: eventVenue 
            }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("✅ Event created successfully!");
            socket.emit("sync");
            document.getElementById("eventForm").reset();
        } else {
            alert(`❌ ${data.error}`); // The error message will now include the name of the person who booked the slot
        }
    } catch (error) {
        console.error("Error creating event:", error);
        alert("❌ Failed to create event.");
    }
});

// Delete Event
async function deleteEvent(eventId) {
    try {
        const response = await fetch(`/events/${eventId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
            alert("✅ Event deleted successfully!");
            socket.emit("sync");
        } else {
            throw new Error(data.error || "Failed to delete event");
        }
    } catch (error) {
        console.error(error);
        alert("❌ Failed to delete event.");
    }
}

// Socket.IO Sync
socket.on("syncEvents", () => {
    displayEvents();
});

// Initial load
displayEvents();

// ✅ Correct logout
document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login.html";
});
