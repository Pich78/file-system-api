let currentFileHandle;
let libraryHandle;
let isNewBook = false;

document.getElementById('open-folder').addEventListener('click', async () => {
    try {
        const dirHandle = await window.showDirectoryPicker();
        libraryHandle = await dirHandle.getDirectoryHandle('library', { create: false });
        document.getElementById('new-book').style.display = 'inline-block';
        updateBookList();
    } catch (err) {
        console.error(err);
    }
});

document.getElementById('new-book').addEventListener('click', () => {
    isNewBook = true;
    openEditModal({ ID: '', Author: '', Book: '' });
});

function displayBook(book, fileHandle) {
    const bookTable = document.getElementById('book-table').getElementsByTagName('tbody')[0];
    const row = bookTable.insertRow();
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    const cell3 = row.insertCell(2);
    cell1.textContent = book.ID;
    cell2.textContent = book.Author;
    cell3.textContent = book.Book;
    cell1.style.cursor = 'pointer';
    cell1.addEventListener('click', () => {
        isNewBook = false;
        openEditModal(book, fileHandle);
    });
}

function openEditModal(book, fileHandle) {
    currentFileHandle = fileHandle;
    document.getElementById('bookId').value = book.ID;
    document.getElementById('author').value = book.Author;
    document.getElementById('book').value = book.Book;
    document.getElementById('editModal').style.display = 'block';
}

document.getElementsByClassName('close')[0].addEventListener('click', () => {
    document.getElementById('editModal').style.display = 'none';
});

document.getElementById('saveButton').addEventListener('click', async () => {
    const updatedBook = {
        ID: document.getElementById('bookId').value,
        Author: document.getElementById('author').value,
        Book: document.getElementById('book').value
    };
    const updatedContent = JSON.stringify(updatedBook, null, 2);

    if (isNewBook) {
        const newFileName = `${updatedBook.ID}.json`;
        currentFileHandle = await libraryHandle.getFileHandle(newFileName, { create: true });
    }

    await writeFile(currentFileHandle, updatedContent);
    document.getElementById('editModal').style.display = 'none';
    updateBookList();
});

async function updateBookList() {
    const bookTable = document.getElementById('book-table').getElementsByTagName('tbody')[0];
    bookTable.innerHTML = '';

    for await (const entry of libraryHandle.values()) {
        if (entry.kind === 'file') {
            const fileHandle = await libraryHandle.getFileHandle(entry.name);
            const file = await fileHandle.getFile();
            const content = await readFile(file);
            const book = JSON.parse(content);
            displayBook(book, fileHandle);
        }
    }
}