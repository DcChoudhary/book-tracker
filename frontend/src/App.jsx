import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,

} from "@mui/material"

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
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }

      const data = await response.json()
      setBooks(data)
    } catch (error) {
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
    } catch (err) {
      setError(err.message)
    }
  }

  async function reloadBooks() {
    try {
      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error(`Reload failed: ${response.status}`)
      }

      const books = await response.json()

      setBooks(books)

    } catch (err) {
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

    } catch (err) {
      setError(err.message)
    }
  }

  async function handleEdit(book) {
    const newTitle = window.prompt("Edit book title:", book.title);

    if (newTitle == null || newTitle.trim() === "") {
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

    } catch (err) {
      setError(err.message)
    }

  }
  return (
    <Container
      component="main"
      maxWidth="md"
      sx={{ py: { xs: 4, sm: 6, md: 8 } }}
    >
      <Stack space={4}>
        <Box component="header">
          <Typography
            variant='overline'
            color='primary'
            sx={{ fontWeight: 700, letterSpacing: "0.14em" }}
          >
            My personal library
          </Typography>

          <Typography
            variant='h1'
            sx={{
              mt: 1,
              fontFamily: "Georgia, serif",
              fontSize: { xs: "2.75rem", sm: "3.5rem" },
              fontWeight: 600,
              letterSpacing: "-0.04em",
            }}
          >
            My Book tracker
          </Typography>

          <Typography
            color='text.secondary'
            sx={{ mt: 1.5, maxWidth: 520, lineHeight: 1.7 }}
          >
            Keep track of the books you're reading and the ones you want to remember.
          </Typography>
        </Box>

        <Paper
          component="section"
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            border: 1,
            borderColor: "divider",
            borderRadius: "18px",
            bgcolor: "background.paper"
          }}
        >
          <Typography variant='h2' sx={{ mb: 2, fontSize: "1.25rem", fontWeight: 700 }}>
            Add a book
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr auto" },
              gap: 2,
              alignItems: "start",
            }}
          >

            <TextField
              label="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Author"
              value={author}
              onChange={(event) => { setAuthor(event.target.value) }}
              required
              fullWidth
            />

            <Button type="submit" variant='contained' size="large" sx={{ minHeight: 56 }}>
              Add Book
            </Button>
          </Box>
        </Paper>

        {loading && <p>Loading Books...</p>}
        {error && <p role="alert">Could not load books: {error}</p>}
        <Stack component="section" spacing={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
          >
            <Box>
              <Typography
                variant="overline"
                color="secondary"
                sx={{ fontWeight: 700, letterSpacing: "0.14em" }}
              >
                Your collection
              </Typography>
              <Typography variant="h2" sx={{ fontSize: "1.5rem", fontWeight: 700 }}>
                Your books
              </Typography>
            </Box>

            <Chip
              color="primary"
              variant="outlined"
              label={`${books.length} ${books.length === 1 ? "book" : "books"}`}
            />
          </Stack>

          {loading && <LinearProgress aria-label="Loading books" />}

          {error && <Alert severity="error">{error}</Alert>}

          {!loading && books.length === 0 ? (
            <Paper
              variant="outlined"
              sx={{
                p: 4,
                borderRadius: "16px",
                borderStyle: "dashed",
                textAlign: "center",
              }}
            >
              <Typography variant="h6">Your library is waiting</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Add your first book using the form above.
              </Typography>
            </Paper>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              {books.map((book) => (
                <Card
                  key={book.id}
                  component="article"
                  variant="outlined"
                  sx={{
                    display: "flex",
                    minHeight: 210,
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderRadius: "16px",
                    bgcolor: "background.paper",
                    transition: "transform 160ms ease, box-shadow 160ms ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardContent>
                    <Typography
                      component="h3"
                      variant="h6"
                      sx={{ fontFamily: "Georgia, serif", fontWeight: 700 }}
                    >
                      {book.title}
                    </Typography>

                    <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                      by {book.author}
                    </Typography>

                    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
                      <Chip
                        size="small"
                        color="primary"
                        variant="outlined"
                        label={book.status?.replace(/[-_]/g, " ") || "No status"}
                      />

                      {book.rating != null && book.rating !== "" && (
                        <Chip
                          size="small"
                          color="secondary"
                          label={`★ ${book.rating}`}
                        />
                      )}
                    </Stack>
                  </CardContent>

                  <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                    <Button
                      size="small"
                      onClick={() => handleEdit(book)}
                      aria-label={`Edit title for ${book.title}`}
                    >
                      Edit
                    </Button>

                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete(book)}
                      aria-label={`Delete ${book.title}`}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
        </Stack>
      </Stack>
    </Container>
  );
}
