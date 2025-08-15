// Sélecteurs
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;
const filterBtns = document.querySelectorAll('.filterBtn');

// Stockage des tâches
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let deletedTasks = JSON.parse(localStorage.getItem('deletedTasks')) || [];
let currentFilter = 'all';

// MODE SOMBRE
const isDarkMode = localStorage.getItem('darkMode') === 'true';
if (isDarkMode) {
  body.classList.add('dark');
  darkModeToggle.textContent = 'Mode Clair';
} else {
  darkModeToggle.textContent = 'Mode Sombre';
}

darkModeToggle.addEventListener('click', () => {
  body.classList.toggle('dark');
  const darkActive = body.classList.contains('dark');
  localStorage.setItem('darkMode', darkActive);
  darkModeToggle.textContent = darkActive ? 'Mode Clair' : 'Mode Sombre';
});

// Sauvegarde des tâches
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks));
}

// Ajout d'une tâche
function addTaskToDOM(taskText, completed = false) {
  const li = document.createElement('li');
  li.className = "border p-2 rounded flex justify-between items-center";

  // Texte tâche
  const span = document.createElement('span');
  span.textContent = taskText;
  span.className = "flex-grow cursor-pointer";
  li.appendChild(span);

  // Bouton supprimer
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '✕';
  deleteBtn.className = 'text-red-600 hover:text-red-800 ml-2';
  deleteBtn.addEventListener('click', () => {
    if(currentFilter === 'deleted') {
      // Suppression définitive
      const idx = deletedTasks.indexOf(taskText);
      if(idx > -1) deletedTasks.splice(idx, 1);
    } else {
      // Déplacer vers la corbeille
      const idx = tasks.indexOf(taskText);
      if(idx > -1) tasks.splice(idx, 1);
      deletedTasks.push(taskText);
    }
    saveTasks();
    renderTasks();
  });
  li.appendChild(deleteBtn);

  // Édition de la tâche
  span.addEventListener('click', () => {
    if(currentFilter === 'deleted') return; // interdiction d'éditer dans la corbeille
    const input = document.createElement('input');
    input.type = 'text';
    input.value = span.textContent;
    input.className = "flex-grow border rounded px-2 py-1";

    li.replaceChild(input, span);
    input.focus();

    function saveEdit() {
      if(input.value.trim() === '') {
        // Supprimer si vide
        const idx = tasks.indexOf(taskText);
        if(idx > -1) tasks.splice(idx, 1);
      } else {
        span.textContent = input.value.trim();
        const idx = tasks.indexOf(taskText);
        if(idx > -1) tasks[idx] = input.value.trim();
        li.replaceChild(span, input);
      }
      saveTasks();
      renderTasks();
    }

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
      if(e.key === 'Enter') saveEdit();
    });
  });

  taskList.appendChild(li);
}

// Rendu des tâches selon le filtre
function renderTasks() {
  taskList.innerHTML = "";
  let listToRender = [];

  if(currentFilter === 'deleted') {
    listToRender = deletedTasks;
  } else if(currentFilter === 'all') {
    listToRender = tasks;
  } else if(currentFilter === 'active') {
    listToRender = tasks; // ici tu pourrais filtrer par statut si tu ajoutes un completed
  } else if(currentFilter === 'completed') {
    listToRender = tasks; // pareil, filtrer si tu ajoutes completed
  }

  listToRender.forEach(task => addTaskToDOM(task));
}

// Ajout tâche
addTaskBtn.addEventListener('click', () => {
  const task = taskInput.value.trim();
  if(task !== '') {
    tasks.push(task);
    saveTasks();
    renderTasks();
    taskInput.value = '';
  }
});

taskInput.addEventListener('keydown', (e) => {
  if(e.key === 'Enter') addTaskBtn.click();
});

// Filtre des tâches
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.remove('filter-selected'));
    btn.classList.add('filter-selected');
    renderTasks();
  });
});

// Chargement initial
window.addEventListener('DOMContentLoaded', renderTasks);
