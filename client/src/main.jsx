import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { Login } from './pages/Login';
import { Registration } from './pages/Registration';
import { StudentDashboard } from "./pages/studentView"; // student dashboard
import { ProfessorDashboard } from "./pages/professorView"; // professor dashboard

const root = createRoot(document.getElementById('root')); // only once

root.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/studentView" element={<StudentDashboard />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);