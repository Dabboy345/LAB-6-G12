// app.js for Library Reservation System
// This file will handle registration, login, book reservation, admin actions, undo, and confirmation messages.

// Utility functions for localStorage
function saveUser(email) {
    localStorage.setItem('libraryUser', JSON.stringify({ email }));
}
function getUser() {
    return JSON.parse(localStorage.getItem('libraryUser'));
}
function removeUser() {
    localStorage.removeItem('libraryUser');
}

// UI rendering
function renderRegistration() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="card">
            <h2><span style="font-size:2.2rem;vertical-align:middle;">📚</span><br>Register to Access<br>Library Reservations</h2>
            <form id="registerForm" autocomplete="off" style="width:100%;display:flex;flex-direction:column;align-items:center;">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required placeholder="your@email.com" />
                <button class="icon-btn reserve" type="submit"><span class="icon">📧</span>Register</button>
            </form>
            <div id="message"></div>
        </div>
    `;
    document.getElementById('registerForm').onsubmit = handleRegister;
}

function renderRegistered(email) {
    renderBookList(email);
}

function showMessage(msg, isError) {
    const messageDiv = document.getElementById('message') || document.createElement('div');
    messageDiv.className = isError ? 'confirmation error' : 'confirmation';
    messageDiv.innerHTML = isError ? `<span class="icon">❌</span>${msg}` : `<span class="icon">✅</span>${msg}`;
    if (!messageDiv.parentNode) {
        document.getElementById('app').appendChild(messageDiv);
    }
}

function renderBookList(email) {
    const books = getBooks();
    let html = renderAdminBar();
    if (isAdmin) {
        html += `<div class="card">` + renderAddBookForm() + `</div>`;
        if (lastAddedBookId) {
            html += `<button class="icon-btn undo" id="undoAddBtn"><span class="icon">↩️</span>Undo Last Add</button>`;
        }
    }
    html += `<h2>Available Books</h2><ul class="book-list">`;
    books.forEach(book => {
        html += `<li>
            <span class="book-title">${book.title}</span>`;
        if (!isAdmin) {
            if (book.reservedBy === email) {
                html += `<span class="message"><span class="icon">📚</span>Reserved by you</span><br />
                    <button class="icon-btn cancel" onclick="window.cancelReservation(${book.id})"><span class="icon">❌</span>Cancel Reservation</button>`;
            } else if (book.reservedBy) {
                html += `<span class="message"><span class="icon">🔒</span>Reserved</span>`;
            } else {
                html += `<button class="icon-btn reserve" onclick="window.reserveBook(${book.id})"><span class="icon">📖</span>Reserve</button>`;
            }
        }
        html += `</li>`;
    });
    html += `</ul><div id="message"></div>`;
    const app = document.getElementById('app');
    app.innerHTML = `<h2>Welcome, ${email}${isAdmin ? ' (Admin)' : ''}</h2>` + html + `<button id="logoutBtn">Logout</button>`;
    document.getElementById('logoutBtn').onclick = function() {
        removeUser();
        showMessage('Logged out.', false);
        setTimeout(renderRegistration, 1000);
    };
    document.getElementById('adminToggle').onclick = function() {
        isAdmin = !isAdmin;
        renderBookList(email);
    };
    if (isAdmin) {
        document.getElementById('addBookForm').onsubmit = handleAddBook;
        if (lastAddedBookId && document.getElementById('undoAddBtn')) {
            document.getElementById('undoAddBtn').onclick = handleUndoAddBook;
        }
    }
}

function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    if (!email) {
        showMessage('Please enter a valid email.', true);
        return;
    }
    saveUser(email);
    renderRegistered(email);
}

function handleUndo() {
    removeUser();
    showMessage('Registration undone. Please register again.', false);
    setTimeout(renderRegistration, 1200);
}

function saveBooks(books) {
    localStorage.setItem('libraryBooks', JSON.stringify(books));
}
function getBooks() {
    const books = localStorage.getItem('libraryBooks');
    return books ? JSON.parse(books) : DEFAULT_BOOKS.slice();
}

function saveReservation(email, bookId) {
    const books = getBooks();
    const idx = books.findIndex(b => b.id === bookId);
    if (idx !== -1) {
        books[idx].reservedBy = email;
        saveBooks(books);
    }
}
function undoReservation(bookId) {
    const books = getBooks();
    const idx = books.findIndex(b => b.id === bookId);
    if (idx !== -1) {
        books[idx].reservedBy = null;
        saveBooks(books);
    }
}

let isAdmin = false;
let lastAddedBookId = null;

// For US-04: Cancel reservation with undo and confirmation
let lastCancelledReservation = null;

function renderAdminBar() {
    return `<div class="admin-bar">
        <button id="adminToggle" class="${isAdmin ? 'active' : ''}">${isAdmin ? 'Exit Admin Mode' : 'Admin Mode'}</button>
    </div>`;
}

function renderAddBookForm() {
    return `<form class="add-book-form" id="addBookForm">
        <label for="bookTitle">Add a new book to the catalog:</label>
        <input type="text" id="bookTitle" name="bookTitle" placeholder="Book Title" required />
        <button type="submit">Add Book</button>
    </form>`;
}

function renderBookList(email) {
    const books = getBooks();
    let html = renderAdminBar();
    if (isAdmin) {
        html += `<div class="card">` + renderAddBookForm() + `</div>`;
        if (lastAddedBookId) {
            html += `<button class="icon-btn undo" id="undoAddBtn"><span class="icon">↩️</span>Undo Last Add</button>`;
        }
    }
    html += `<h2>Available Books</h2><ul class="book-list">`;
    books.forEach(book => {
        html += `<li>
            <span class="book-title">${book.title}</span>`;
        if (!isAdmin) {
            if (book.reservedBy === email) {
                html += `<span class="message"><span class="icon">📚</span>Reserved by you</span><br />
                    <button class="icon-btn cancel" onclick="window.cancelReservation(${book.id})"><span class="icon">❌</span>Cancel Reservation</button>`;
            } else if (book.reservedBy) {
                html += `<span class="message"><span class="icon">🔒</span>Reserved</span>`;
            } else {
                html += `<button class="icon-btn reserve" onclick="window.reserveBook(${book.id})"><span class="icon">📖</span>Reserve</button>`;
            }
        }
        html += `</li>`;
    });
    html += `</ul><div id="message"></div>`;
    const app = document.getElementById('app');
    app.innerHTML = `<h2>Welcome, ${email}${isAdmin ? ' (Admin)' : ''}</h2>` + html + `<button id="logoutBtn">Logout</button>`;
    document.getElementById('logoutBtn').onclick = function() {
        removeUser();
        showMessage('Logged out.', false);
        setTimeout(renderRegistration, 1000);
    };
    document.getElementById('adminToggle').onclick = function() {
        isAdmin = !isAdmin;
        renderBookList(email);
    };
    if (isAdmin) {
        document.getElementById('addBookForm').onsubmit = handleAddBook;
        if (lastAddedBookId && document.getElementById('undoAddBtn')) {
            document.getElementById('undoAddBtn').onclick = handleUndoAddBook;
        }
    }
}

function handleAddBook(e) {
    e.preventDefault();
    const title = document.getElementById('bookTitle').value.trim();
    if (!title) {
        showMessage('Please enter a book title.', true);
        return;
    }
    let books = getBooks();
    const newId = books.length ? Math.max(...books.map(b => b.id)) + 1 : 1;
    books.push({ id: newId, title, reservedBy: null });
    saveBooks(books);
    lastAddedBookId = newId;
    renderBookList(getUser().email);
    showMessage('Book added successfully! You can undo this action.', false);
}

function handleUndoAddBook() {
    let books = getBooks();
    books = books.filter(b => b.id !== lastAddedBookId);
    saveBooks(books);
    showMessage('Book addition undone.', false);
    lastAddedBookId = null;
    renderBookList(getUser().email);
}

window.reserveBook = function(bookId) {
    const user = getUser();
    if (!user || !user.email) return;
    saveReservation(user.email, bookId);
    renderBookList(user.email);
    showMessage('Book reserved successfully! You can undo this action.', false);
};

window.undoBookReservation = function(bookId) {
    undoReservation(bookId);
    const user = getUser();
    renderBookList(user.email);
    showMessage('Reservation undone.', false);
};

window.cancelReservation = function(bookId) {
    const user = getUser();
    if (!user || !user.email) return;
    const books = getBooks();
    const idx = books.findIndex(b => b.id === bookId);
    if (idx !== -1 && books[idx].reservedBy === user.email) {
        lastCancelledReservation = { ...books[idx] };
        books[idx].reservedBy = null;
        saveBooks(books);
        renderBookList(user.email);
        showMessage('Reservation cancelled. You can undo this action.', false);
        // Show undo button for cancellation
        const msgDiv = document.getElementById('message');
        if (msgDiv) {
            msgDiv.innerHTML += '<br><button class="icon-btn undo" id="undoCancelBtn"><span class="icon">↩️</span>Undo Cancel</button>';
            document.getElementById('undoCancelBtn').onclick = handleUndoCancelReservation;
        }
    }
};

function handleUndoCancelReservation() {
    if (!lastCancelledReservation) return;
    const books = getBooks();
    const idx = books.findIndex(b => b.id === lastCancelledReservation.id);
    if (idx !== -1 && !books[idx].reservedBy) {
        books[idx].reservedBy = lastCancelledReservation.reservedBy;
        saveBooks(books);
        showMessage('Reservation restored.', false);
        renderBookList(getUser().email);
        lastCancelledReservation = null;
    }
}

// Initial load
window.onload = function() {
    const user = getUser();
    if (user && user.email) {
        renderRegistered(user.email);
    } else {
        renderRegistration();
    }
};
