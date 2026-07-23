import React from 'react';

const Dashboard = ({ tasks, energyLevel, onToggleTask }) => {
  // Sort tasks: Incomplete first, then match energy level, then others
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    if (a.energy === energyLevel && b.energy !== energyLevel) return -1;
    if (a.energy !== energyLevel && b.energy === energyLevel) return 1;
    return 0;
  });

  return (
    <div className="task-list">
      <h2>Your Action Items</h2>
      {sortedTasks.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No tasks found. Ask Aura to create some!</p>
      ) : (
        sortedTasks.map(task => (
          <div key={task.id} className="task-item glass-panel">
            <div className="task-content">
              <input 
                type="checkbox" 
                checked={task.completed} 
                onChange={() => onToggleTask(task.id, task.completed)}
                className="task-checkbox"
              />
              <span className={`task-title ${task.completed ? 'completed' : ''}`}>
                {task.title}
              </span>
            </div>
            <span className={`task-badge badge-${task.energy.toLowerCase()}`}>
              {task.energy} Energy
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default Dashboard;
