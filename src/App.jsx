import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import ChatCoach from './components/ChatCoach';
import './index.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : '/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [energyLevel, setEnergyLevel] = useState('Medium'); // Low, Medium, High

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_BASE}/tasks`);
      setTasks(res.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const addTask = async (task) => {
    try {
      const res = await axios.post(`${API_BASE}/tasks`, task);
      setTasks([...tasks, res.data]);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const toggleTask = async (id, currentStatus) => {
    try {
      const res = await axios.put(`${API_BASE}/tasks/${id}`, { completed: !currentStatus });
      setTasks(tasks.map(t => t.id === id ? res.data : t));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  return (
    <div className="app-container">
      <main className="dashboard">
        <header className="header">
          <h1>Aura</h1>
          <p>Context-Aware Productivity Assistant</p>
        </header>

        <section className="energy-section glass-panel">
          <h2>Current Energy Level: {energyLevel}</h2>
          <input 
            type="range" 
            min="1" 
            max="3" 
            value={energyLevel === 'Low' ? 1 : energyLevel === 'Medium' ? 2 : 3}
            onChange={(e) => {
              const val = e.target.value;
              setEnergyLevel(val == 1 ? 'Low' : val == 2 ? 'Medium' : 'High');
            }}
            className="energy-slider"
          />
          <div className="energy-labels">
            <span>Low (Admin/Easy)</span>
            <span>Medium (Standard)</span>
            <span>High (Deep Work)</span>
          </div>
        </section>

        <Dashboard tasks={tasks} energyLevel={energyLevel} onToggleTask={toggleTask} />
      </main>

      <aside className="chat-container glass-panel">
        <ChatCoach energyLevel={energyLevel} tasks={tasks} onAddTask={addTask} />
      </aside>
    </div>
  );
}

export default App;
