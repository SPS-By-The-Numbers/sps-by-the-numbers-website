"use client";

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

export default function BottomNav() {
  return (
    <>
      <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0 }}>
        <Toolbar
          variant="dense"
          sx={{
            padding: "0.4ex",
            justifyContent: "center",
            minHeight: 0,
          }}>
          <Typography variant="caption">SPS By The Numbers • Powered by Sleep Deprived Parents</Typography>
        </Toolbar>
      </AppBar>
    </>
  );
}
