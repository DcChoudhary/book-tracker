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

      const data = await response.json
      setBooks(data)
    } catch(error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const newBook = {
      id: Date.now(),
      title: title,
      author: author
    }

    setBooks([...books, newBook])
    setTitle("")
    setAuthor("")
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
          </li>
        ))}
      </ul>
    </main>
  );
}
