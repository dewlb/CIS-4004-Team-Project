import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users, LogOut, Clock, Award,CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { HouseWithBalloons } from "../components/HouseWithBalloons"; // The Up house component

// Mock Data
const initialClasses = [
    { id: "1", name: "Mobile Development", tasks: [{ id: "t1", title: "Build React Native app", completed: false }] },
    { id: "2", name: "Web Development", tasks: [{ id: "t2", title: "Setup React Router", completed: true }] },
    ];
    const initialGroups = [
    { id: "g1", name: "Team Alpha", tasks: [{ id: "gt1", title: "Project proposal", completed: false }] },
];

const availableBadges = [{ id: "b1", name: "Rising Star", tasksRequired: 1, icon: "🌟", description: "Complete 1 task!" }];

export function StudentDashboard() {
    const navigate = useNavigate();
    const [classes, setClasses] = useState(initialClasses);
    const [groups, setGroups] = useState(initialGroups);
    const [weeklyCompletedTasks, setWeeklyCompletedTasks] = useState(0);
    const [earnedBadges, setEarnedBadges] = useState([]);

  // Increment task / balloon
    const incrementBalloonCount = () => {
        const newCount = weeklyCompletedTasks + 1;
        setWeeklyCompletedTasks(newCount);
        const nextBadge = availableBadges.find(b => newCount >= b.tasksRequired && !earnedBadges.some(eb => eb.id === b.id));
        if (nextBadge) {
        const updatedBadges = [...earnedBadges, nextBadge];
        setEarnedBadges(updatedBadges);
        toast.success(`🎉 Badge Earned: ${nextBadge.icon} ${nextBadge.name}!`);
        }
    };

    const toggleTask = (listType, itemId, taskId) => {
        if (listType === "class") {
        setClasses(classes.map(cls => {
            if (cls.id === itemId) {
            return {
                ...cls,
                tasks: cls.tasks.map(t => {
                if (t.id === taskId) {
                    if (!t.completed) incrementBalloonCount();
                    return { ...t, completed: !t.completed };
                }
                return t;
                }),
            };
            }
            return cls;
        }));
        } else {
        setGroups(groups.map(grp => {
            if (grp.id === itemId) {
            return {
                ...grp,
                tasks: grp.tasks.map(t => {
                if (t.id === taskId) {
                    if (!t.completed) incrementBalloonCount();
                    return { ...t, completed: !t.completed };
                }
                return t;
                }),
            };
            }
            return grp;
        }));
        }
    };

    const handleLogout = () => {
        window.location.href = "/"; // redirect back to login
    };

    return (
        <div style={{ minHeight: "100vh", fontFamily: "sans-serif", background: "linear-gradient(to bottom, #f0f4f8, #d9e2ec)" }}>
        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", padding: "1rem 2rem", background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <BookOpen />
            <div>
                <h1>TaskMaster</h1>
                <small>Student Dashboard</small>
            </div>
            </div>
            <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <LogOut /> Logout
            </button>
        </header>

        {/* Main Content */}
        <main style={{ padding: "2rem" }}>
            {/* House + Balloons */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
            <HouseWithBalloons balloonCount={weeklyCompletedTasks} />
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            <div style={{ padding: "1rem", background: "#fff", borderRadius: "0.5rem", textAlign: "center" }}>
                <p>Total Classes</p>
                <h2>{classes.length}</h2>
            </div>
            <div style={{ padding: "1rem", background: "#fff", borderRadius: "0.5rem", textAlign: "center" }}>
                <p>Groups</p>
                <h2>{groups.length}</h2>
            </div>
            <div style={{ padding: "1rem", background: "#fff", borderRadius: "0.5rem", textAlign: "center" }}>
                <p>Total Tasks</p>
                <h2>{classes.reduce((acc, cls) => acc + cls.tasks.length, 0) + groups.reduce((acc, g) => acc + g.tasks.length, 0)}</h2>
            </div>
            <div style={{ padding: "1rem", background: "#fff", borderRadius: "0.5rem", textAlign: "center" }}>
                <p>Completed</p>
                <h2>{classes.reduce((acc, cls) => acc + cls.tasks.filter(t => t.completed).length, 0) +
                    groups.reduce((acc, g) => acc + g.tasks.filter(t => t.completed).length, 0)}</h2>
            </div>
            </div>

            {/* Tasks */}
            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            {classes.map(cls => (
                <div key={cls.id} style={{ flex: 1, minWidth: "200px", background: "#fff", borderRadius: "0.5rem", padding: "1rem" }}>
                <h3>{cls.name}</h3>
                <ul>
                    {cls.tasks.map(task => (
                    <li key={task.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <span>{task.title}</span>
                        <Checkbox checked={task.completed} onClick={() => toggleTask("class", cls.id, task.id)} />
                    </li>
                    ))}
                </ul>
                </div>
            ))}
            {groups.map(grp => (
                <div key={grp.id} style={{ flex: 1, minWidth: "200px", background: "#fff", borderRadius: "0.5rem", padding: "1rem" }}>
                <h3>{grp.name}</h3>
                <ul>
                    {grp.tasks.map(task => (
                    <li key={task.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <span>{task.title}</span>
                        <Checkbox checked={task.completed} onClick={() => toggleTask("group", grp.id, task.id)} />
                    </li>
                    ))}
                </ul>
                </div>
            ))}
            </div>
        </main>
        </div>
    );
}