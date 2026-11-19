import { Box, Typography } from "@mui/material"

export default function AppHeader() {
  return (
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
  )
}