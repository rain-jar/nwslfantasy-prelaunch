import React from "react";
import { Box, Button, Typography, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

const WelcomeScreen = () => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
      //  backgroundImage: "url('/NWSLWelcomeScreen.png')", // Replace with your image path
        backgroundColor: "black",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          backgroundColor: "rgba(16, 12, 12, 0)",
          borderRadius: "16px",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <Box
          component="img"
          src={`./WoSoLogo.png`} // Replace with your image name
          alt="NWSL Fantasy Logo"
          sx={{
            width: "300px",
            height: "300px",
            margin: "0 auto 1.5rem auto",
            display: "block",
            maskImage: "radial-gradient(circle, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage: "radial-gradient(circle, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)",
          }}
        />
        <Typography variant="h3" sx={{color: "white"}} gutterBottom>
          Welcome to NWSL Fantasy
        </Typography>
        <Typography variant="h6" sx={{color: "white"}}gutterBottom>
          Select an option to continue:
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            sx={{
              borderColor: "#1976d2",
              color: "#1976d2",
              borderRadius: "50px",
              padding: "1rem",
              fontSize: "1rem",
              '&:hover': {
                backgroundColor: "#1976d2",
                color: "#fff"
              }
            }}
            onClick={() => navigate("/create-profile")}
          >
            Create Profile
          </Button>
          <Button
            variant="outlined"
            sx={{
              borderColor: "#1976d2",
              color: "#1976d2",
              borderRadius: "50px",
              padding: "1rem",
              fontSize: "1rem",
              '&:hover': {
                backgroundColor: "#1976d2",
                color: "#fff"
              }
            }}
            onClick={() => navigate("/existing-user")}
          >
            Existing User
          </Button>
          <Button
            variant="outlined"
            sx={{
              borderColor: "#1976d2",
              color: "#1976d2",
              borderRadius: "50px",
              padding: "1rem",
              fontSize: "1rem",
              '&:hover': {
                backgroundColor: "#1976d2",
                color: "#fff"
              }
            }}
            onClick={() => navigate("/players")}
          >
            Players
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default WelcomeScreen;
