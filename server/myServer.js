require("dotenv").config();
const express = require('express');
const cors = require("cors");

const app = express();
const PORT = 8080;

const connectDB = require("./config/db");

// middleware //
app.use(cors());
app.use(express.json());

// connect DB //
connectDB();

// routes //
const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);

const taskRoutes = require("./routes/tasks");
app.use("/api/tasks", taskRoutes);

const classRoutes = require("./routes/classes");
app.use("/api/classes", classRoutes);

// test route //
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});