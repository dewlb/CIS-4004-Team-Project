import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users, LogOut, Clock, Award, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { HouseWithBalloons } from "../components/HouseWithBalloons";
import api from "../utils/api";
import "../css/studentView.css";

const availableBadges = [
    { id: "b1", name: "Assistance", tasksRequired: 1, icon: "🤝", color: "#FFD700", description: "Helped complete your first task!" },
    { id: "b2", name: "Exploration", tasksRequired: 3, icon: "🧭", color: "#FF6B35", description: "Explored and completed 3 tasks!" },
    { id: "b3", name: "Perseverance", tasksRequired: 5, icon: "⛰️", color: "#4ECDC4", description: "Persevered through 5 tasks!" },
    { id: "b4", name: "Adventure", tasksRequired: 7, icon: "🎈", color: "#95E1D3", description: "Adventured through 7 tasks!" },
    { id: "b5", name: "Ellie Badge", tasksRequired: 10, icon: "🏆", color: "#C44536", description: "The highest honor - all 10 tasks complete!" },
    { id: "b6", name: "Determination", tasksRequired: 25, icon: "🔥", color: "#e91acd" },
    { id: "b7", name: "Strength", tasksRequired: 50, icon: "💪", color: "#39eb29" },
    { id: "b8", name: "Knowledge", tasksRequired: 100, icon: "🧠", color: "#4b0b35" },
];

export function StudentDashboard() {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [groups, setGroups] = useState([]);
    const [weeklyCompletedTasks, setWeeklyCompletedTasks] = useState(0);
    const [earnedBadges, setEarnedBadges] = useState([]);
    const [weeklyGoal] = useState(10);
    const [lastResetDate, setLastResetDate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch classes
                const classesData = await api.getClasses();
                
                // Fetch all tasks
                const tasksData = await api.getTasks();
                
                // Fetch groups for each class
                const allGroups = [];
                for (const cls of classesData) {
                    try {
                        const groupData = await api.getStudentGroup(cls._id);
                        allGroups.push(...groupData);
                    } catch (err) {
                        // Student might not be in a group for this class
                        console.log(`No group found for class ${cls._id}`);
                    }
                }
                
                // Organize tasks by class and group - nest groups under classes
                const classesWithTasksAndGroups = classesData.map(cls => {
                    // Get class-level tasks
                    const classTasks = tasksData.filter(task => {
                        const assignedClass = task.assignedToClass;
                        const classId = cls._id;
                        return assignedClass && (
                            assignedClass === classId || 
                            assignedClass.toString() === classId.toString()
                        );
                    });
                    
                    // Get groups that belong to this class
                    const classGroups = allGroups.filter(grp => 
                        grp.classId.toString() === cls._id.toString()
                    );
                    
                    // Add tasks to each group
                    const groupsWithTasks = classGroups.map(grp => {
                        const groupTasks = tasksData.filter(task => {
                            const assignedGroup = task.assignedToGroup;
                            const groupId = grp._id;
                            return assignedGroup && (
                                assignedGroup === groupId || 
                                assignedGroup.toString() === groupId.toString()
                            );
                        });
                        
                        return {
                            id: grp._id,
                            name: grp.name,
                            classId: grp.classId,
                            tasks: groupTasks.map(task => ({
                                id: task._id,
                                title: task.title,
                                description: task.description,
                                completed: task.status === 'done',
                                status: task.status,
                                dueDate: task.dueDate,
                            }))
                        };
                    });
                    
                    return {
                        id: cls._id,
                        name: cls.name,
                        tasks: classTasks.map(task => ({
                            id: task._id,
                            title: task.title,
                            description: task.description,
                            completed: task.status === 'done',
                            status: task.status,
                            dueDate: task.dueDate,
                        })),
                        groups: groupsWithTasks
                    };
                });
                
                setClasses(classesWithTasksAndGroups);
                setGroups([]); // No longer needed as separate state
                
                // Fetch badges from server
                try {
                    const badgesData = await api.getBadges();
                    setEarnedBadges(badgesData);
                } catch (err) {
                    console.error('Error fetching badges:', err);
                }
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
                setLoading(false);
                toast.error('Failed to load dashboard data');
            }
        };
        
        fetchData();
    }, []);

    // Check if we need to reset on Sunday at 11:59 PM
    useEffect(() => {
        const storedResetDate = localStorage.getItem('lastResetDate');
        const storedTaskCount = localStorage.getItem('weeklyCompletedTasks');
        const storedBadges = localStorage.getItem('earnedBadges');
        
        const now = new Date();
        const lastReset = storedResetDate ? new Date(storedResetDate) : null;
        
        // Calculate the next Sunday at 11:59 PM
        const getNextSundayReset = (fromDate) => {
            const date = new Date(fromDate);
            // Set to next Sunday
            const daysUntilSunday = (7 - date.getDay()) % 7;
            date.setDate(date.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));
            // Set time to 11:59 PM
            date.setHours(23, 59, 0, 0);
            return date;
        };
        
        // Get the last Sunday 11:59 PM that passed
        const getLastSundayReset = (fromDate) => {
            const date = new Date(fromDate);
            const daysSinceSunday = date.getDay();
            date.setDate(date.getDate() - daysSinceSunday);
            date.setHours(23, 59, 0, 0);
            
            // If we're before Sunday 11:59 PM this week, go back one more week
            if (date > fromDate) {
                date.setDate(date.getDate() - 7);
            }
            return date;
        };
        
        const lastSundayReset = getLastSundayReset(now);
        const shouldReset = !lastReset || lastReset < lastSundayReset;
        
        if (shouldReset) {
            // Reset weekly tasks
            setWeeklyCompletedTasks(0);
            localStorage.setItem('weeklyCompletedTasks', '0');
            localStorage.setItem('lastResetDate', now.toISOString());
            setLastResetDate(now);
            
            if (lastReset) {
                toast.info("🔄 Weekly progress reset! Start completing tasks to float the house!");
            }
        } else {
            // Load saved progress
            setWeeklyCompletedTasks(parseInt(storedTaskCount || '0'));
            setLastResetDate(lastReset);
        }
        
        // Load earned badges (these persist across resets)
        if (storedBadges) {
            try {
                const badges = JSON.parse(storedBadges);
                setEarnedBadges(badges);
            } catch (e) {
                console.error('Failed to parse stored badges:', e);
            }
        }
        
        // Set up interval to check for reset every minute
        const checkInterval = setInterval(() => {
            const currentTime = new Date();
            const currentDay = currentTime.getDay();
            const currentHour = currentTime.getHours();
            const currentMinute = currentTime.getMinutes();
            
            // Check if it's Sunday (0) at 11:59 PM
            if (currentDay === 0 && currentHour === 23 && currentMinute === 59) {
                const storedReset = localStorage.getItem('lastResetDate');
                const lastResetTime = storedReset ? new Date(storedReset) : null;
                const timeSinceReset = lastResetTime ? (currentTime - lastResetTime) / 1000 / 60 : Infinity;
                
                // Only reset if we haven't reset in the last 2 minutes (to avoid multiple resets)
                if (timeSinceReset > 2) {
                    setWeeklyCompletedTasks(0);
                    localStorage.setItem('weeklyCompletedTasks', '0');
                    localStorage.setItem('lastResetDate', currentTime.toISOString());
                    setLastResetDate(currentTime);
                    toast.info("🔄 Weekly progress reset! Start completing tasks to float the house!");
                }
            }
        }, 60000); // Check every minute
        
        return () => clearInterval(checkInterval);
    }, []);

    const incrementBalloonCount = async () => {
        const newCount = weeklyCompletedTasks + 1;
        setWeeklyCompletedTasks(newCount);
        localStorage.setItem('weeklyCompletedTasks', newCount.toString());
        
        // Check for new badges from server
        try {
            const result = await api.checkBadges();
            if (result.newBadges && result.newBadges.length > 0) {
                // Fetch updated badges
                const badgesData = await api.getBadges();
                setEarnedBadges(badgesData);
                
                // Show toast for each new badge
                result.newBadges.forEach(badge => {
                    toast.success(`🎉 Badge Earned: ${badge.icon} ${badge.name}!`);
                });
            }
        } catch (err) {
            console.error('Error checking badges:', err);
        }
        
        if (newCount === weeklyGoal) {
            toast.success("🎈 Amazing! You've reached your weekly goal! The house is in the sky!");
        }
    };

    const decrementBalloonCount = () => {
        const newCount = Math.max(0, weeklyCompletedTasks - 1);
        setWeeklyCompletedTasks(newCount);
        localStorage.setItem('weeklyCompletedTasks', newCount.toString());
    };

    const toggleTask = async (listType, itemId, taskId) => {
        // Find the current task status
        let currentTask;
        if (listType === "class") {
            const cls = classes.find(c => c.id === itemId);
            currentTask = cls?.tasks.find(t => t.id === taskId);
        } else {
            // For groups, find the class first, then the group
            for (const cls of classes) {
                const grp = cls.groups?.find(g => g.id === itemId);
                if (grp) {
                    currentTask = grp.tasks.find(t => t.id === taskId);
                    break;
                }
            }
        }
        
        if (!currentTask) return;
        
        const newStatus = currentTask.completed ? 'to-do' : 'done';
        
        try {
            // Update status on server
            await api.updateTaskStatus(taskId, newStatus);
            
            // Update local state
            if (listType === "class") {
                setClasses(classes.map(cls => {
                    if (cls.id === itemId) {
                        return {
                            ...cls,
                            tasks: cls.tasks.map(t => {
                                if (t.id === taskId) {
                                    if (!t.completed) {
                                        incrementBalloonCount();
                                    } else {
                                        decrementBalloonCount();
                                    }
                                    return { ...t, completed: !t.completed, status: newStatus };
                                }
                                return t;
                            }),
                        };
                    }
                    return cls;
                }));
            } else {
                // Update group task within the class
                setClasses(classes.map(cls => {
                    if (cls.groups?.some(g => g.id === itemId)) {
                        return {
                            ...cls,
                            groups: cls.groups.map(grp => {
                                if (grp.id === itemId) {
                                    return {
                                        ...grp,
                                        tasks: grp.tasks.map(t => {
                                            if (t.id === taskId) {
                                                if (!t.completed) {
                                                    incrementBalloonCount();
                                                } else {
                                                    decrementBalloonCount();
                                                }
                                                return { ...t, completed: !t.completed, status: newStatus };
                                            }
                                            return t;
                                        }),
                                    };
                                }
                                return grp;
                            }),
                        };
                    }
                    return cls;
                }));
            }
            
            toast.success(newStatus === 'done' ? 'Task completed!' : 'Task marked as to-do');
        } catch (err) {
            console.error('Error updating task:', err);
            toast.error('Failed to update task status');
        }
    };

    const handleLogout = () => {
        window.location.href = "/";
    };

    return (
        <div className="student-dashboard">
            <header className="student-header">
                <div className="header-left">
                    <div className="header-icon">🎈</div>
                    <div>
                        <h1 className="header-title">Adventure Book</h1>
                        <small className="header-subtitle">Wilderness Explorer Dashboard</small>
                    </div>
                </div>
                <button onClick={handleLogout} className="logout-button">
                    <LogOut size={18} /> Logout
                </button>
            </header>

            <main className="student-main">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <p>Loading your adventure book...</p>
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#C44536' }}>
                        <p>Error: {error}</p>
                    </div>
                ) : (
                    <>
                        {/* Top Section - House and Badges Side by Side */}
                        <div className="top-section">
                    {/* Left - House with Balloons */}
                    <div className="house-balloons-wrapper">
                        <HouseWithBalloons balloonCount={weeklyCompletedTasks} weeklyGoal={weeklyGoal} />
                    </div>

                    {/* Right - Badges */}
                    <div className="badges-section">
                        <div className="badges-texture" />
                        <div className="badges-content">
                            <div className="badges-header">
                                <div className="badges-icon">🎖️</div>
                                <h2 className="badges-title">Wilderness Explorer Badges</h2>
                            </div>
                            
                            {/* Two Column Layout */}
                            <div className="badges-columns">
                                {/* Left Column - Earned Badges */}
                                <div className="badges-column-left">
                                    <h3 className="badges-column-header">🏆 Earned Badges</h3>
                                    
                                    {earnedBadges.length === 0 ? (
                                        <p className="badges-empty">Complete tasks to earn badges!</p>
                                    ) : (
                                        <div>
                                            <p className="badges-progress">
                                                {earnedBadges.length} of {availableBadges.length} earned
                                            </p>
                                            <div className="badges-grid-earned">
                                                {earnedBadges.map(badge => (
                                                    <div key={badge.id} className="badge" style={{ background: badge.color || "#FFD700" }}>
                                                        <div className="badge-inner-circle" />
                                                        <div className="badge-content">
                                                            <div className="badge-emoji">{badge.icon}</div>
                                                            <div className="badge-name">{badge.name}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Right Column - Next Badges to Earn */}
                                <div className="badges-column-right">
                                    <h3 className="badges-column-header">🎯 Next Badges to Earn</h3>
                                    
                                    {availableBadges.length > earnedBadges.length ? (
                                        <div className="badges-grid-next">
                                            {availableBadges
                                                .filter(badge => !earnedBadges.some(eb => eb.id === badge.id))
                                                .map(badge => (
                                                    <div key={badge.id} className="badge-locked">
                                                        <span className="badge-locked-icon">{badge.icon}</span>
                                                        <div className="badge-locked-info">
                                                            <div className="badge-locked-name">{badge.name}</div>
                                                            <div className="badge-locked-tasks">{badge.tasksRequired} tasks</div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <p className="badges-empty">🎉 All badges earned!</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card stat-card-adventures">
                        <p className="stat-label">📚 Adventures (Classes)</p>
                        <h2 className="stat-value">{classes.length}</h2>
                    </div>
                    <div className="stat-card stat-card-teams">
                        <p className="stat-label">👥 Expedition Teams (Groups)</p>
                        <h2 className="stat-value">
                            {classes.reduce((acc, cls) => acc + (cls.groups?.length || 0), 0)}
                        </h2>
                    </div>
                    <div className="stat-card stat-card-quests">
                        <p className="stat-label">🗺️ Quests (Tasks)</p>
                        <h2 className="stat-value">
                            {classes.reduce((acc, cls) => {
                                const classTasks = cls.tasks.length;
                                const groupTasks = cls.groups?.reduce((gAcc, g) => gAcc + g.tasks.length, 0) || 0;
                                return acc + classTasks + groupTasks;
                            }, 0)}
                        </h2>
                    </div>
                    <div className="stat-card stat-card-completed">
                        <p className="stat-label">✅ Completed</p>
                        <h2 className="stat-value">
                            {classes.reduce((acc, cls) => {
                                const completedClassTasks = cls.tasks.filter(t => t.completed).length;
                                const completedGroupTasks = cls.groups?.reduce((gAcc, g) => 
                                    gAcc + g.tasks.filter(t => t.completed).length, 0) || 0;
                                return acc + completedClassTasks + completedGroupTasks;
                            }, 0)}
                        </h2>
                    </div>
                </div>

                <div className="tasks-container">
                    {classes.map(cls => (
                        <div key={cls.id} className="class-section">
                            {/* Class-level tasks */}
                            <div className="task-card task-card-class">
                                <div className="task-card-texture task-card-texture-class" />
                                <div className="task-card-content">
                                    <h3 className="task-card-header task-card-header-class">📖 {cls.name}</h3>
                                    {cls.tasks.length > 0 ? (
                                        <ul className="task-list">
                                            {cls.tasks.map(task => (
                                                <li 
                                                    key={task.id} 
                                                    className={`task-item task-item-class ${task.completed ? 'task-item-class-completed' : 'task-item-class-incomplete'}`}
                                                >
                                                    <span className={`task-title task-title-class ${task.completed ? 'task-title-completed' : ''}`}>
                                                        {task.title}
                                                    </span>
                                                    <CheckSquare 
                                                        size={24}
                                                        className={`task-checkbox ${task.completed ? 'task-checkbox-class-completed' : 'task-checkbox-class-incomplete'}`}
                                                        onClick={() => toggleTask("class", cls.id, task.id)} 
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p style={{ padding: '10px', color: '#666', fontStyle: 'italic' }}>
                                            No class-level tasks assigned yet
                                        </p>
                                    )}
                                </div>
                                {/* Groups under this class */}
                            {cls.groups && cls.groups.length > 0 && (
                                <div className="groups-section" style={{ marginLeft: '20px', marginTop: '10px' }}>
                                    {cls.groups.map(grp => (
                                        <div key={grp.id} className="task-card task-card-group">
                                            <div className="task-card-texture task-card-texture-group" />
                                            <div className="task-card-content">
                                                <h3 className="task-card-header task-card-header-group"> Group: {grp.name}</h3>
                                                {grp.tasks.length > 0 ? (
                                                    <ul className="task-list">
                                                        {grp.tasks.map(task => (
                                                            <li 
                                                                key={task.id} 
                                                                className={`task-item task-item-group ${task.completed ? 'task-item-group-completed' : 'task-item-group-incomplete'}`}
                                                            >
                                                                <span className={`task-title task-title-group ${task.completed ? 'task-title-completed' : ''}`}>
                                                                    {task.title}
                                                                </span>
                                                                <CheckSquare 
                                                                    size={24}
                                                                    className={`task-checkbox ${task.completed ? 'task-checkbox-group-completed' : 'task-checkbox-group-incomplete'}`}
                                                                    onClick={() => toggleTask("group", grp.id, task.id)} 
                                                                />
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p style={{ padding: '10px', color: '#666', fontStyle: 'italic' }}>
                                                        No group tasks assigned yet
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            </div>
                            
                    
                        </div>
                    ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
