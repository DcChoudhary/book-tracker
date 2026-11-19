import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#315c45" },
    secondary: { main: "#b76b4b" },
    background: {
      default: "#f5f3ec",
      paper: "#fffefa",
    },
    text: {
      primary: "#24352b",
      secondary: "#68766d",
    },
  },
  shape: {
    borderRadius: 14,
  },
});