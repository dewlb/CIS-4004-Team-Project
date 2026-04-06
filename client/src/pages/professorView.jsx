import React, { useState, useEffect } from "react";
import { LogOut, Plus, Trash2, Users, BookOpen, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { SearchableDropdown } from "../components/SearchableDropdown";
import "../css/professorView.css";

export function ProfessorDashboard() {
    const [classes, setClasses] = useState([]);
    const [newClassName, setNewClassName] = useState("");
    const [selectedClass, setSelectedClass] = useState(null);
    const [groups, setGroups] = useState([]);
    const [students, setStudents] = useState([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);

    const [newGroupName, setNewGroupName] = useState("");
    const [studentUsername, setStudentUsername] = useState("");

    const [tasks, setTasks] = useState([]);
    const [taskInputs, setTaskInputs] = useState({});

    const [deleteModal, setDeleteModal] = useState({
        open: false,
        classId: null
    });

    

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

    // =============================
    // FETCH ALL STUDENTS
    // =============================
    const fetchStudents = async () => {
        setIsLoadingStudents(true);
        try {
            const res = await fetch("/api/users", {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await parseJSON(res);

            if (res.ok) {
                // Filter only students (not professors)
                const studentUsers = (data || []).filter(user => user.role === "student");
                setStudents(studentUsers);
            } else {
                toast.error("Failed to fetch students");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error loading students");
        } finally {
            setIsLoadingStudents(false);
        }
    };

    useEffect(() => {
        fetchClasses();
        fetchStudents();
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
        <div className="professor-dashboard">
            <header className="professor-header">
                <h1>📘 Professor Dashboard</h1>
                <button onClick={handleLogout} className="logout-button">
                    <LogOut size={18}/> Logout
                </button>
            </header>

            <main className="professor-main">

                {!selectedClass && (
                    <>
                        <div className="card">
                            <div className="card-content">
                                <h2>Create New Class</h2>
                                <div className="form-group">
                                    <label htmlFor="className">Class Name</label>
                                    <div className="input-with-button">
                                        <input
                                            id="className"
                                            value={newClassName}
                                            onChange={(e) => setNewClassName(e.target.value)}
                                            placeholder="e.g., CIS 4004 - Software Engineering"
                                            onKeyPress={(e) => e.key === 'Enter' && createClass()}
                                        />
                                        <button onClick={createClass} className="btn-primary">
                                            <Plus size={16}/> Add Class
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-content">
                                <h2>Your Classes</h2>
                                {classes.length === 0 ? (
                                    <div className="empty-state">
                                        No classes yet. Create your first class above!
                                    </div>
                                ) : (
                                    <div className="classes-grid">
                                        {classes.map(cls => (
                                            <div key={cls._id} className="class-card">
                                                <h3>
                                                    <BookOpen size={20} />
                                                    {cls.name}
                                                </h3>
                                                <div className="class-stats">
                                                    <div className="class-stat">
                                                        <Users size={16} />
                                                        <span
                                                            style={{ cursor: "pointer", textDecoration: "underline" }}
                                                            onClick={() => handleSelectClass(cls, "students")}
                                                            >
                                                            {cls.students?.length || 0} Students
                                                        </span>
                                                    </div>
                                                    <div className="class-stat">
                                                        <span>🧩 {cls.groups?.length || 0} Groups</span>
                                                    </div>
                                                </div>

                                                <div className="button-group">
                                                    <button 
                                                        onClick={() => handleSelectClass(cls)}
                                                        className="btn-secondary"
                                                    >
                                                        Manage Class →
                                                    </button>
                                                    <button 
                                                        onClick={() => setDeleteModal({ open: true, classId: cls._id })}
                                                        className="btn-danger"
                                                        >
                                                        <Trash2 size={14}/> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {selectedClass && (
                    <>
                        <button onClick={() => setSelectedClass(null)} className="btn-back">
                            ← Back to All Classes
                        </button>

                        <div className="card">
                            <div className="card-content">
                                <h2>📖 Managing: {selectedClass.name}</h2>

                                <div className="card">
                                    <div className="card-content">
                                        <h3>👥 Students in Class</h3>

                                        {selectedClass.students?.length > 0 ? (
                                        <div className="group-members">
                                            {selectedClass.students.map((student, i) => (
                                            <div key={student._id ?? i} className="member-badge">
                                                <Users size={14} />
                                                {student.username ?? student}

                                                {/* REMOVE BUTTON */}
                                                <button
                                                className="btn-danger"
                                                style={{ marginLeft: "0.5rem", padding: "0.2rem 0.5rem" }}
                                                onClick={() => removeStudent(student._id)}
                                                >
                                                ✕
                                                </button>
                                            </div>
                                            ))}
                                        </div>
                                        ) : (
                                        <p className="empty-state">No students in this class</p>
                                        )}
                                    </div>
                                    </div>

                                <div className="form-group">
                                    <label>
                                        <UserPlus size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        Add Student to Class
                                    </label>
                                    <div className="input-with-button">
                                        <SearchableDropdown
                                            value={studentUsername}
                                            onChange={setStudentUsername}
                                            placeholder="Select a student..."
                                            students={students}
                                            isLoading={isLoadingStudents}
                                        />
                                        <button 
                                            onClick={addStudent} 
                                            className="btn-primary"
                                            disabled={!studentUsername}
                                        >
                                            <Plus size={16}/> Add
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="groupName">Create New Group</label>
                                    <div className="input-with-button">
                                        <input
                                            id="groupName"
                                            value={newGroupName}
                                            onChange={(e) => setNewGroupName(e.target.value)}
                                            placeholder="e.g., Team Alpha"
                                            onKeyPress={(e) => e.key === 'Enter' && createGroup()}
                                        />
                                        <button onClick={createGroup} className="btn-primary">
                                            <Plus size={16}/> Create Group
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-content">
                                <h3>Groups in this Class</h3>
                                {groups.length === 0 ? (
                                    <div className="empty-state">
                                        No groups yet. Create your first group above!
                                    </div>
                                ) : (
                                    groups.map(group => {
                                        const groupTasks = tasks.filter(
                                            t => t.assignedToGroup === group._id
                                        );

                                        return (
                                            <div key={group._id} className="group-section">
                                                <div className="group-header">
                                                    <h4 className="group-title">
                                                        <Users size={18} />
                                                        {group.name}
                                                    </h4>
                                                    <button 
                                                        onClick={() => deleteGroup(group._id)}
                                                        className="btn-danger"
                                                    >
                                                        <Trash2 size={14}/> Delete Group
                                                    </button>
                                                </div>

                                                {/* MEMBERS */}
                                                <div>
                                                    <strong style={{ color: '#666', fontSize: '0.9rem' }}>Members:</strong>
                                                    {group.members?.length > 0 ? (
                                                        <div className="group-members">
                                                            {group.members.map((member, i) => (
                                                                <div key={member._id ?? member ?? i} className="member-badge">
                                                                    <Users size={14} />
                                                                    {member.username ?? member}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p style={{ color: '#999', fontStyle: 'italic', marginTop: '0.5rem' }}>
                                                            No members yet
                                                        </p>
                                                    )}
                                                </div>

                                                {/* ADD TO GROUP */}
                                                <div className="form-group" style={{ marginTop: '1rem' }}>
                                                    <label>Add Student to Group</label>
                                                    <div className="input-with-button">
                                                        <SearchableDropdown
                                                            value={groupInputs[group._id] || ""}
                                                            onChange={(value) =>
                                                                setGroupInputs(prev => ({
                                                                    ...prev,
                                                                    [group._id]: value
                                                                }))
                                                            }
                                                            placeholder="Select a student..."
                                                            students={students}
                                                            isLoading={isLoadingStudents}
                                                        />
                                                        <button 
                                                            onClick={() => addToGroup(group._id)}
                                                            className="btn-primary"
                                                            disabled={!groupInputs[group._id]}
                                                        >
                                                            <Plus size={16}/> Add
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* TASK CREATION */}
                                                <div className="form-group">
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
                                                        style={{ marginBottom: '0.75rem' }}
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
                                                        style={{ marginBottom: '0.75rem' }}
                                                    />
                                                    <button 
                                                        onClick={() => createTask(group._id)}
                                                        className="btn-secondary"
                                                    >
                                                        <Plus size={16}/> Create Task
                                                    </button>
                                                </div>

                                                {/* TASK LIST */}
                                                <div>
                                                    <h4>📋 Tasks</h4>
                                                    {groupTasks.length === 0 ? (
                                                        <p className="empty-state" style={{ padding: '1rem' }}>
                                                            No tasks assigned to this group
                                                        </p>
                                                    ) : (
                                                        <div className="task-items">
                                                            {groupTasks.map(task => (
                                                                <div key={task._id} className="task-item">
                                                                    <div className="task-info">
                                                                        <div className="task-title">{task.title}</div>
                                                                        <div className={`task-status ${task.status}`}>
                                                                            Status: {task.status}
                                                                        </div>
                                                                    </div>
                                                                    <button 
                                                                        onClick={() => deleteTask(task._id)}
                                                                        className="btn-danger"
                                                                    >
                                                                        <Trash2 size={14}/> Delete
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </>
                )}
                {deleteModal.open && (
                    <div className="modal-overlay">
                        <div className="modal">
                        <h3>Delete Class?</h3>
                        <p>This action cannot be undone.</p>
                        <div className="button-group">
                            <button
                            className="btn-danger"
                            onClick={() => {
                                deleteClass(deleteModal.classId);
                                setDeleteModal({ open: false, classId: null });
                            }}
                            >
                            Confirm Delete
                            </button>
                            <button
                            className="btn-secondary"
                            onClick={() => setDeleteModal({ open: false, classId: null })}
                            >
                            Cancel
                            </button>
                        </div>
                        </div>
                    </div>
                    )}
            </main>
        </div>
    );
}