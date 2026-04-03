import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Registration from "./pages/Registration";

import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

return (
  <Router>
    <Routes>

      {/* DEFAULT HOME PAGE */}
      <Route path="/" element={
        <>
          <section id="center">
            <div className="hero">
              <img src={heroImg} className="base" width="170" height="179" alt="" />
              <img src={reactLogo} className="framework" alt="React logo" />
              <img src={viteLogo} className="vite" alt="Vite logo" />
            </div>
            <div>
              <h1>Get started</h1>
              <p>
                Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
              </p>
            </div>
            <button
              className="counter"
              onClick={() => setCount((count) => count + 1)}
            >
              Count is {count}
            </button>
          </section>

          <div className="ticks"></div>

          <section id="next-steps">
            <div id="docs">
              <h2>Documentation</h2>
              <p>Your questions, answered</p>
            </div>
          </section>
        </>
      } />

      {/* YOUR PAGES */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Registration />} />
      <Route path="/dashboard" element={<Dashboard />} />

    </Routes>
  </Router>
);