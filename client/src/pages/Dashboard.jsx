import { useState, useEffect, useRef } from "react";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  // 🔹 Fetch tasks
  const fetchTasks = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/tasks");
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 🔹 Add task
  const addTask = async () => {
    if (input.trim() === "") return;

    try {
      await fetch("http://localhost:8080/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: input,
          completed: false,
        }),
      });

      setInput("");
      inputRef.current.focus();
      fetchTasks();
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  // 🔹 Delete task
  const deleteTask = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/tasks/${id}`, {
        method: "DELETE",
      });

      fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // 🔹 Toggle complete
  const toggleTask = async (task) => {
    try {
      await fetch(`http://localhost:8080/api/tasks/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      fetchTasks();
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f6f8",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "400px",
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
          Dashboard
        </h1>

        {/* Input + Button */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter a task..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTask();
            }}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />

          <button
            onClick={addTask}
            style={{
              padding: "10px 15px",
              border: "none",
              borderRadius: "8px",
              background: "#4CAF50",
              color: "white",
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </div>

        {/* Task List */}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {tasks.map((task) => (
            <li
              key={task._id}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px",
                borderBottom: "1px solid #eee",
              }}
            >
              <input
                type="checkbox"
                checked={task.completed || false}
                onChange={() => toggleTask(task)}
              />

              <span
                style={{
                  marginLeft: "10px",
                  flex: 1,
                  textDecoration: task.completed ? "line-through" : "none",
                  color: task.completed ? "#999" : "#000",
                }}
              >
                {task.task || task.title}
              </span>

              <button
                onClick={() => deleteTask(task._id)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "red",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;