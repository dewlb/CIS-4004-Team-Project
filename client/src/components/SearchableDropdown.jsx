import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, User } from "lucide-react";
import "../css/SearchableDropdown.css";

export function SearchableDropdown({ 
    value, 
    onChange, 
    placeholder = "Select a student...",
    students = [],
    isLoading = false 
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredStudents, setFilteredStudents] = useState(students);
    const dropdownRef = useRef(null);

    useEffect(() => {
        setFilteredStudents(
            students.filter(student => {
                const searchLower = searchTerm.toLowerCase();
                const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
                const username = student.username.toLowerCase();
                return fullName.includes(searchLower) || username.includes(searchLower);
            })
        );
    }, [searchTerm, students]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (student) => {
        onChange(student.username);
        setIsOpen(false);
        setSearchTerm("");
    };

    const selectedStudent = students.find(s => s.username === value);

    return (
        <div className="searchable-dropdown" ref={dropdownRef}>
            <div 
                className="dropdown-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="dropdown-value">
                    {selectedStudent ? (
                        <div className="selected-student">
                            <User size={16} />
                            <span>{selectedStudent.firstName} {selectedStudent.lastName}</span>
                            <span className="student-username">@{selectedStudent.username}</span>
                        </div>
                    ) : (
                        <span className="placeholder">{placeholder}</span>
                    )}
                </div>
                <ChevronDown 
                    size={18} 
                    className={`dropdown-icon ${isOpen ? "open" : ""}`}
                />
            </div>

            {isOpen && (
                <div className="dropdown-menu">
                    <div className="dropdown-search">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="dropdown-list">
                        {isLoading ? (
                            <div className="dropdown-loading">Loading students...</div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="dropdown-empty">
                                {searchTerm ? "No students found" : "No students available"}
                            </div>
                        ) : (
                            filteredStudents.map((student) => (
                                <div
                                    key={student._id}
                                    className={`dropdown-item ${value === student.username ? "selected" : ""}`}
                                    onClick={() => handleSelect(student)}
                                >
                                    <User size={16} />
                                    <div className="student-info">
                                        <span className="student-name">
                                            {student.firstName} {student.lastName}
                                        </span>
                                        <span className="student-username-small">
                                            @{student.username}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
