let tasks = [];

let currentFilter = "all";

let nextId = 1;


const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const counter = document.getElementById("counter");
const filterButtons = document.querySelectorAll(".filter");

function render() {
    todoList.innerHTML = "";

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === "active") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.classList.add("todo-item");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        const text = document.createElement("span");
        text.textContent = task.text;
        text.classList.add("todo-text");

        if (task.completed) {
            text.classList.add("completed");
        }

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Удалить";
        deleteButton.classList.add("delete-button");

        checkbox.addEventListener("change", () => {
            toggleTask(task.id);
        });

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        li.appendChild(checkbox);
        li.appendChild(text);
        li.appendChild(deleteButton);

        todoList.appendChild(li);
    });

    updateCounter();
}


function addTask(text) {
    const trimmedText = text.trim();

    if (trimmedText === "") {
        alert("Введите текст задачи");
        return;
    }

    const newTask = {
        id: nextId,
        text: trimmedText,
        completed: false
    };

    nextId++;

    tasks.push(newTask);

    render();

    todoInput.value = "";

    todoInput.focus();
}



function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);

    render();
}


function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    render();
}


function updateCounter() {
    const completedCount = tasks.filter(task => task.completed).length;
    const activeCount = tasks.filter(task => !task.completed).length;

    counter.textContent =
        `Осталось: ${activeCount}, Выполнено: ${completedCount}`;
}


todoForm.addEventListener("submit", event => {
    // Не перезагружать страницу
    event.preventDefault();

    addTask(todoInput.value);
});


filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        render();
    });
});


render();