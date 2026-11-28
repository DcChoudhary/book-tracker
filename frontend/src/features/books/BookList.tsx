import { Alert, Box, Chip, LinearProgress, Paper, Stack, Typography, } from '@mui/material'

import BookCard from "./BookCard"

import type { Book, DeleteBookFn, EditBookFn } from "../../types/book"

interface BookListProps {
  books: Book[],
  loading: boolean,
  error: any, // We are using any here because e don't have define fix RFC response from the API, chang it once we have the RFC problem+json response from the API's
  onEdit: EditBookFn,
  onDelete:  DeleteBookFn,
}

export default function BookList({ books, loading, error, onEdit, onDelete }: BookListProps) {
  return (
    <Stack component="section" spacing={2}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
        }}
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

      {
        !loading && books.length === 0 ? (
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
            {books.map((book: Book) => (
              <BookCard
                key={book.id}
                book={book}
                onEdit={onEdit}
                onDelete={onDelete} />
            ))}
          </Box>
        )
      }
    </Stack >
  )
}