
const books = [
    {
        id: 1,
        title: "Clean Code",
        author: "Robert C. Martin",
        totalCopies: 5,
        availableCopies: 5,
    },

    {
        id: 2,
        title: "Database System Companies",
        author: "Silechats",
        totalCopies: 3,
        availableCopies: 3,
    },

    {
        id: 3,
        title: "Computer Network",
        author: "Ross",
        totalCopies: 4,
        availableCopies: 4,
    },
];

console.log("Library Management System Started");

function showallBooks(){
    console.log("All Books");
    console.log(books);
}

// showallBooks();

function searchBook(keyword) {
    const result = books.filter(function (book) {
        return book.title.toLowerCase().includes(keyword.toLowerCase());
    });

    return result;
}

// console.log("Search Result");
// console.log(searchBook("Clean Code"));

function borrowBook(bookId) {
    const book = books.find(function (book){
        return book.id == bookId;
    });

    if(!book) {
        console.log("Books Not Found");
        return;
    }

    if(book.availableCopies <= 0) {
        console.log("Book is not Available");
        return;
    }

    book.availableCopies -= 1;

    console.log(`book borrowed: ${book.title}`);
    console.log(`availble copies: ${book.availableCopies}`);

}

// borrowBook(1);
// borrowBook(1);

function returnBook(bookId) {
    const book = books.find(function(book) {
        return book.id == bookId;
    });

    if(!book){
        console.log("Book not found");
        return;
    }

    if(book.availableCopies >= book.totalCopies){
        console.log("Why return");
        return;
    }
    book.availableCopies += 1;

    console.log(`book borrowed: ${book.title}`);
    console.log(`availble copies: ${book.availableCopies}`);

}

borrowBook(1);
borrowBook(1);
returnBook(1);