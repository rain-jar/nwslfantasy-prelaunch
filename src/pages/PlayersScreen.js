import React from "react";
import { TextField, Button, Select, MenuItem, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { LeagueProvider, useLeague } from "../LeagueContext";
import NavigationBar from "../NavigationBar";



const PlayersScreen = ({playersBase}) => {

  const { availablePlayers, setAvailablePlayer } = useLeague();
  const { leagueParticipants, setLeagueParticipants, userId } = useLeague();

  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("All");
  const [teamFilter, setTeamFilter] = useState("");
  const [statsFilter, setStatsFilter] = useState("2024");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");


  const [playerStats, setPlayerStats] = useState([...playersBase]);
  const [filteredPlayers, setFilteredPlayers] = useState([...playersBase]);
  const [isDataFetched, setIsDataFetched] = useState(false);

  const positions = ["All", "FW", "MF", "DF", "GK"];
  const teams = ["Spirit"]; // More teams can be added
  const statsSeasons = ["2024", "Week 1"]; // More seasons can be added

  const players = []; // Placeholder for player data

  const fetchPlayerStats = async () => {
    if (!isDataFetched) {
      console.log("Fetching Player Stats...");
      const { data, error } = await supabase.from("players_base").select("*");
      if (error) {
        console.error("Error fetching player stats:", error);
        return;
      }
      setPlayerStats(data);
      setFilteredPlayers(data);
      setIsDataFetched(true);
      console.log("Players Base data is fetched", data);
    }
  };
/*
  useEffect(() => {
    fetchPlayerStats();
  }, []);
*/
  useEffect(() => {
    fetchPlayers().then((updatedList) => {
      console.log("updated List ", updatedList);
      filterPlayers(updatedList); // Pass fetched list for filtering
    });
  }, [search, positionFilter, teamFilter, statsFilter, availablePlayers]);

  
  const fetchPlayers = async (playerListTemp) => {
    try{
      let playerListFull, matchData, error1, error2;
      console.log("starting to fetch players for: ", statsFilter);
      console.log("available Players list is ". availablePlayers);
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

      if (statsFilter === "2024") {
        console.log("For season filter - returning playerListFull");
        playerListTemp = playerListFull;
        return playerListTemp;

      } else if (statsFilter === "Week 1") {
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
        console.log("New Player View merged for Weekly data", mergedPlayers);
        playerListTemp = mergedPlayers;
        return playerListTemp;
      }
    } catch (err) {
      console.error("🔥 Unexpected fetch error:", err);
    }
};




  const filterPlayers = (updatedList) => {
    console.log("Inside Filters");
    let filtered = [...playerStats];

    if (statsFilter) {
      filtered = [...updatedList];
    }
  
    if (search) {
      filtered = filtered.filter((player) =>
        player.name.toLowerCase().includes(search.toLowerCase())
      );
    }
  
    if (positionFilter && positionFilter !== "All") {
      filtered = filtered.filter((player) => player.position.includes(positionFilter));
    }
  
    if (teamFilter) {
      filtered = filtered.filter((player) => player.team === teamFilter);
    }
  
    setFilteredPlayers(filtered);
    console.log("🔄 Filtered Players:", filtered);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  
    const sortedPlayers = [...filteredPlayers].sort((a, b) => {
      let valA = a[field];
      let valB = b[field];
  
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
  
      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }
  
      return sortOrder === "asc" ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  
    setFilteredPlayers(sortedPlayers);
  };
  


  return (
    <div>
      <NavigationBar/>
        <div className="players-screen">
          <h1 className="title">Player List</h1>
          
          {/* Search Bar */}
          <TextField 
            variant="outlined" 
            placeholder="Search players..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
          />
          
          {/* Position Filters */}
          <div className="position-filters">
            {positions.map((pos) => (
              <Button 
                key={pos} 
                onClick={() => setPositionFilter(pos)}
                className={`filter-btn ${positionFilter === pos ? "active" : ""}`}
              >
                {pos}
              </Button>
            ))}
          </div>
          
          {/* Team & Stats Filters */}
          <div className="dropdown-filters">
            <Select 
              value={teamFilter} 
              onChange={(e) => setTeamFilter(e.target.value)} 
              className="filter-select"
              style={{ minWidth: "150px" }}
              displayEmpty
            >
              <MenuItem value="">All Teams</MenuItem>
              {teams.map((team) => (
                <MenuItem key={team} value={team}>{team}</MenuItem>
              ))}
            </Select>
            
            <Select value={statsFilter} onChange={(e) => setStatsFilter(e.target.value)} className="filter-select">
              {statsSeasons.map((season) => (
                <MenuItem key={season} value={season}>{season}</MenuItem>
              ))}
            </Select>
          </div>
          
          {/* Players Table */}
          <TableContainer component={Paper} className="players-table">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>   </TableCell>
                  <TableCell>   </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell>Pos</TableCell>
                  <TableCell onClick={() => handleSort("FantasyPoints")} style={{ cursor: "pointer" }}>Fpts</TableCell>
                  <TableCell onClick={() => handleSort("Minutes")} style={{ cursor: "pointer" }}>Mins</TableCell>
                  <TableCell onClick={() => handleSort("goals")} style={{ cursor: "pointer" }}>Gls</TableCell>
                  <TableCell onClick={() => handleSort("assists")} style={{ cursor: "pointer" }}>Ast</TableCell>
                  <TableCell onClick={() => handleSort("PKMissed")} style={{ cursor: "pointer" }}>PKM</TableCell>
                  <TableCell onClick={() => handleSort("Goals Against")} style={{ cursor: "pointer" }}>GA</TableCell>
                  <TableCell onClick={() => handleSort("Saves")} style={{ cursor: "pointer" }}>Svs</TableCell>
                  <TableCell onClick={() => handleSort("Yellow Cards")} style={{ cursor: "pointer" }}>YC</TableCell>
                  <TableCell onClick={() => handleSort("Red Cards")} style={{ cursor: "pointer" }}>RC</TableCell>
                  <TableCell onClick={() => handleSort("Clean Sheet")} style={{ cursor: "pointer" }}>CS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPlayers.map((player, index) => (
                  <TableRow key={index}>
                    <TableCell><Button className="add-btn" sx={{"&:hover": {backgroundColor: "kellygreen", color: "black"}}}>Add</Button></TableCell>
                    <TableCell><img src={process.env.PUBLIC_URL + "/placeholder.png"} alt={player.name} className="player-img" /></TableCell>
                    <TableCell>{player.name}</TableCell>
                    <TableCell>{player.team}</TableCell>
                    <TableCell>{player.position}</TableCell>
                    <TableCell>{player.FantasyPoints}</TableCell>
                    <TableCell>{player.Minutes}</TableCell>
                    <TableCell>{player.goals}</TableCell>
                    <TableCell>{player.assists}</TableCell>
                    <TableCell>{player.PKMissed}</TableCell>
                    <TableCell>{player["Goals Against"]}</TableCell>
                    <TableCell>{player.Saves}</TableCell>
                    <TableCell>{player["Yellow Cards"]}</TableCell>
                    <TableCell>{player["Red Cards"]}</TableCell>
                    <TableCell>{player["Clean Sheet"]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Styles */}
          <style jsx>{`
            .players-screen {
              width: 100%;
              background: black;
              color: white;
              text-align: center;
              padding: 20px;
            }

            .title {
              font-size: 2rem;
              margin-bottom: 20px;
            }

            .search-bar {
              width: 50%;
              background: white;
              border-radius: 20px;
              margin-bottom: 20px;
            }

            .position-filters {
              display: flex;
              justify-content: center;
              gap: 10px; /* Adds space between buttons */
              margin-bottom: 20px;
            }

            .filter-btn {
              border-radius: 20px;
              background: white;
              color: black;
              transition: 0.3s;
              min-width: 80px;
            }

            .filter-btn:hover {
              background: kellygreen;
              color: black;
            }

            .filter-btn.active {
              background: darkgreen; /* Ensures contrast */
              color: white;
              font-weight: bold;
            }

            .dropdown-filters {
              display: flex;
              justify-content: center;
              gap: 10px; /* Adds space between buttons */
              margin-bottom: 20px;
            }

            .filter-select {
              background: white;
              color: black;
              border-radius: 10px;
              min-width: 150px;
              padding: 1px;
            }

            .filter-select .MuiSelect-icon {
              color: black; /* Ensures dropdown arrow visibility */
            }

            .MuiMenu-paper {
              background: white !important;
              color: black !important;
            }

            .add-btn {
              border-radius: 20px;
              background: white;
              color: black;
              transition: 0.3s;
            }

            .add-btn:hover {
              background: kellygreen !important;
              color: black !important;
            }

            
            .player-img {
              width: 40px;
              height: 40px;
              border-radius: 50%;
            }

            .players-table {
              width: 90%;
              margin: 0 auto;
              background: white;
              font-family: "American Typewriter", serif;
            }
          `}</style>
        </div>
    </div>
  );
};

export default PlayersScreen;

