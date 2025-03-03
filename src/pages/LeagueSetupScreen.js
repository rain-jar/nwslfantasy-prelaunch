import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Container, TextField, List, ListItem, ListItemButton, ListItemText, MenuItem, Select, Card, CardContent } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useLeague } from "../LeagueContext";
import {subscribeToLeagueInserts} from "../supabaseListeners";


const LeagueSetupScreen = ({onLeagueChosen}) => {
  const location = useLocation();
  const { leagueParticipants, setLeagueParticipants, leagueId} = useLeague();
  
  const { mode, leagueName, createLeagueId, userId, leagues } = location.state;
  const [teamName, setTeamName] = useState("");
  const [leagueType, setLeagueType] = useState("Standard H2H");
  const [availableLeagues, setAvailableLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const navigate = useNavigate();
  

  useEffect(() => {
    const unsubscribe = subscribeToLeagueInserts(setAvailableLeagues);
    supabase.getChannels().forEach(channel => console.log("Active channel:", channel));
    return () => unsubscribe(); // Cleanup
  }, []);

  useEffect(() => {
    if (mode === "join") {
      fetchAvailableLeagues().then((leagueList) => {
        setAvailableLeagues(leagueList);
      });
    }
  }, [mode]);

  useEffect(() => {
    if(mode === "join" && leagueId){
      console.log("Redoing DraftState since LP has changed ", leagueParticipants);
      console.log("Current League Id : ", leagueId );
      reinitializeDraftState(leagueId);
    }
  }, [leagueParticipants, selectedLeague])

  const fetchAvailableLeagues = async (leagueList) => {
    const { data, error } = await supabase.from("leagues").select("*");
    if (error) {
      console.error("Error fetching leagues:", error);
      return;
    }
    leagueList = data;
    console.log("Available Leagues are: ", leagueList);
    console.log("User Leagues ", leagues);
    try{
      const registeredLeagueIds = leagues.map((league) => league.id);
      const joinableLeagues = leagueList.filter((league) => !registeredLeagueIds.some((p) => p === league.league_id)
      );
      console.log("Joinable Leagues", joinableLeagues );
      leagueList = [...joinableLeagues];
    } catch (err) {
      console.error("🔥 Unexpected fetch error:", err);
    }
    return leagueList || [];
  };

  const initializeLeaguePlayers = async (createLeagueId) => {
    try {
      // Fetch all player IDs from players_base
      const { data: players, error: fetchError } = await supabase
        .from("players_base")
        .select("id");
  
      if (fetchError) {
        console.error("❌ Error fetching players:", fetchError.message);
        return;
      }
  
      if (!players || players.length === 0) {
        console.warn("⚠️ No players found in players_base.");
        return;
      }
  
      // Prepare batch insert data
      const leaguePlayersData = players.map((player) => ({
        league_id: createLeagueId,
        player_id: player.id,
        onroster: false, // Default value
      }));
  
      // Insert into league_players
      const { error: insertError } = await supabase
        .from("league_players")
        .insert(leaguePlayersData);
  
      if (insertError) {
        console.error("❌ Error inserting into league_players:", insertError.message);
      } else {
        console.log("✅ League players initialized successfully.");
      }
    } catch (err) {
      console.error("🔥 Unexpected error initializing league_players:", err);
    }
  };


  const fetchLeagueParticipants = async (finalLeagueId) => {
    const { participants, error } = await supabase
      .from("league_rosters")
      .select("*")
      .eq("league_id", finalLeagueId);
      if (!error && participants) {
        setLeagueParticipants(participants);
        console.log("Fetched and set latest leagueparticipants ")
        return {success: true};
      }else {
        return { success: false};
      }
  };

  const reinitializeDraftState = async (finalLeagueId) => {
      const isUpdated = false;
    try {
      // Fetch all player IDs from players_base
      console.log("League Id ", finalLeagueId);

      const { participants, pError } = await supabase.from("league_rosters")
      .select("*")
      .eq("league_id", finalLeagueId);

      if (!pError && participants) {
        isUpdated = true;
        console.log("Participants are ", participants);
      }else{
        console.log("❌ Error fetching leagueParticipants : ", pError);
        console.log("❌ Participants ", participants);
      }


      console.log("Update state is ", isUpdated);


      const { data, fetchError } = await supabase.from("draft_state")
      .select("*")
      .eq("id", finalLeagueId);
  
      if (fetchError) {
        console.error("❌ Error fetching draftState while joining league : ", fetchError.message);
        return;
      }else{
        console.log("Fetched draft-state is ", data[0]);
      }
  
      if (!data || data.length === 0) {
        console.log("⚠️ Draft is not set yet. So setting the draft state for the first time for League: ", finalLeagueId, data);
        const { data: newData, error: insertError } = await supabase
        .from("draft_state")
        .insert([{ id: finalLeagueId, current_round: 1, current_pick: 0, draft_order: leagueParticipants }])
        .select()
        .single();

        if (insertError) {
          console.error("❌ Error inserting into draft_state while joining league:", insertError.message);
        } else {
          console.log("✅ Draft-State set while joining since it wasn't set yet. ", newData);
        }

      }else{
      // Since the draft-state is already set, updating the draft order with latest teams. 
        console.log("Since the draft-state is already set, updating the draft state with reinitialized state.")
        const { data: newData, error: insertError } = await supabase
              .from("draft_state")
              .update({ current_round: 1, current_pick: 0, draft_order: leagueParticipants })
              .eq("id", finalLeagueId)
              .select()
              .single();

              if (insertError) {
                console.error("Error re-initializing draft state while joining:", insertError);
                return;
              }else{
                console.log("✅ Draft-State re-initialized with latest teams ",  newData, leagueParticipants);
              }
      }

    } catch (err) {
      console.error("🔥 Unexpected error initializing draft_state:", err);
    }
  };


  const handleConfirmSetup = async () => {

   // let lpCheck ;
    console.log("Mode is ", mode);
    console.log("League Participants before confirming ", leagueParticipants);
    if (!teamName.trim()) {
      alert("Please enter a team name.");
      return;
    }
    const finalLeagueId = mode === "create" ? createLeagueId : selectedLeague?.league_id;
    if (!finalLeagueId) {
      alert("No league selected.");
      return;
    }

    await onLeagueChosen(finalLeagueId);
    console.log("Waiting for leagueId to change ");

    console.log("League Id before inserting new user ", finalLeagueId);
    const { error } = await supabase.from("league_rosters").insert([
      {
        league_id: finalLeagueId,
        user_id: userId,
        team_name: teamName,
        roster: [],
        status: "active",
      },
    ]);

    if (error) {
      alert("Failed to save league setup.");
      console.error("Supabase error:", error);
      return;
    }else {

      console.log("✅ League Table updated with latest User ");
/*
      if (!leagueParticipants || leagueParticipants.length === 0){
        lpCheck = await fetchLeagueParticipants();
      }

      console.log("League Participants after confirming ", leagueParticipants);
      */
    }

    if (mode === "create"){
        await initializeLeaguePlayers(createLeagueId);
      //  await (initializeLeagueDraftState(leagueId);
    }else{
        console.log("Players table for this league is already setup because mode is : ", mode);
        console.log("Checking and if needed re-initializing draft-state. Mode : ", finalLeagueId);
        await reinitializeDraftState(finalLeagueId);
        console.log("waited for draft-state reinitialization");
    }

    navigate("/players");
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
        maxWidth="md"
        sx={{
          backgroundColor: "#333",
          borderRadius: "16px",
          padding: "2rem",
          color: "#fff",
        }}
      >
        <Typography variant="h4" gutterBottom textAlign="center">
          {mode === "create" ? "Create League" : "Join a League"}
        </Typography>

        {mode === "create" ? (
          <>
            <Typography variant="h6">League: {leagueName}</Typography>
            <Typography variant="h6" sx={{ mt: 3 }}>League Type</Typography>
            <Select
              value={leagueType}
              disabled
              fullWidth
              sx={{ backgroundColor: "#555", color: "#fff", mt: 1 }}
            >
              <MenuItem value="Standard H2H">Standard H2H</MenuItem>
            </Select>

            <Typography variant="h6" sx={{ mt: 3 }}>Your Team Name</Typography>
            <TextField
              placeholder="Enter Team Name"
              fullWidth
              sx={{ mt: 1, backgroundColor: "#555", color: "#fff" }}
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />

            <Button
              variant="contained"
              sx={{ mt: 4, width: "100%" }}
              onClick={() => {
                handleConfirmSetup();
                }}
            >
              Confirm & Proceed
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h6" sx={{ mt: 3 }}>Select a League</Typography>
            <List>
              {availableLeagues.map((league) => (
                <ListItem key={league.league_id} disablePadding>
                  <ListItemButton
                    sx={{ textAlign: "center" }}
                    onClick={() => {
                        setSelectedLeague(league);
                    }}
                  >
                    <ListItemText primary={league.league_name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            {selectedLeague && (
              <>
                <Typography variant="h6" sx={{ mt: 3 }}>Your Team Name</Typography>
                <TextField
                  placeholder="Enter Team Name"
                  fullWidth
                  sx={{ mt: 1, backgroundColor: "#555", color: "#fff" }}
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />

                <Button
                  variant="contained"
                  sx={{ mt: 4, width: "100%" }}
                  onClick={handleConfirmSetup}
                >
                  Join League
                </Button>
              </>
            )}
          </>
        )}
      </Container>
    </Box>
  );
*/
return (
  <div>
    <div className="league-setup-screen">
      {/* League Setup Card */}
      <Card className="league-setup-card">
        <CardContent>
          <Typography variant="h5" className="title">
            {mode === "create" ? "Create League" : "Join a League"}
          </Typography>

          {mode === "create" ? (
            <>
              <Typography variant="h6" className="league-info">League: {leagueName}</Typography>
              <Typography variant="h6" className="league-info">League Type</Typography>
              <Select
                value={leagueType}
                disabled
                fullWidth
                className="league-select"
              >
                <MenuItem value="Standard H2H">Standard H2H</MenuItem>
              </Select>

              <Typography variant="h6" className="league-info">Your Team Name</Typography>
              <TextField
                placeholder="Enter Team Name"
                fullWidth
                className="team-name-input"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />

              <Button className="confirm-btn" onClick={handleConfirmSetup}>
                Confirm & Proceed
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h6" className="league-info">Select a League</Typography>
              <List>
                {availableLeagues.map((league) => (
                  <ListItem key={league.league_id} disablePadding>
                    <ListItemButton
                      className="league-item"
                      onClick={() => {
                        setSelectedLeague(league);
                        console.log ("Selected League ", league.league_id);
                      }}
                    >
                      <ListItemText primary={league.league_name} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>

              {selectedLeague && (
                <>
                  <Typography variant="h6" className="league-info">Your Team Name</Typography>
                  <TextField
                    placeholder="Enter Team Name"
                    fullWidth
                    className="team-name-input"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />

                  <Button className="confirm-btn" onClick={handleConfirmSetup}>
                    Join League
                  </Button>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
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

      .league-setup-screen {
        width: 100%;
        background: black;
        color: white;
        text-align: center;
        padding: 20px;
        min-height: 100vh;
        justify-content: space-between;
      }

      .league-setup-card {
        width: 80%;
        margin: 20px auto;
        background: white;
        color: black;
        padding: 15px;
        border-radius: 12px;
        box-shadow: 5px 5px 15px rgba(0, 255, 127, 0.2), -5px -5px 15px rgba(0, 255, 127, 0.1);
      }

      .title {
        font-size: 1.5rem;
        margin-bottom: 15px;
      }

      .league-info {
        font-size: 1.1rem;
        margin-top: 15px;
      }

      .league-select {
        background: white;
        color: black;
        border-radius: 5px;
        margin-top: 10px;
      }

      .team-name-input {
        background: white;
        color: black;
        margin-top: 10px;
        border-radius: 5px;
      }

      .league-item {
          text-align: center;
          color: black;
          background: rgba(5, 5, 5, 0.3); /* ✅ Subtle contrast */
          border: 2px solid rgba(243, 247, 245, 0.5); /* ✅ Greenish border */
          border-radius: 12px; /* ✅ Smooth edges */
          padding: 10px;
          margin: 8px 0; /* ✅ Adds spacing between items */
          box-shadow: 0 4px 10px rgba(7, 43, 25, 0.2); /* ✅ Soft glow effect */
          transition: 0.3s ease-in-out;
      }

      .league-item:hover {
        background: rgba(14, 59, 37, 0.8);
        box-shadow: 0 6px 15px rgba(12, 52, 32, 0.4);
      }

      .confirm-btn {
        background: kellygreen;
        color: black;
        border-radius: 30px;
        padding: 12px 24px;
        font-weight: bold;
        font-size: 1rem;
        box-shadow: 0 4px 10px rgba(0, 255, 127, 0.3);
        margin-top: 20px;
      }

      .confirm-btn:hover {
        background: darkgreen;
        color: white;
      }
    `}</style>
  </div>
);


};

export default LeagueSetupScreen;
