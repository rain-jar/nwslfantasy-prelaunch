import React, { useState } from "react";
import { Box, Button, TextField, Typography, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ProfileScreen = ({ onSave }) => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const handleSaveProfile = async () => {
    if (!userName) {
      alert("Please enter User Name.");
      return;
    }

    // Simulate saving the profile
    await onSave(userName);

    // Navigate to CreateJoinScreen
    navigate("/create-join");
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "2rem",
          textAlign: "center",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Create Your Profile
        </Typography>
        <TextField
          label="Enter Your Name"
          variant="outlined"
          fullWidth
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          sx={{ marginBottom: "1.5rem" }}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ padding: "0.75rem", fontSize: "1rem" }}
          onClick={handleSaveProfile}
        >
          Save Profile
        </Button>
      </Container>
    </Box>
  );
};

export default ProfileScreen;
