export function ProfessorDashboard() {
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
        </div>
    );

}