import { useEffect, useState } from 'react'
import './App.css'

const API_URL = "http://localhost:3000/api/v1/books";

export default function App() {
  const [books, setBooks] = useState([])
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    loadBooks();
  }, [])

  async function loadBooks() {
    try {
      const response = await fetch(API_URL)
      if(!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }

      const data = await response.json()
      setBooks(data)
    } catch(error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(event) {

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          book: {
            title,
            author,
            status: "want-to-read",
            rating: null
          }
        })
      })
      if (!response.ok) {
        throw new Error(`Create failed: ${response.status}`);
      }

      const refreshResponse = await fetch(API_URL)
      if (!refreshResponse.ok) {
        throw new Error(`Reload failed: ${refreshResponse.status}`)
      }

      const refreshBooks = await refreshResponse.json()
      setBooks(refreshBooks)
      
      setTitle("")
      setAuthor("")
    } catch(err) {
      setError(err.message)
    }
  }

  async function reloadBooks() {
    try {
    const response = await fetch(API_URL)

    if(!response.ok) {
      throw new Error(`Reload failed: ${response.status}`)
    }

    const books = await response.json()

    setBooks(books)

    } catch(err) {
      setError(err.message)
    }
  }

  async function handleDelete(book) {
    try {
      const url = `${API_URL}/${book.id}`
      const response = await fetch(url, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`)
      }

      await reloadBooks()

    } catch(err) {
      setError(err.message)
    }
  }

  async function handleEdit(book) {
    const newTitle = window.prompt("Edit book title:", book.title);

    if(newTitle == null || newTitle.trim() === "") {
      return;
    }

    try {
      const url = `${API_URL}/${book.id}`
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book: {
            title: newTitle
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`)
      }

      await reloadBooks()

    } catch(err) {
      setError(err.message)
    }

  }
  return (
    <main>
      <h1>My Book Tracker</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </label>

        <label>
          Author

          <input
            value={author}
            onChange={(event) => { setAuthor(event.target.value) }}
            required
          />
        </label>

        <button type="submit">Save</button>
      </form>

      {loading && <p>Loading Books...</p>}
      {error && <p role="alert">Could not load books: {error}</p>}
      <ul>
        {books.map((book) => (
          <li key={book.id}>
            <strong>{book.title}</strong> by {book.author}
            <span> - {book.status}</span>
            {book.rating && <span> (Rating: {book.rating}) </span>}

            <button type="button" onClick={() => handleEdit(book)}>
              Edit title
            </button>
            <button type="button" onClick={() => handleDelete(book)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
