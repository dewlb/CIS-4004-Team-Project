import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import UpIcon from "../assets/UpIcon.png";
import "../css/Login.css";

export function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) return

        console.log("Login successful", data);
        navigate("/dashboard");
    };

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
                    type="username"
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