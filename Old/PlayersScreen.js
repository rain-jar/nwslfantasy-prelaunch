import React, { useState, useEffect } from "react";
import {
  Box, Button, Typography, Container, TextField, Select, MenuItem, List, ListItem, ListItemButton, ListItemText, Modal, Paper, Grid, InputLabel, FormControl
} from "@mui/material";
import { supabase } from "../src/supabaseClient";
import { useLeague } from "../src/LeagueContext";

const PlayersScreen = ({playersBase}) => {
  const { availablePlayers, setAvailablePlayers, leagueId } = useLeague();
  const { leagueParticipants, setLeagueParticipants, userId } = useLeague();
 // const [playerStats, setPlayerStats] = useState([...playersBase]);
  const [players, setPlayers] = useState([...playersBase]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [isDataFetched, setIsDataFetched] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state


  useEffect(() => {
    fetchPlayers().then((updatedList) => {
      setPlayers(updatedList); // Pass fetched list for filtering
    });
  }, [availablePlayers]);


    const fetchPlayers = async (playerListTemp) => {
      try{
        let playerListFull, matchData, error1, error2;
  //      console.log("starting to fetch players for: ", selectedStatsType);
        playerListFull = availablePlayers.map((player) => {
          const seasonMerge = playersBase.find((m) => m.id === player.player_id) || {};
          return {
            ...player,
            name : seasonMerge.name || "",
            team : seasonMerge.team || "",
            position : seasonMerge.position || "",
            goals: seasonMerge.goals || 0,
            assists: seasonMerge.assists || 0,
            Minutes: seasonMerge.Minutes || 0,
            PKMissed: seasonMerge.PKMissed || 0,
            "Goals Against": seasonMerge["Goals Against"] || 0,
            Saves: seasonMerge.Saves || 0,
            "Clean Sheet": seasonMerge["Clean Sheet"] || 0,
            "Yellow Cards": seasonMerge["Yellow Cards"] || 0,
            "Red Cards": seasonMerge["Red Cards"] || 0,
            image_url : seasonMerge.image_url || "",
            FantasyPoints: seasonMerge.FantasyPoints || 0,
          };
        });
        console.log("✅ Season - Full Available Player List :", playerListFull);

 //       if (selectedStatsType === "season") {
          console.log("For season filter - returning playerListFull");
          playerListTemp = playerListFull;
//          setPlayers(playerListTemp);
          return playerListTemp;
/*
        } else if (selectedStatsType === "week1") {
          // Fetch Match Stats
          ({ data: matchData, error: error2 } = await supabase
            .from("players")
            .select("*"));
          //  .eq("week", 1)); 
          if (error2) 
            throw new Error("❌ Error fetching match stats: " + error2.message);
          else
            console.log("fetched weekly data: ", matchData);

          // 🔄 **Merge Data: Default to 0s if player has no match data**
          const mergedPlayers = playerListFull.map((player) => {
            const matchStats = matchData.find((m) => m.id === player.player_id) || {};
            return {
              ...player,
              goals: matchStats.goals || 0,
              assists: matchStats.assists || 0,
              Minutes: matchStats.Minutes || 0,
              PKMissed: matchStats.PKMissed || 0,
              "Goals Against": matchStats["Goals Against"] || 0,
              Saves: matchStats.Saves || 0,
              "Clean Sheet": matchStats["Clean Sheet"] || 0,
              "Yellow Cards": matchStats["Yellow Cards"] || 0,
              "Red Cards": matchStats["Red Cards"] || 0,
              FantasyPoints: matchStats.FantasyPoints || 0,
            };
          }); 
         // setPlayerList(mergedPlayers);  
          console.log("New Player View merged for Weekly data", mergedPlayers);
          playerListTemp = mergedPlayers;
          return playerListTemp;
        }
          */
      } catch (err) {
        console.error("🔥 Unexpected fetch error:", err);
      }
  };
/*
  const filterAndSortPlayers = async(updatedList) => {
    console.log("filter is called");
    let filtered = players;

    if (selectedStatsType)
      filtered = [...updatedList];
      console.log("playerList is updated in Filter due to Stats Filter", updatedList);
      console.log("filterList is updated in Filter due to Stats Filter", filtered);


    if (searchQuery) {
      filtered = filtered.filter((player) =>
        player.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedPosition) {
      filtered = filtered.filter((player) => player.position.includes(selectedPosition));
    }

    if (selectedTeam) {
      filtered = filtered.filter((player) => player.team === selectedTeam);
    }

    filtered.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (sortField === "goals" || sortField === "assists" || sortField === "Minutes" || sortField === "FantasyPoints") {
        valA = Number(valA);
        valB = Number(valB);
      }
      if (sortOrder === "asc") return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    if (JSON.stringify(filtered) !== JSON.stringify(players)) {
      setPlayers(filtered);
      console.log("🔄 setPlayers updated inside Player Filter!");
    } else {
      console.log("⚡ No change in player data, avoiding re-render.");
    }
  };
  */


  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilter = (list) => {
    return list
      .filter((player) =>
        player.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter((player) => (selectedPosition ? player.position === selectedPosition : true))
      .filter((player) => (selectedTeam ? player.team === selectedTeam : true));
  };

  const handleSort = (list) => {
    return list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      return sortOrder === "asc" ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  };



  const handleAddPlayer = (player) => {
    setSelectedPlayer(player);
    setModalOpen(true);
  };
  console.log("Players ", players);
  console.log("Available players ", availablePlayers);

  const filteredAndSortedPlayers = handleSort(handleFilter([...players]));

  console.log("Players List ", filteredAndSortedPlayers);

      // Adding a Player --> check for Team empty spots
      const confirmAddPlayer = (player) => {
        const teamRoster = leagueParticipants.find((participant) => participant.user_id == userId).roster

        console.log("current Roster before checking and adding ", teamRoster);
        console.log("player data before adding ",player);


        const maxPlayersPerTeam = 11;
        const minPositions = { FW: 1, MF: 3, DF: 3, GK: 1 };
        const maxPositions = { FW: 4, MF: 5, DF: 5, GK: 1 };

        const positionCount = {
            FW: teamRoster.filter(p => p.position.includes("FW")).length,
            MF: teamRoster.filter(p => p.position.includes("MF")).length,
            DF: teamRoster.filter(p => p.position.includes("DF")).length,
            GK: teamRoster.filter(p => p.position.includes("GK")).length
            };
        
            // Position constraints
            if (player.position.includes("GK") && positionCount.GK >= maxPositions.GK) { return;}
            if (teamRoster.length >= maxPlayersPerTeam) {return;}
        
            if (teamRoster.length < maxPlayersPerTeam) {
            const playerPositions = player.position.split("-");
            const canFit = playerPositions.some(pos => positionCount[pos] < maxPositions[pos]);
            if (!canFit) {return;}
            }
        
            // **Min Position Check**: If the team is reaching 11 players, ensure all min requirements are met
            if (teamRoster.length === maxPlayersPerTeam - 1) {
                for (const pos in minPositions) {
                    if (positionCount[pos] < minPositions[pos] && !player.position.includes(pos)) {
                    return false; // This pick would make the team invalid
                    }
                }
            }           

       //   onAdd(player); // Add player to My Team
          console.log(`Player added: ${selectedPlayer.name}`);
          setModalOpen(false);
          setSelectedPlayer(null);
    }

  return (
    <Box sx={{ height: "100vh", backgroundColor: "#1E1E1E", padding: 4 }}>
      <Container maxWidth="lg" sx={{ backgroundColor: "#333", borderRadius: "16px", padding: "2rem", color: "#fff" }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          Players List
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Players"
              variant="outlined"
              value={searchQuery}
              onChange={handleSearch}
              sx={{ backgroundColor: "#555", color: "#fff" }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Position</InputLabel>
              <Select value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="FW">Forward</MenuItem>
                <MenuItem value="MF">Midfielder</MenuItem>
                <MenuItem value="DF">Defender</MenuItem>
                <MenuItem value="GK">Goalkeeper</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortField} onChange={(e) => setSortField(e.target.value)}>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="team">Team</MenuItem>
                <MenuItem value="position">Position</MenuItem>
                <MenuItem value="FantasyPoints">Fantasy Points</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <List>
          {filteredAndSortedPlayers.map((player) => (
            <ListItem key={player.id} divider>
              <ListItemText
                primary={`${player.name} - ${player.team}`}
                secondary={`Position: ${player.position} | Fantasy Points: ${player.FantasyPoints}`}
              />
              <Button variant="outlined" onClick={() => handleAddPlayer(player)}>
                Add
              </Button>
            </ListItem>
          ))}
        </List>

        {/* Add Player Confirmation Modal */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <Paper sx={{ padding: 4, margin: "auto", mt: 10, maxWidth: 400 }}>
            <Typography variant="h6">
              Add {selectedPlayer?.name} to your team?
            </Typography>
            <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
              <Button variant="contained" onClick={confirmAddPlayer}>
                Confirm
              </Button>
              <Button variant="outlined" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
            </Box>
          </Paper>
        </Modal>
      </Container>
    </Box>
  );
};

export default PlayersScreen;
