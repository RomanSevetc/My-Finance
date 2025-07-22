import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import {Telegram, Instagram, WhatsApp} from "@mui/icons-material";
import { Box } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === "light"
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
        p: 5,
        width: "100%",
        flexShrink: 0,
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 5,
          flexWrap: "wrap",
          maxWidth: "lg",
          margin: "0 auto",
          maxHeight: "100px",
        }}
      >
        {/* Первая колонка */}
        <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "200px" } }}>
          <Typography variant="h6" color="text.primary" gutterBottom>
            About Us
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Solo project developed by a student of the BMSTU University in Kaluga, Russia. The project is focused on personal finance management, allowing users to track their expenses and income, analyze financial data, and make informed decisions about their finances.
          </Typography>
        </Box>

        {/* Вторая колонка */}
        <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "200px" } }}>
          <Typography variant="h6" color="text.primary" gutterBottom>
            Contact Us
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Kaluga, Russia
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Email: info@example.com
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Phone: +1 234 567 8901
          </Typography>
        </Box>

        {/* Третья колонка */}
        <Box>
          <Typography variant="h6" color="text.primary" gutterBottom>
            Follow Us
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Link href="https://www.whatsapp.com/" color="inherit">
              <WhatsApp />
            </Link>
            <Link href="https://www.instagram.com/" color="inherit">
              <Instagram />
            </Link>
            <Link href="https://web.telegram.org/" color="inherit">
              <Telegram />
            </Link>
          </Box>
        </Box>
      </Box>

      <Box mt={5}>
        <Typography variant="body2" color="text.secondary" align="center">
          {"Copyright © "}
          <Link color="inherit" href="https://your-website.com/">
            MyFinance
          </Link>{" "}
          {new Date().getFullYear()}
          {"."}
        </Typography>
      </Box>
    </Box>
  );
}