import { useState } from 'react'

import {
  Box,
  Button,
  Paper,
  Typography,
  TextField
} from '@mui/material'

export default function BookForm({ onCreate }) {
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault();

    if (title.trim() == '' || author.trim() == '') {
      return null
    }

    const book = {
      title,
      author,
      status: "want-to-read",
      rating: null
    }
    setIsSaving(true)
    try {
      await onCreate(book)
      setTitle("")
      setAuthor("")
    } catch {
      // App shows the error; keep the entered values so they can be corrected or retried
    } finally {
      setIsSaving(false)
    }
  }

  return (
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
        onSubmit={(event) => handleSubmit(event)}
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

        <Button type="submit" variant='contained' size="large" sx={{ minHeight: 56 }} loading={isSaving}>
          Add Book
        </Button>
      </Box>
    </Paper>
  )
}