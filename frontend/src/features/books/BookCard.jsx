import {
  Button,
  Card,
  CardContent,
  Chip,
  CardActions,
  Stack,
  Typography,
} from '@mui/material'

export default function BookCard({ book, onEdit, onDelete }) {
  return (
    <Card
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

        <Stack direction="row" gap={1} sx={{ flexWrap: "wrap", mt: 2 }}>
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
          onClick={() => onEdit(book)}
          aria-label={`Edit title for ${book.title}`}
        >
          Edit
        </Button>

        <Button
          size="small"
          color="error"
          onClick={() => onDelete(book)}
          aria-label={`Delete ${book.title}`}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  )
}