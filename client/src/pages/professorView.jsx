import React, { useState, useEffect } from "react";
import { LogOut, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function ProfessorDashboard() {
    const [classes, setClasses] = useState([]);
    const [newClassName, setNewClassName] = useState("");
    const [selectedClass, setSelectedClass] = useState(null);
    const [groups, setGroups] = useState([]);

    const [newGroupName, setNewGroupName] = useState("");
    const [studentUsername, setStudentUsername] = useState("");

    const [tasks, setTasks] = useState([]);
    const [taskInputs, setTaskInputs] = useState({});

    // 🔥 per-group input (important)
    const [groupInputs, setGroupInputs] = useState({});

    const token = localStorage.getItem("token");

    const parseJSON = async (res) => {
        const text = await res.text();
        try {
            return text ? JSON.parse(text) : null;
        } catch {
            return null;
        }
    };

    // =============================
    // FETCH CLASSES
    // =============================
    const fetchClasses = async () => {
        try {
            const res = await fetch("/api/classes/professor", {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await parseJSON(res);

            if (res.ok) {
                setClasses(data || []);
            } else {
                toast.error(data?.error || "Failed to fetch classes");
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    // =============================
    // SELECT CLASS
    // =============================
    const handleSelectClass = async (cls) => {
    setSelectedClass(cls);

    try {
        const [groupRes, taskRes] = await Promise.all([
            fetch(`/api/classes/${cls._id}/groups`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            fetch("/api/tasks", {
                headers: { Authorization: `Bearer ${token}` }
            })
        ]);

        const groupsData = await parseJSON(groupRes);
        const taskData = await parseJSON(taskRes);

        if (groupRes.ok) setGroups(groupsData || []);
        if (taskRes.ok) setTasks(taskData || []);

    } catch (err) {
        console.error(err);
    }
};

    // =============================
    // CREATE CLASS
    // =============================
    const createClass = async () => {
        if (!newClassName) return;

        const res = await fetch("/api/classes/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ name: newClassName }),
        });

        const data = await parseJSON(res);

        if (res.ok) {
            toast.success("Class created!");
            setNewClassName("");
            fetchClasses();
        } else {
            toast.error(data?.error);
        }
    };

    // =============================
    // DELETE CLASS
    // =============================
    const deleteClass = async (classId) => {
        const res = await fetch(`/api/classes/${classId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await parseJSON(res);

        if (res.ok) {
            toast.success("Class deleted");
            fetchClasses();
        } else {
            toast.error(data?.error);
        }
    };

    // =============================
    // CREATE GROUP
    // =============================
    const createGroup = async () => {
        if (!newGroupName) return;

        const res = await fetch("/api/groups/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                name: newGroupName,
                classId: selectedClass._id
            })
        });

        const data = await parseJSON(res);

        if (res.ok) {
            toast.success("Group created!");
            setNewGroupName("");
            handleSelectClass(selectedClass);
        } else {
            toast.error(data?.error);
        }
    };

    // =============================
    // DELETE GROUP
    // =============================
    const deleteGroup = async (groupId) => {
        const res = await fetch(`/api/groups/${groupId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await parseJSON(res);

        if (res.ok) {
            toast.success("Group deleted");
            handleSelectClass(selectedClass);
        } else {
            toast.error(data?.error);
        }
    };

    // =============================
    // CREATE TASK
    // =============================
    const createTask = async (groupId) => {
        const input = taskInputs[groupId];
        if (!input?.title) return;

        const res = await fetch("/api/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                title: input.title,
                description: input.description || "",
                assignedToGroup: groupId
            })
        });

        const data = await parseJSON(res);

        if (res.ok) {
            toast.success("Task created!");
            setTaskInputs(prev => ({
                ...prev,
                [groupId]: { title: "", description: "" }
            }));
            handleSelectClass(selectedClass); // refresh
        } else {
            toast.error(data?.message);
        }
    };

    // =============================
    // DELETE TASK
    // =============================
    const deleteTask = async (taskId) => {
        const res = await fetch(`/api/tasks/${taskId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await parseJSON(res);

        if (res.ok) {
            toast.success("Task deleted");
            handleSelectClass(selectedClass);
        } else {
            toast.error(data?.message);
        }
    };

    // =============================
    // ADD STUDENT TO CLASS
    // =============================
    const addStudent = async () => {
        if (!studentUsername) return;

        const res = await fetch("/api/classes/join", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                classId: selectedClass._id,
                username: studentUsername
            })
        });

        const data = await parseJSON(res);

        if (res.ok) {
            toast.success("Student added!");
            setStudentUsername("");
            fetchClasses();
        } else {
            toast.error(data?.error);
        }
    };

    // =============================
    // ADD STUDENT TO GROUP
    // =============================
    const addToGroup = async (groupId) => {
        const username = groupInputs[groupId];
        if (!username) return;

        const res = await fetch(`/api/groups/${groupId}/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ username })
        });

        const data = await parseJSON(res);

        if (res.ok) {
            toast.success("Added to group!");
            setGroupInputs(prev => ({ ...prev, [groupId]: "" }));
            handleSelectClass(selectedClass);
        } else {
            toast.error(data?.error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    return (
        <div className="student-dashboard">
            <header className="student-header">
                <h1>📘 Professor Dashboard</h1>
                <button onClick={handleLogout} className="logout-button">
                    <LogOut size={18}/> Logout
                </button>
            </header>

            <main className="student-main">

                {!selectedClass && (
                    <>
                        <div className="task-card">
                            <h3>Create Class</h3>
                            <input
                                value={newClassName}
                                onChange={(e) => setNewClassName(e.target.value)}
                                placeholder="Class name"
                            />
                            <button onClick={createClass}>
                                <Plus size={16}/> Add Class
                            </button>
                        </div>

                        {classes.map(cls => (
                            <div key={cls._id} className="task-card">
                                <h3>📖 {cls.name}</h3>
                                <p>👥 Students: {cls.students?.length || 0}</p>
                                <p>🧩 Groups: {cls.groups?.length || 0}</p>

                                <button onClick={() => deleteClass(cls._id)}>
                                    <Trash2 size={16}/> Delete Class
                                </button>

                                <button onClick={() => handleSelectClass(cls)}>
                                    Manage Class →
                                </button>
                            </div>
                        ))}
                    </>
                )}

                {selectedClass && (
                    <div className="task-card">
                        <h2>📖 Managing: {selectedClass.name}</h2>

                        <button onClick={() => setSelectedClass(null)}>
                            ← Back
                        </button>

                        <h3>Add Student</h3>
                        <input
                            value={studentUsername}
                            onChange={(e) => setStudentUsername(e.target.value)}
                            placeholder="Student username"
                        />
                        <button onClick={addStudent}>Add Student</button>

                        <h3>Create Group</h3>
                        <input
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="Group name"
                        />
                        <button onClick={createGroup}>Add Group</button>

                        <h3>Groups</h3>
                        {groups.map(group => {
                            const groupTasks = tasks.filter(
                                t => t.assignedToGroup === group._id
                            );

                            return (
                                <div key={group._id} style={{ marginBottom: "20px" }}>
                                    <strong>👥 {group.name}</strong>

                                    <button onClick={() => deleteGroup(group._id)}>
                                        <Trash2 size={14}/>
                                    </button>

                                    {/* MEMBERS */}
                                    <div>
                                        {group.members?.map((member, i) => (
                                            <p key={member._id ?? member ?? i}>
                                                👤 {member.username ?? member}
                                            </p>
                                        ))}
                                    </div>

                                    {/* ADD TO GROUP */}
                                    <input
                                        placeholder="Add user to group"
                                        value={groupInputs[group._id] || ""}
                                        onChange={(e) =>
                                            setGroupInputs(prev => ({
                                                ...prev,
                                                [group._id]: e.target.value
                                            }))
                                        }
                                    />
                                    <button onClick={() => addToGroup(group._id)}>
                                        Add
                                    </button>

                                    {/* =============================
                                        TASK CREATION
                                    ============================= */}
                                    <h4>📝 Create Task</h4>
                                    <input
                                        placeholder="Task title"
                                        value={taskInputs[group._id]?.title || ""}
                                        onChange={(e) =>
                                            setTaskInputs(prev => ({
                                                ...prev,
                                                [group._id]: {
                                                    ...prev[group._id],
                                                    title: e.target.value
                                                }
                                            }))
                                        }
                                    />
                                    <input
                                        placeholder="Description"
                                        value={taskInputs[group._id]?.description || ""}
                                        onChange={(e) =>
                                            setTaskInputs(prev => ({
                                                ...prev,
                                                [group._id]: {
                                                    ...prev[group._id],
                                                    description: e.target.value
                                                }
                                            }))
                                        }
                                    />
                                    <button onClick={() => createTask(group._id)}>
                                        Create Task
                                    </button>

                                    {/* =============================
                                        TASK LIST
                                    ============================= */}
                                    <h4>📋 Tasks</h4>
                                    {groupTasks.length === 0 ? (
                                        <p>No tasks</p>
                                    ) : (
                                        groupTasks.map(task => (
                                            <div key={task._id}>
                                                <p>
                                                    {task.title} — {task.status}
                                                </p>
                                                <button onClick={() => deleteTask(task._id)}>
                                                    Delete
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}