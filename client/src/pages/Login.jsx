import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import UpIcon from "../assets/UpIcon.png";
import "../css/Login.css";
import { useNavigate } from "react-router-dom";


export function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [userRole, setUserRole] = useState(""); // track role after login
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!username || !password) return;

        try {
        const res = await fetch("http://localhost:8080/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (data.success) {
            console.log("Login successful", data.user);

            if(data.user.role == "student") {navigate("/studentView");}
        } else {
            setError(data.message || "Invalid credentials");
        }
        } catch (err) {
        setError("Server error");
        }
    };

    // Render login form if no role yet
    return (
        <div className="login-page">
        <div className="overlay" />
        <div className="login-card">
            <div className="login-header">
            <div className="icon-box">
                <img src={UpIcon} alt="Up Icon" className="icon" />
            </div>
            <h1>Adventure Awaits</h1>
            <p>Reach New Heights One Task at a Time</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
                <label htmlFor="username">Username</label>
                <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                </div>
            </div>

            <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                </div>
            </div>

            {error && <p className="error-text">{error}</p>}

            <button type="submit" className="login-button">
                Sign In
            </button>
            </form>

            <p className="footer-text">
            Don't have an account? <a href="/registration">Create one</a>
            </p>
        </div>
        </div>
    );
}