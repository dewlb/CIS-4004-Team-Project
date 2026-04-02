import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import UpBackground from "../assets/UpBackground.png";
import UpIcon from "../assets/UpIcon.png";
import "../css/Registration.css";

export function Registration() {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleRegistration = async (e) => {
        e.preventDefault();

        alert("Registration successful!");
    };

    return (
        <div
        className="registration-page"
        style={{ backgroundImage: `url(${UpBackground})` }}
        >
        <div className="overlay" />

        <div className="registration-card">
            <div className="registration-header">
            <div className="icon-box">
                <img src={UpIcon} alt="Up Icon" className="icon" />
            </div>
            <h1>Adventure Awaits</h1>
            <p>Reach New Heights One Task at a Time</p>
            </div>

            <form onSubmit={handleRegistration} className="registration-form">
            <div className="input-group">
                <label htmlFor="firstName">First Name</label>
                <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                    id="firstname"
                    type="text"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                />
                </div>
            </div>

            <div className="input-group">
                <label htmlFor="lastName">Last Name</label>
                <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                    id="lastname"
                    type="text"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                />
                </div>
            </div>

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

            <button type="submit" className="registration-button">
                Sign Up
            </button>
            </form>

            <p className="footer-text">
            Already have an account? <Link to="/">Login</Link>
            </p>
        </div>
        </div>
    );
}