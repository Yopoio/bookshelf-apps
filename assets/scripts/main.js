const books = [];
const STORAGE_KEY = 'BOOKSHELF_APPS';
const READ_BOOK_UNCOMPLETE = 'incompleteBookshelfList';
const READ_BOOK_COMPLETE = 'completeBookshelfList';
const BOOK_ITEM = 'itemId';

function renderBooks() {
  const incompleteBookshelfList = document.getElementById(READ_BOOK_UNCOMPLETE);
  const completeBookshelfList = document.getElementById(READ_BOOK_COMPLETE);
  
  incompleteBookshelfList.innerHTML = '';
  completeBookshelfList.innerHTML = '';

  for (const book of books) {
    const newBook = createBook(book.title, `Penulis: ${book.author}`, `Tahun: ${book.year}`, book.isComplete);
    newBook[BOOK_ITEM] = book.id;

    if (book.isComplete) {
      completeBookshelfList.append(newBook);
    } else {
      incompleteBookshelfList.append(newBook);
    }
  }
}

function generateBookObject(title, author, year, isComplete) {
    return {
        id: +new Date(),
        title,
        author,
        year,
        isComplete
    };
}

function findBook(bookId) {
    for (book of books) {
        if (book.id === bookId)
            return book; 
    }
    return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function isStorageExist() {
  if (typeof Storage === 'undefined') {
    alert('Browser Anda tidak mendukung local storage');
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event('ondatafetch'));
  }
}

function fetchData() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    books.push(...data);
    renderBooks();
  }
  document.dispatchEvent(new Event('ondatafetch'));
}

function updateData() {
  if (isStorageExist())
      saveData();
}

function createUndoButton() {
  return createButton('green', 'Belum selesai dibaca', function (event) {
      undoBookFromCompleted(event.target.parentElement.parentElement);
  });
}

function createTrashButton() {
  return createButton('red', 'Hapus buku', function (event) {
      removeBookFromCompleted(event.target.parentElement.parentElement);
  });
}

function createEditButton() {
  return createButton('navy', 'Edit buku', function (event) {
      editBook(event.target.parentElement.parentElement);
  });
}

function createCheckButton() {
  return createButton('green', 'Selesai dibaca', function (event) {
    moveBookToCompleted(event.target.parentElement.parentElement);
  });
}

function createButton(buttonTypeClass, buttonText, eventListener) {
  const button = document.createElement('button');
  button.innerText = buttonText;
  button.classList.add(buttonTypeClass);
  button.addEventListener('click', function (event) {
      eventListener(event);
  });
  return button;
}

function createBook(title, author, year, isComplete) {
  const bookTitle = document.createElement('h3');
  const bookAuthor = document.createElement('p');
  const bookYear = document.createElement('p');
  
  bookTitle.innerText = title;
  bookAuthor.innerText = author;
  bookYear.innerText = year;

    const bookContainer = document.createElement('div');
    bookContainer.classList.add('action');
    if (isComplete) {
        bookContainer.append(
            createUndoButton(),
            createTrashButton(),
            createEditButton()
        );
    } else {
        bookContainer.append(
            createCheckButton(),
            createTrashButton(),
            createEditButton()
        );
    }

    const container = document.createElement('article');
    container.classList.add('book_item');
    container.append(bookTitle, bookAuthor, bookYear, bookContainer);

    return container;
}

function addBook() {
  const incompleteBookshelfList = document.getElementById(READ_BOOK_UNCOMPLETE);
  const completeBookshelfList = document.getElementById(READ_BOOK_COMPLETE);
  const bookTitle = document.getElementById('inputBookTitle').value;
  const bookAuthor = document.getElementById('inputBookAuthor').value;
  const bookYear = document.getElementById('inputBookYear').value;
  const isComplete = document.getElementById('inputBookIsComplete').checked;

  const book = createBook(bookTitle, `Penulis: ${bookAuthor}`, `Tahun: ${bookYear}`, isComplete);
  const bookObject = generateBookObject(bookTitle, bookAuthor, bookYear, isComplete);

  book[BOOK_ITEM] = bookObject.id;
  books.push(bookObject);

  if (isComplete) {
      completeBookshelfList.append(book);
  } else {
      incompleteBookshelfList.append(book);
  }
  updateData();
}

function editBook(idBook) {
  const bookPosition = findBookIndex(idBook[BOOK_ITEM]);
  const book = findBook(idBook[BOOK_ITEM]);
  const incompleteBookshelfList = document.getElementById(READ_BOOK_UNCOMPLETE);
  const completeBookshelfList = document.getElementById(READ_BOOK_COMPLETE);
  const newBookTitle = prompt('Masukkan judul baru', book.title);
  const newBookAuthor = prompt('Masukkan nama penulis baru', book.author);
  const newBookYear = prompt('Masukkan tahun terbit baru', book.year);

  const newBook = createBook(newBookTitle, `Penulis: ${newBookAuthor}`, `Tahun: ${newBookYear}`, book.isComplete);
  newBook[BOOK_ITEM] = book.id;

  books[bookPosition] = {
    id: book.id,
    title: newBookTitle,
    author: newBookAuthor,
    year: newBookYear,
    isComplete: book.isComplete,
  };

  if (book.isComplete) {
    completeBookshelfList.replaceChild(newBook, idBook);
  } else {
    incompleteBookshelfList.replaceChild(newBook, idBook);
  }

  updateData();
}

function moveBookToCompleted(idBook) {
  const completeBookshelfList = document.getElementById(READ_BOOK_COMPLETE);
  const bookTitle = idBook.querySelector('h3').innerText;
  const bookAuthor = idBook.querySelectorAll('p')[0].innerText;
  const bookYear = idBook.querySelectorAll('p')[1].innerText;

  const isMove = window.confirm('Apakah Anda sudah selesai membaca buku ini?')
  if (isMove) {
    const newBook = createBook(bookTitle, bookAuthor, bookYear, true);
    const book = findBook(idBook[BOOK_ITEM]);
    book.isComplete = true;
    newBook[BOOK_ITEM] = book.id;

    completeBookshelfList.append(newBook);
    idBook.remove();

    updateData();
    alert('Buku berhasil dipindahkan ke rak Selesai dibaca')
  } else {
    alert('Buku gagal dihapus');
}  
}
  
function removeBookFromCompleted(idBook) {
  const isDelete = window.confirm('Apakah Anda yakin ingin menghapus buku ini?');
  if (isDelete) {
      const bookPosition = findBookIndex(idBook[BOOK_ITEM]);
      books.splice(bookPosition, 1);

      idBook.remove();
      updateData();
      alert('Buku berhasil dihapus');
  } else {
      alert('Buku gagal dihapus');
  }
}

function undoBookFromCompleted(idBook) {
  const incompleteBookshelfList = document.getElementById(READ_BOOK_UNCOMPLETE);
  const bookTitle = idBook.querySelector('h3').innerText;
  const bookAuthor = idBook.querySelectorAll('p')[0].innerText;
  const bookYear = idBook.querySelectorAll('p')[1].innerText;

  const isUndo = window.confirm('Apakah Anda ingin mengembalikan buku ini ke rak belum dibaca?');
  if (isUndo) {
    const newBook = createBook(bookTitle, bookAuthor, bookYear, false);
    const book = findBook(idBook[BOOK_ITEM]);
    book.isComplete = false;
    newBook[BOOK_ITEM] = book.id;

    incompleteBookshelfList.append(newBook);
    idBook.remove();

    updateData();
    alert('Buku berhasil dikembalikan')
  } else {
    alert('Buku gagal dikembalikan');
  }
}

function searchBook() {
  const searchBook = document.getElementById('searchBookTitle');
  const filter = searchBook.value.toUpperCase();
  const bookItem = document.querySelectorAll('section.book_shelf > .book_list > .book_item');
  for (let i = 0; i < bookItem.length; i++) {
      txtValue = bookItem[i].textContent || bookItem[i].innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
          bookItem[i].style.display = '';
      } else {
          bookItem[i].style.display = 'none';
      }
  }
}

function checkButton() {
  const span = document.querySelector('span');
  if (inputBookIsComplete.checked) {
      span.innerText = 'Selesai dibaca';
  } else {
      span.innerText = 'Belum selesai dibaca';
  }
}

document.addEventListener('DOMContentLoaded', function () {
  
  const inputBook = document.getElementById('inputBook');
  const inputSearchBook = document.getElementById('searchBook');
  const inputBookIsComplete = document.getElementById('inputBookIsComplete');

  inputBook.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  inputSearchBook.addEventListener('keyup', function (event) {
    event.preventDefault();
    searchBook();
  });

  inputSearchBook.addEventListener('submit', function (event) {
    event.preventDefault();
    searchBook();
  });

  inputBookIsComplete.addEventListener('input', function (event) {
    event.preventDefault();
    checkButton();
  });

  if (isStorageExist()) {
    fetchData();
  }
});

document.addEventListener('ondatafetch', () => {
  console.log('Buku berhasil disimpan.');
});

document.addEventListener('ondataloaded', () => {
  refreshDataFromBooks();
});