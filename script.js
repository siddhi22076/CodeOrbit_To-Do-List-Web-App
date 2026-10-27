
"use strict";

// 1. Get HTML elements
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");

const totalCount = document.getElementById("total-count");
const completedCount = document.getElementById("completed-count");
const pendingCount = document.getElementById("pending-count");

const remainingText = document.getElementById("remaining-text");
const emptyMessage = document.getElementById("empty-message");
const statusMessage = document.getElementById("status-message");
const clearCompletedBtn = document.getElementById("clear-completed");

const filterButtons = document.querySelectorAll(".filter-btn");

// 2. Load saved tasks from LocalStorage
function loadTasks() {
  try {
    const savedTasks = localStorage.getItem("todoTasks");
    const parsedTasks = savedTasks ? JSON.parse(savedTasks) : [];

    if (!Array.isArray(parsedTasks)) {
      return [];
    }

    return parsedTasks.filter(task =>
      task &&
      typeof task.id === "string" &&
      typeof task.text === "string" &&
      typeof task.completed === "boolean"
    );
  } catch (error) {
    return [];
  }
}

let tasks = loadTasks();
let currentFilter = "all";

// 3. Save tasks to LocalStorage
function saveTasks() {
  try {
    localStorage.setItem("todoTasks", JSON.stringify(tasks));
  } catch (error) {
    showStatus("Unable to save tasks in this browser.");
  }
}

// 4. Display a status message
function showStatus(message) {
  statusMessage.textContent = message;
}

// 5. Add a new task
taskForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const text = taskInput.value.trim();

  if (text === "") {
    showStatus("Please enter a task.");
    taskInput.focus();
    return;
  }

  const newTask = {
    id: crypto.randomUUID(),
    text: text,
    completed: false
  };

  tasks.unshift(newTask);

  saveTasks();
  renderTasks();

  taskInput.value = "";
  taskInput.focus();

  showStatus("Task added successfully.");
});

// 6. Mark a task as completed or pending
function toggleTask(id) {
  tasks = tasks.map(function (task) {
    if (task.id === id) {
      return {
        ...task,
        completed: !task.completed
      };
    }

    return task;
  });

  saveTasks();
  renderTasks();
  showStatus("Task status updated.");
}

// 7. Delete an individual task
function deleteTask(id) {
  tasks = tasks.filter(function (task) {
    return task.id !== id;
  });

  saveTasks();
  renderTasks();
  showStatus("Task deleted.");
}

// 8. Create a task element safely
function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = "task-item";

  if (task.completed) {
    li.classList.add("completed");
  }

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-checkbox";
  checkbox.checked = task.completed;
  checkbox.setAttribute(
    "aria-label",
    "Mark " + task.text + " as completed"
  );

  checkbox.addEventListener("change", function () {
    toggleTask(task.id);
  });

  const span = document.createElement("span");
  span.className = "task-text";

  // textContent safely displays user-entered text
  span.textContent = task.text;

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "Delete";
  deleteBtn.setAttribute(
    "aria-label",
    "Delete task: " + task.text
  );

  deleteBtn.addEventListener("click", function () {
    deleteTask(task.id);
  });

  li.append(checkbox, span, deleteBtn);

  return li;
}

// 9. Filter tasks
function getFilteredTasks() {
  if (currentFilter === "active") {
    return tasks.filter(task => !task.completed);
  }

  if (currentFilter === "completed") {
    return tasks.filter(task => task.completed);
  }

  return tasks;
}

// 10. Update the task list and statistics
function renderTasks() {
  taskList.replaceChildren();

  const visibleTasks = getFilteredTasks();

  visibleTasks.forEach(function (task) {
    taskList.appendChild(createTaskElement(task));
  });

  totalCount.textContent = tasks.length;

  const completed = tasks.filter(
    task => task.completed
  ).length;

  completedCount.textContent = completed;
  pendingCount.textContent = tasks.length - completed;

  remainingText.textContent =
    (tasks.length - completed) +
    (tasks.length - completed === 1
      ? " task remaining"
      : " tasks remaining");

  emptyMessage.hidden = visibleTasks.length !== 0;

  if (tasks.length === 0) {
    emptyMessage.textContent =
      "No tasks yet. Add your first task!";
  } else if (visibleTasks.length === 0) {
    emptyMessage.textContent =
      "No tasks in this filter.";
  } else {
    emptyMessage.textContent = "";
  }
}

// 11. Change the active filter
filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    currentFilter = button.dataset.filter;

    filterButtons.forEach(function (filterButton) {
      const isActive =
        filterButton.dataset.filter === currentFilter;

      filterButton.classList.toggle("active", isActive);
      filterButton.setAttribute(
        "aria-pressed",
        String(isActive)
      );
    });

    renderTasks();
  });
});

// 12. Remove all completed tasks
clearCompletedBtn.addEventListener("click", function () {
  const previousLength = tasks.length;

  tasks = tasks.filter(function (task) {
    return !task.completed;
  });

  if (tasks.length === previousLength) {
    showStatus("There are no completed tasks to clear.");
    return;
  }

  saveTasks();
  renderTasks();
  showStatus("Completed tasks cleared.");
});

// 13. Display the current year
document.getElementById("year").textContent =
  new Date().getFullYear();

// 14. Initial display when the page opens
renderTasks();
