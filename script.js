const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const totalTasksEl = document.getElementById("totalTasks");
const completedTasksEl = document.getElementById("completedTasks");
const remainingTasksEl = document.getElementById("remainingTasks");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const themeToggle = document.getElementById("themeToggle");
const toast = document.getElementById("toast");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️";
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function saveTheme() {
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const remaining = total - completed;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  totalTasksEl.textContent = total;
  completedTasksEl.textContent = completed;
  remainingTasksEl.textContent = remaining;
  progressText.textContent = `${progress}%`;
  progressFill.style.width = `${progress}%`;
}

function getFilteredTasks() {
  if (currentFilter === "completed") {
    return tasks.filter(task => task.completed);
  }

  if (currentFilter === "pending") {
    return tasks.filter(task => !task.completed);
  }

  return tasks;
}

function createEmptyState() {
  const li = document.createElement("li");
  li.className = "empty-state";

  if (currentFilter === "completed") {
    li.textContent = "لا توجد مهام مكتملة بعد ✅";
  } else if (currentFilter === "pending") {
    li.textContent = "لا توجد مهام غير مكتملة 🎉";
  } else {
    li.textContent = "لا توجد مهام حاليًا، أضيف/ي أول مهمة ✨";
  }

  taskList.appendChild(li);
}

function createCompletionBurst(target) {
  const burst = document.createElement("div");
  burst.className = "burst";

  const colors = ["#60a5fa", "#2563eb", "#93c5fd", "#34d399"];

  for (let i = 0; i < 10; i++) {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";

    const angle = Math.random() * Math.PI * 2;
    const distance = 28 + Math.random() * 44;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    sparkle.style.setProperty("--x", `${x}px`);
    sparkle.style.setProperty("--y", `${y}px`);
    sparkle.style.left = `${42 + Math.random() * 16}%`;
    sparkle.style.top = `${30 + Math.random() * 28}%`;
    sparkle.style.background = colors[Math.floor(Math.random() * colors.length)];

    burst.appendChild(sparkle);
  }

  target.appendChild(burst);

  setTimeout(() => {
    burst.remove();
  }, 850);
}

function renderTasks() {
  taskList.innerHTML = "";

  const filteredTasks = getFilteredTasks();

  if (filteredTasks.length === 0) {
    createEmptyState();
    updateStats();
    return;
  }

  filteredTasks.forEach(task => {
    const realIndex = tasks.findIndex(item => item.id === task.id);

    const li = document.createElement("li");
    li.className = "task-item";

    if (task.completed) {
      li.classList.add("done");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;

    if (task.completed) {
      span.classList.add("completed");
    }

    checkbox.addEventListener("change", () => {
      const wasCompleted = tasks[realIndex].completed;
      tasks[realIndex].completed = checkbox.checked;
      saveTasks();

      if (!wasCompleted && checkbox.checked) {
        li.classList.add("done");
        span.classList.add("completed");
        updateStats();
        createCompletionBurst(li);
        showToast("أحسنت، تم إنجاز المهمة 🎉");

        setTimeout(() => {
          renderTasks();
        }, 700);
      } else {
        renderTasks();
      }
    });

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "icon-btn edit-btn";
    editBtn.textContent = "تعديل";
    editBtn.addEventListener("click", () => {
      const newText = prompt("عدل المهمة:", task.text);

      if (newText === null) return;
      const trimmed = newText.trim();

      if (trimmed === "") {
        alert("لا يمكن أن تكون المهمة فارغة");
        return;
      }

      tasks[realIndex].text = trimmed;
      saveTasks();
      renderTasks();
      showToast("تم تعديل المهمة ✏️");
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "icon-btn delete-btn";
    deleteBtn.textContent = "حذف";
    deleteBtn.addEventListener("click", () => {
      li.classList.add("fade-out");

      setTimeout(() => {
        tasks = tasks.filter(item => item.id !== task.id);
        saveTasks();
        renderTasks();
        showToast("تم حذف المهمة");
      }, 300);
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(actions);

    taskList.appendChild(li);
  });

  updateStats();
}

function addTask() {
  const taskText = taskInput.value.trim();

  if (taskText === "") {
    alert("اكتب/ي مهمة أولًا");
    return;
  }

  tasks.unshift({
    id: Date.now(),
    text: taskText,
    completed: false
  });

  saveTasks();
  renderTasks();
  taskInput.value = "";
  taskInput.focus();
  showToast("تمت إضافة المهمة ✨");
}

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTask();
  }
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
  showToast("تم حذف المهام المكتملة");
});

clearAllBtn.addEventListener("click", () => {
  const confirmDelete = confirm("هل أنت متأكد من حذف كل المهام؟");
  if (!confirmDelete) return;

  tasks = [];
  saveTasks();
  renderTasks();
  showToast("تم حذف كل المهام");
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
  saveTheme();
});

renderTasks();
updateStats();