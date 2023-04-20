// Tests for books route
process.env.NODE_env = "test"
const request = require("supertest");
const app = require("../app")
const db = require("../db");

let book_isbn;

beforeEach(async () => {
    let result = await db.query(`
    INSERT INTO books(isbn, amazon_url, author, language, pages, publisher, title, year)
    VALUES("0691161518",
            "http://a.co/eobPtX2",
            "Matthew Lane",
            "english",
            264,
            "Princeton University Press",
            "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            2017)`);
    book_isbn = result.rows[0].isbn
});

describe("GET /books", function() {
    test("GET list of one book", async function() {
        const resp = await request(app).get(`/books`);
        const books = resp.body.books;
        expect(books[0]).toHaveProperty("isbn");
        expect(books[0]).toHaveProperty("title");
        expect(books).toHaveLength(1);
    });
});

describe("GET /books/:isbn", function() {
    test("Gets a single book", async function () {
        const response = await request(app).get(`/books/${book_isbn}`)
        expect(response.body.book).toHaveProperty("isbn");
        expect(response.body.book.isbn).toBe(book_isbn);
    });

    test("responds 404 if no book found", async function() {
        const resp = await request(app).get(`/books/999`)
        expect(resp.statusCode).toBe(404);
    });
});

describe("POST/books", function() {
    test("new book created", async function() {
        const response = await request(app).post(`/books`).send ({
            isbn: '326498782',
            amazon_url: "https://googlie.com",
            author: "test",
            language: "english",
            pages: 100,
            publisher: "yup",
            title: "bookposted",
            year: 1998
        });
        expect(response.body.book).toHaveProperty("title");
        expect(response.statusCode).toBe(201);
    });
});

describe("DELETE /books/:id", function() {
    test("delete a book", async function() {
        const resp = await request(app).delete(`/books/${book_isbn}`)
        expect(resp.body).toEqual({message: "Book deleted"});
    });
});