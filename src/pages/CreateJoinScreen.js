import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Container, TextField, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useLeague } from "../LeagueContext";

const CreateJoinScreen = ({ currentUser, onLeagueChosen }) => {
  const [leagues, setLeagues] = useState([]);
  const [leagueName, setLeagueName] = useState("");
  const [creatingLeague, setCreatingLeague] = useState(false);
  const navigate = useNavigate();

  // Fetch user's leagues
  useEffect(() => {
    const fetchUserLeagues = async () => {
      if (!currentUser?.id) {
        console.error("❌ currentUserId is undefined, skipping query.");
        return;
      }
      const { data, error } = await supabase
        .from("league_rosters")
        .select("league_id, leagues(league_name), team_name")
        .eq("user_id", currentUser.id);

      if (error) {
        console.error("Error fetching user leagues:", error);
      } else {
        setLeagues(data.map((entry) => ({
          id: entry.league_id,
          name: entry.leagues.league_name,
          team_name: entry.team_name
        })));
      }
    };
    fetchUserLeagues();
  }, [currentUser]);

  // Create a league
  const handleCreateLeague = async () => {
    if (!leagueName.trim()) {
      alert("Enter a league name.");
      return;
    }

    const { data, error } = await supabase
      .from("leagues")
      .insert([{ league_name: leagueName, commissioner_id: currentUser.id }])
      .select()
      .single();

    if (error) {
      console.error("Error creating league:", error);
      alert("Failed to create league.");
      return;
    }
    console.log("User Leagues ", leagues);
    navigate("/league-setup", { state: { mode: "create", leagueName, leagueId: data.league_id, userId: currentUser.id, leagues } });
  };

  // Join a league
  const handleJoinLeague = async () => {
    const { data, error } = await supabase.from("leagues").select("*");

    if (error) {
      console.error("Error fetching leagues:", error);
      return;
    }
    navigate("/league-setup", { state: { mode: "join", userId: currentUser.id, leagues } });
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1E1E1E",
        padding: 3,
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          backgroundColor: "#333",
          borderRadius: "16px",
          padding: "2rem",
          textAlign: "center",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          color: "#fff",
        }}
      >
        <Typography variant="h4" gutterBottom>
          🏆 Your Current Leagues
        </Typography>
        {leagues.length === 0 ? (
          <Typography>No leagues found. Create or join a league.</Typography>
        ) : (
          <List>
            {leagues.map((league) => (
              <ListItem key={league.id} disablePadding>
                <ListItemButton
                  onClick={() => {
                    onLeagueChosen(league.id);
                    navigate("/players");
                  }}
                >
                  <ListItemText sx={{ textAlign: "center", color:"white" }} primary={league.name} secondary={league.team_name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}

        {creatingLeague ? (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Enter League Name"
              variant="outlined"
              fullWidth
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
              sx={{ marginBottom: 2, backgroundColor: "#555", color: "#fff" }}
              InputLabelProps={{ style: { color: '#aaa' } }}
            />
            <Button variant="contained" onClick={handleCreateLeague} fullWidth>
              Create League
            </Button>
          </Box>
        ) : (
          <Button
            variant="outlined"
            sx={{ mt: 2, color: "#4CAF50", borderColor: "#4CAF50" }}
            onClick={() => setCreatingLeague(true)}
          >
            Create a League
          </Button>
        )}

        <Button
          variant="outlined"
          sx={{ mt: 2, color: "#4CAF50", borderColor: "#4CAF50" }}
          onClick={handleJoinLeague}
        >
          Join a League
        </Button>
      </Container>
    </Box>
  );
};

export default CreateJoinScreen;
