import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Container, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLeague } from "../LeagueContext";

const ProfileListScreen = ({ onSelect }) => {
  const { users } = useLeague();
  const [profiles, setProfiles] = useState([...users]);
  const navigate = useNavigate();

  useEffect(() => {
    setProfiles(users);
  }, [users]);

  const handleSelectUser = async (userId) => {
    await onSelect(userId);
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
          Select Your Profile
        </Typography>
        {profiles.length === 0 ? (
          <Typography variant="body1">No users found. Create a new profile.</Typography>
        ) : (
          <List>
            {profiles.map((profile) => (
              <ListItem key={profile.id} disablePadding>
                <ListItemButton onClick={() => handleSelectUser(profile.id)}>
                  <ListItemText primary={profile.user_name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Container>
    </Box>
  );
};

export default ProfileListScreen;
