const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const socketIO = require("socket.io");
const http = require("http");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve frontend


mongoose.connect("mongodb+srv://kpkreddy2004:Pappa1970%40@cluster0.gkzf97y.mongodb.net/myDatabase?retryWrites=true&w=majority")
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
  });

// Schemas
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dateTime: { type: String, required: true },
  venue: { type: String },
  createdBy: { type: String } // Save who created it
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const Event = mongoose.model("Event", eventSchema);
const User = mongoose.model("User", userSchema);

// Secret
const SECRET_KEY = "your_secret_key_here";

// Socket.IO - Real-time Event Sync
io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  // Sync events when a client connects
  socket.on("sync", async () => {
    const events = await Event.find();
    socket.emit("syncEvents", events);
  });

  // Broadcast event creation to all clients
  socket.on("eventCreated", async () => {
    const events = await Event.find();
    io.emit("syncEvents", events);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

// Authentication Middleware
function authenticateUser(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: "Access token missing" });
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid access token" });
  }
}

// Routes

// Serve login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Public GET /events - NO authentication needed
app.get("/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Protected POST /events - Authentication needed
app.post("/events", authenticateUser, async (req, res) => {
  try {
    const { title, dateTime, venue } = req.body;
    const username = req.user.username; // From token

    if (!title || !dateTime || !venue) {
      return res.status(400).json({ error: "Title, dateTime, and venue are required" });
    }

    const existingEvent = await Event.findOne({ dateTime });

    if (existingEvent) {
      return res.status(400).json({ 
        error: `Slot already booked by ${existingEvent.createdBy}` 
      });
    }

    const newEvent = new Event({ title, dateTime, venue, createdBy: username });
    await newEvent.save();

    const events = await Event.find();
    io.emit("syncEvents", events);

    res.json({ message: "Event created successfully" });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete Event
app.delete("/events/:id", authenticateUser, async (req, res) => {
  try {
    const eventId = req.params.id;
    await Event.findByIdAndDelete(eventId);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin Create User
app.post("/admin/create-user", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, Email and Password are required" });
    }
    const existingUser = await User.findOne({ username: email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, username: email, password: hashedPassword });
    await newUser.save();
    res.json({ userId: newUser._id });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin Delete User
app.delete("/admin/delete-user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin Change User Password
app.put("/admin/change-password/:id", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// User Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ username: email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id, username: user.username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
