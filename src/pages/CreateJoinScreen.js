import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Container, TextField, List, ListItem, ListItemButton, ListItemText, Card, CardContent } from "@mui/material";
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
/*
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
*/

  return (
    <div>
      <div className="create-join-screen">
        {/* League Selection Card */}
        <Card className="league-selection-card">
          <CardContent>
            <Typography variant="h5" className="title">🏆 Your Current Leagues</Typography>
            {leagues.length === 0 ? (
              <Typography className="no-league-text">No leagues found. Create or join a league.</Typography>
            ) : (
              <List>
                {leagues.map((league) => (
                  <ListItem key={league.id} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        onLeagueChosen(league.id);
                        navigate("/players");
                      }}
                      className="league-item"
                    >
                      <ListItemText primary={league.name} secondary={league.team_name} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* League Creation Section */}
        <div className="league-actions">
          {creatingLeague ? (
            <Card className="league-form-card">
              <CardContent>
                <TextField
                  label="Enter League Name"
                  variant="outlined"
                  fullWidth
                  value={leagueName}
                  onChange={(e) => setLeagueName(e.target.value)}
                  className="league-input"
                  InputLabelProps={{ style: { color: '#aaa' } }}
                />
                <Button className="confirm-btn" onClick={handleCreateLeague} fullWidth>
                  Create League
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Button className="action-btn" onClick={() => setCreatingLeague(true)}>
              Create a League
            </Button>
          )}
          
          <Button className="action-btn" onClick={handleJoinLeague}>
            Join a League
          </Button>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`

        html, body {
            overflow-x: hidden; /* ✅ Prevents horizontal scrolling */
            background-color: black; /* ✅ Ensures no white space appears */
        }

        body {
            min-height: 100vh; /* ✅ Ensures body takes full height */
            margin: 0; /* ✅ Removes any default margin that might cause shifting */
            padding: 0;
        }

        .create-join-screen {
          width: 100%;
          background: black;
          color: white;
          text-align: center;
          padding: 20px;
          min-height: 100vh;
          justify-content: space-between;
        }

        .league-selection-card {
          width: 80%;
          margin: 20px auto;
          background: white;
          color: black;
          padding: 15px;
          border-radius: 12px;
          box-shadow: 5px 10px 15px rgba(0, 255, 127, 0.2), -5px -5px 15px rgba(0, 255, 127, 0.1);
        }

        .title {
          font-size: 1.5rem;
          margin-bottom: 15px;
        }

        .no-league-text {
          font-size: 1rem;
          margin-top: 10px;
        }

        .league-item {
          text-align: center;
          color: black;
          background: rgba(5, 5, 5, 0.3); /* ✅ Subtle contrast */
          border: 2px solid rgba(243, 247, 245, 0.5); /* ✅ Greenish border */
          border-radius: 12px; /* ✅ Smooth edges */
          padding: 10px;
          margin: 8px 0; /* ✅ Adds spacing between items */
          box-shadow: 0 4px 10px rgba(0, 255, 127, 0.2); /* ✅ Soft glow effect */
          transition: 0.3s ease-in-out;
        }
                
        .league-item:hover {
          background: rgba(12, 46, 32, 0.8); /* ✅ Slight green tint on hover */
          box-shadow: 0 6px 15px rgba(0, 255, 127, 0.4); /* ✅ Enhanced glow */
        }        

        .league-actions {
          display: flex;
          flex-direction: row;
          justify-content: center; /* ✅ Centers buttons in a row */
          gap: 20px; /* ✅ Adds spacing between buttons */
          align-items: center;
          margin-top: 20px;
        }

        .league-form-card {
          width: 50%;
          background: white;
          color: black;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 5px 5px 15px rgba(0, 255, 127, 0.2), -5px -5px 15px rgba(0, 255, 127, 0.1);
        }

        .league-input {
          background: white;
          color: black;
          margin-bottom: 15px;
        }

        .action-btn {
          background: white;
          color: black;
          border: 2px solid kellygreen;
          border-radius: 30px; /* ✅ Ensures oblong shape */
          padding: 12px 24px; /* ✅ Adds more height & width */
          font-weight: bold;
          font-size: 1rem;
          box-shadow: 0 10px 10px rgba(0, 255, 127, 0.3); /* ✅ Subtle glow effect */
        }

        .action-btn:hover {
          background: darkgreen;
          color: white;
          border-color: darkgreen;
        }

        .confirm-btn {
          background: kellygreen;
          color: black;
          border-radius: 30px; /* ✅ Ensures oblong shape */
          padding: 12px 24px;
          font-weight: bold;
          font-size: 1rem;
          box-shadow: 0 4px 10px rgba(0, 255, 127, 0.3);
        }

        .confirm-btn:hover {
          background: darkgreen;
          color: white;
          border-color: darkgreen;
        }
      `}</style>
    </div>
  );



};

export default CreateJoinScreen;
