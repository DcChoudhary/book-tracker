import { useEffect, useState } from 'react'
import { Container, Stack } from "@mui/material"

import AppHeader from './components/AppHeader'
import BookForm from './features/books/BookForm';
import BookList from './features/books/BookList';
import { booksApi } from './features/books/BooksApi';

export default function App() {
  const [books, setBooks] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadBooks() {
      setLoading(true)
      try {
        const books = await booksApi.list()
        setBooks(books)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadBooks();
  }, [])

  async function handleCreate(book) {
    try {
      await booksApi.create(book)
      const refreshedBooks = await booksApi.list()
      setBooks(refreshedBooks)
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  async function handleDelete(book) {
    try {
      await booksApi.delete(book.id)
      setBooks((currentBooks) =>
        currentBooks.filter((currentBook) => currentBook.id !== book.id)
      );
    } catch (error) {
      setError(error.message)
      throw error;
    }
  }

  async function handleEdit(book) {
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
    } catch (err) {
      setError(err.message)
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
