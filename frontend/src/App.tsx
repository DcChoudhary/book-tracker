import { useEffect, useState } from 'react'
import { Container, Stack } from "@mui/material"

import AppHeader from './components/AppHeader'
import BookForm from './features/books/BookForm';
import BookList from './features/books/BookList';
import { booksApi } from './features/books/BooksApi';

import type { Book, BookParams, DeleteBookFn, EditBookFn, CreateBookFn } from './types/book'

export default function App() {
  const [books, setBooks] = useState<Book[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadBooks() {
      setLoading(true)
      try {
        const books = await booksApi.list()
        setBooks(books)
      } catch (error: unknown) {
        if(error instanceof(Error)) {
          setError(error.message)
        }
      } finally {
        setLoading(false)
      }
    }

    loadBooks();
  }, [])

  const handleCreate: CreateBookFn = async(book: BookParams) => {
    try {
      await booksApi.create(book)
      const refreshedBooks = await booksApi.list()
      setBooks(refreshedBooks)
    } catch (error: unknown) {
      if(error instanceof(Error)) {
        setError(error.message);
      }
      throw error;
    }
  }

  const handleDelete: DeleteBookFn = async (book: Book) => {
    try {
      await booksApi.delete(book.id)
      setBooks((currentBooks) =>
        currentBooks.filter((currentBook) => currentBook.id !== book.id)
      );
    } catch (error: unknown) {
      if(error instanceof(Error)) {
        setError(error.message)
      }
      throw error;
    }
  }

  const handleEdit: EditBookFn = async (book: Book) => {
    const newTitle = window.prompt("Edit book title:", book.title);

    if (newTitle == null || newTitle.trim() === "") {
      return;
    }

    try {
      const updatedBook = await booksApi.update(book.id, {
        title: newTitle.trim(),
      });

      setBooks((currentBooks) =>
        currentBooks.map((currentBook) =>
          currentBook.id === updatedBook.id ? updatedBook : currentBook)
      )
    } catch (error: unknown) {
      if(error instanceof(Error)) {
        setError(error.message)
      }
      throw error
    }
  }

  return (
    <Container
      component="main"
      maxWidth="md"
      sx={{ py: { xs: 4, sm: 6, md: 8 } }}
    >
      <Stack spacing={4}>

        <AppHeader />
        <BookForm onCreate={handleCreate} />

        {loading && <p>Loading Books...</p>}
        {error && <p role="alert">Could not load books: {error}</p>}

        <BookList
          books={books}
          loading={loading}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Stack>
    </Container>
  );
}
