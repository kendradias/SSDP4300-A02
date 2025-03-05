document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const todoInput = document.getElementById('todo-input');
    const addButton = document.getElementById('add-todo');
    const todoList = document.getElementById('todo-list');
    
    // Load todos from the server when page loads
    fetchTodos();
    
    // Add event listener for the add button
    addButton.addEventListener('click', addTodo);
    
    // Add event listener for the Enter key in the input field
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    
    // Function to fetch and display todos
    function fetchTodos() {
        // Clear the list first (except for the loading item)
        while (todoList.firstChild) {
            todoList.removeChild(todoList.firstChild);
        }
        
        // Add loading indicator
        const loadingItem = document.createElement('li');
        loadingItem.classList.add('loading');
        loadingItem.textContent = 'Loading tasks...';
        todoList.appendChild(loadingItem);
        
        // Fetch todos from the server
        fetch('/api/todos')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch todos');
                }
                return response.json();
            })
            .then(todos => {
                // Remove loading indicator
                todoList.removeChild(loadingItem);
                
                if (todos.length === 0) {
                    const emptyItem = document.createElement('li');
                    emptyItem.classList.add('loading');
                    emptyItem.textContent = 'No tasks yet. Add one above!';
                    todoList.appendChild(emptyItem);
                } else {
                    // Display each todo
                    todos.forEach(todo => {
                        addTodoToList(todo);
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching todos:', error);
                todoList.removeChild(loadingItem);
                
                const errorItem = document.createElement('li');
                errorItem.classList.add('loading');
                errorItem.textContent = 'Error loading tasks. Please try again.';
                todoList.appendChild(errorItem);
            });
    }
    
    // Function to add a new todo
    function addTodo() {
        const text = todoInput.value.trim();
        
        if (text === '') {
            // Show error or alert
            todoInput.classList.add('error');
            setTimeout(() => {
                todoInput.classList.remove('error');
            }, 1500);
            return;
        }
        
        // Disable input and button while submitting
        todoInput.disabled = true;
        addButton.disabled = true;
        
        // Send the new todo to the server
        fetch('/api/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to add todo');
                }
                return response.json();
            })
            .then(newTodo => {
                // Add the new todo to the list
                todoInput.value = '';
                
                // If there's a "No tasks yet" message, remove it
                const emptyItem = todoList.querySelector('.loading');
                if (emptyItem) {
                    todoList.removeChild(emptyItem);
                }
                
                addTodoToList(newTodo);
            })
            .catch(error => {
                console.error('Error adding todo:', error);
                alert('Failed to add the task. Please try again.');
            })
            .finally(() => {
                // Re-enable input and button
                todoInput.disabled = false;
                addButton.disabled = false;
                todoInput.focus();
            });
    }
    
    // Function to add a todo item to the list
    function addTodoToList(todo) {
        const item = document.createElement('li');
        item.textContent = todo.text;
        item.dataset.id = todo.id;
        
        // Add the new item to the beginning of the list
        if (todoList.firstChild) {
            todoList.insertBefore(item, todoList.firstChild);
        } else {
            todoList.appendChild(item);
        }
    }
});