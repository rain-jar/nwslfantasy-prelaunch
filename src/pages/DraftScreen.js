import React, { useState, useEffect } from "react";
import { Button, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, Card, CardContent, Typography } from "@mui/material";
import NavigationBar from "../NavigationBar";
import { useLeague } from "../LeagueContext";
import { supabase } from "../supabaseClient";
import {subscribeToDraftUpdates} from "../supabaseListeners";

const DraftScreen = ({playersBase}) => {

    const { availablePlayers, setAvailablePlayers, leagueId, users, userId, userLeagues } = useLeague();
    const { leagueParticipants, setLeagueParticipants} = useLeague();
    const [positionFilter, setPositionFilter] = useState("All");
    
    const [players, setPlayers] = useState([...availablePlayers]);
    const [filteredPlayers, setFilteredPlayers] = useState([...availablePlayers]);
    const [loading, setLoading] = useState(false); // Add loading state
    const [draftTurn, setdraftTurn] = useState(false);
    const [draftStateId, setDraftStateId] = useState(null);
    const [currentRound, setCurrentRound] = useState(1);
    const [currentPick, setCurrentPick] = useState(0);
    const [draftOrder, setDraftOrder] = useState([users]);
    const [isDrafting, setIsDrafting] = useState(false); 
    


    const positions = ["All", "FW", "MF", "DF", "GK"];
    let leagueName;

    const leagueNameArray = userLeagues.find((participant) => participant.id === leagueId);
    if (leagueNameArray) {
        leagueName = leagueNameArray.name;
    }else{
        leagueName = "Fantasy League";
    }
 //   const currentRound = 1; // Placeholder for now
    const playersLeft = 30; // Placeholder for now
    const userTurn = false; // Placeholder - will be dynamic later
    console.log("Available Players ", availablePlayers);
    console.log("Players ", players);
    console.log("filteredPlayers ", filteredPlayers);

    useEffect(() => {
        const unsubscribe = subscribeToDraftUpdates(setCurrentRound, setCurrentPick, setDraftOrder);
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true); 
            await fetchDraftState();
            console.log("DraftScreen fetches draft state - currentPick:", currentPick, " currentRound:", currentRound);
            setLoading(false);
            console.log(" Loading inside Initial fetches", loading);
        };
    
        fetchInitialData();
    }, [leagueId, leagueParticipants]);


    useEffect(() => {
        const fetchData = async () => {
            console.log("Calling Filters due to filter change");
            await filterPlayers();
        };
        fetchData();
    }, [positionFilter, players]);

    useEffect(() => {
        console.log("After listening to the PlayerUpdate listener ", loading);
        const fetchMergedData = async() => {
            if (!loading && availablePlayers?.length > 0) {
                console.log("Fetched Available Players from Listener ", availablePlayers);
                await mergeFunc();
                console.log("Did you wait for FilterPlayers in MergeFunc?");
            }
        }
        fetchMergedData();
      }, [availablePlayers, loading]);


    const mergeFunc = async () => {
        const mergedList = availablePlayers.map((player) => {
            const statsMatch = playersBase.find((m) => m.id === player.player_id) || {};
            return {
              ...player,
              name: statsMatch.name || "",
              position: statsMatch.position || "",
              image_url: statsMatch.image_url || "",
            };
          });
          console.log("Merge Func complete");
          setPlayers(mergedList);
          await filterPlayers();
          console.log("Waited for filterPlayers in MergeFunc");
    }

    const teams = leagueParticipants.map((user) => ({
        id: user.user_id,
        name: user.team_name,
        roster: user.roster,
      }));
    
    const currentUser = users.find((user) => user.id === userId );

    const filterPlayers = async() => {
        console.log("Inside Filters ", positionFilter);
        console.log("Players ", players.length);
        let filtered;
        if (positionFilter){
            filtered = [...players];
        }
      
        if (positionFilter && positionFilter !== "All") {
          filtered = filtered.filter((player) => player.position.includes(positionFilter));
        }

        setFilteredPlayers(filtered);
        console.log("🔄 Filtered Players:", filtered);
    };

    const fetchDraftState = async () => {
        try{
          console.log("League Id is ", leagueId);
          console.log("loading in Draft State is ", loading);
          const { data, error } = await supabase.from("draft_state")
          .select("*")
          .eq("id", leagueId);
          console.log("Draft State data fetched before update ", data);
      
          if (error || data.length == 0) {
           console.error("Error fetching draft state:", error);
           const { data: newData, error: insertError } = await supabase
                  .from("draft_state")
                  .insert([{ id: leagueId, current_round: 1, current_pick: 0, draft_order: leagueParticipants }])
                  .select()
                  .single();
  
              if (insertError) {
                  console.error("Error initializing draft state:", insertError);
                  return;
              }
              setDraftStateId(newData.id);
              setCurrentRound(newData.current_round);
              setCurrentPick(newData.current_pick);
              setDraftOrder(newData.draft_order);
              console.log("Draft State is fetched for the first time for League ",leagueId);
              console.log("Initial Draft is : Current Pick: ",newData.currentPick, " CurrentRound: ", newData.currentRound);
              console.log("Whereas Initial App Draft  is : Current Pick: ",currentPick, " CurrentRound: ", currentRound);
  
          } else {
          console.log("Draft Fetch is successful ");
          setDraftStateId(data[0].id);
          setCurrentRound(data[0].current_round);
          setCurrentPick(data[0].current_pick);
          setDraftOrder(data[0].draft_order); // Default to teams if empty
          console.log("Fetch State on App.tsx render ", data, "Current pick: ", data[0].current_pick, " Current Round: ", data[0].current_round, "Draft Order ", data[0].draft_order);
          }
        } catch (err) {
          console.log("🔥 Unexpected fetch error:", err);
        }
    }; 

    console.log("Draft Order team ", draftOrder[currentPick].team_name);
    console.log("Roster is ", draftOrder[currentPick]);
    console.log("Loading ", loading);

// Position Constraints

    const maxPlayersPerTeam = 11;
    const minPositions = { FW: 1, MF: 3, DF: 3, GK: 1 };
    const maxPositions = { FW: 4, MF: 5, DF: 5, GK: 1 };


    const currentTeam = draftOrder[currentPick];

    console.log ("Current Team in DraftScreen is ", currentTeam);
    console.log ("Test ", userLeagues, leagueId);

    // Helper Functions
    const nextTurn = async() => {
        console.log("currentPick: ",currentPick," currentRound: ",currentRound);
        console.log("Draft Order inside Next Turn ", draftOrder);
        let newPick = currentPick;
        let newRound = currentRound;
        let newDraftOrder = [...draftOrder];

        if (newPick < newDraftOrder.length - 1) {
            newPick++;
        } else {
            newRound++;
            newDraftOrder.reverse(); // Reverse for snake draft
            newPick = 0;
        }
        
        // Update local state
        setCurrentPick(newPick);
        setCurrentRound(newRound);
        setDraftOrder(newDraftOrder);
        console.log("currentPick: ",newPick," currentRound: ",newRound)
        
        if (!draftStateId) return;

        // Save draft state to Supabase
        const { error } = await supabase
            .from("draft_state")
            .update({
            current_round: newRound,
            current_pick: newPick,
            draft_order: newDraftOrder
            })
            .eq("id", draftStateId); // Replace with actual draft state row ID
        
        if (error) {
            console.error("Error updating draft state:", error);
        }

    /*
        console.log('came to update after pick'+currentPick+' and draft size is'+draftOrder.length);
        if (currentPick < draftOrder.length - 1) {
            currentPick++;
            console.log('now its pick '+ currentPick);
        } else {
            currentRound++;
            draftOrder.reverse(); // Reverse the draft order for the next round
            currentPick = 0;
            console.log("Pick order has reversed. Current Pick is " + currentPick);
        }
        */
    }

    const isValidPick = (team, player) => {
        const positionCount = {
            FW: team.roster.filter(p => p.position.includes("FW")).length,
            MF: team.roster.filter(p => p.position.includes("MF")).length,
            DF: team.roster.filter(p => p.position.includes("DF")).length,
            GK: team.roster.filter(p => p.position.includes("GK")).length
        };

        // Position constraints
        if (player.position.includes("GK") && positionCount.GK >= maxPositions.GK) {console.log("Already has a GK"); return false;}
        if (team.roster.length >= maxPlayersPerTeam) {console.log("No Spots Left"); return false;}

        if (team.roster.length < maxPlayersPerTeam) {
            const playerPositions = player.position.split("-");
            const canFit = playerPositions.some(pos => positionCount[pos] < maxPositions[pos]);
            if (!canFit) {console.log("Player Position already filled"); return false;}
        }

            // **Min Position Check**: If the team is reaching 11 players, ensure all min requirements are met
            if (team.roster.length === maxPlayersPerTeam - 1) {
                for (const pos in minPositions) {
                if (positionCount[pos] < minPositions[pos] && !player.position.includes(pos)) {
                    return false; // This pick would make the team invalid
                }
                }
            }

        return true;
    }


    const handleDraft = async(player) => {
        if (isDrafting) return; // Prevent duplicate drafts
        setIsDrafting(true);

        console.log("Drafting team is "+ draftOrder[currentPick].team_name);

        if (userId != draftOrder[currentPick].user_id){
            console.log ("It's not the current user's turn");
            setdraftTurn(true);
            setIsDrafting(false);
            return false;
        }
        const team = teams.find(t => t.id === draftOrder[currentPick].user_id);

        if (!team || player.onroster || !isValidPick(team, player)) {
            console.log(`Invalid pick: ${player.name}`);
            setIsDrafting(false);
            return false;
        }

        let assignedPosition = player.position;
        if (player.position.includes("-")) {
            const possiblePositions = player.position.split("-");
            assignedPosition = possiblePositions.find(pos => team.roster.filter(p => p.position.includes(pos)).length < maxPositions[pos]) || possiblePositions[0];
        }


    //    const success = draftPlayer(currentTeam.id, player, playerList, teams);
    //    if (success) {

                // **Fetch current roster**
            console.log("Current Pick before assigning currentRoster ", draftOrder[currentPick]);
            console.log("Current League Participants ", leagueParticipants);
            const currentRoster = leagueParticipants.find((participant) => participant.team_name == draftOrder[currentPick].team_name).roster;


            console.log("Roster before updating with draft player ", currentRoster);
            // ** Append new player**
            const updatedRoster = [...currentRoster, player];

            const { error } = await supabase
            .from("league_rosters")
            .update({ roster: updatedRoster })
            .eq("league_id", draftOrder[currentPick].league_id)
            .eq("user_id",draftOrder[currentPick].user_id);
            console.log(`${draftOrder[currentPick].team_name} drafted ${player.name}`);

            if (error) {
                console.error("Error updating roster:", error);
                setIsDrafting(false);
                alert("Failed to update roster. Try again.");
                return;
            }else{
                console.log("Roster updated successfully in Supabase!");
            }
            
            // Update Player Status in availablePlayers in Supabase
            const { error: playerError } = await supabase
            .from("league_players")
            .update({ onroster: true })
            .eq("player_id", player.player_id)
            .eq("league_id", draftOrder[currentPick].league_id);
            console.log("Player: "+player.name+"'s onRoster status is true in the players table in Supabase")

            if (playerError) {
            console.error("Error updating player from available players:", playerError);
            setIsDrafting(false);
            return;
            }

            //updateUserRoster(draftOrder[currentPick].id, (prevRoster) => [...prevRoster, { ...player, assignedPosition }]);
            //setPlayers((prevPlayers) => prevPlayers.filter((p) => p.name !== player.name));
            //setAvailablePlayers((prevPlayers) => prevPlayers.filter((p) => p.name !== player.name));
            console.log(`${draftOrder[currentPick].team_name} drafted ${player.name} as ${assignedPosition}`);


        //setPlayers([...playerList]); // Update available players
        // if (currentTeam.id === 1) {
                //onNotify([...currentTeam.roster]); 
            //onNotify((prevRoster) => [...prevRoster, player]); // Notify App about Team 1's updated roster
        // }
            await nextTurn();
            console.log('current Team is ' + draftOrder[currentPick].team_name);
           // setCurrentTeam(draftOrder[currentPick]); // Update current team
         //   onPick(player);
            setIsDrafting(false);
    //    }
    };

    console.log ("Current Pick : ", currentPick, "Current Round: ", currentRound);
    console.log ("Draft Order ", draftOrder);
    console.log ("League Participants ", leagueParticipants);


    return (
        <div>
        <NavigationBar />
        <div className="draft-screen">
            {/* Draft Info Card */}
            <Card className="draft-card">
            <CardContent>
                <Typography variant="h5" className="draft-league-name">{leagueName}</Typography>
                <Typography variant="h6" className="draft-details">Drafting Team : {draftOrder[currentPick].team_name} |  Round: {currentRound} | Players Left: {availablePlayers.length}
                </Typography>
              {/*  <Typography variant="h6" className="draft-status">
                 It is the turn of : {draftOrder[currentPick].team_name}
                {userTurn ? "Your Turn to Pick" : "Waiting for Other Picks..."}
                </Typography>*/}
            </CardContent>
            </Card>

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

            {/* Player Pool Table */}
            <TableContainer component={Paper} className="player-pool-table">
            <Table>
                <TableHead>
                <TableRow>
                    <TableCell>     </TableCell>
                    <TableCell>Player Name</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Action</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {filteredPlayers.map((player, index) => (
                  <TableRow key={index}
                    sx={{ cursor: "pointer", "&:hover": { backgroundColor: "rgba(16, 86, 51, 0.1)" } }} // Hover effect for better UX
                  >
                    <TableCell><img src={player.image_url || process.env.PUBLIC_URL + "/placeholder.png"} alt={player.name} className="player-img"   onError={(e) => { e.target.onerror = null; e.target.src = process.env.PUBLIC_URL + "/placeholder.png"; }}/></TableCell>
                    <TableCell>{player.name}</TableCell>
                    <TableCell>{player.position}</TableCell>
                    <TableCell><Button className="add-btn" 
                        sx={{"&:hover": {backgroundColor: "kellygreen", color: "black"}}} 
                        onClick={() => handleDraft(player)}
                        disabled={isDrafting} // ✅ Disable when function is running
                    >Draft</Button></TableCell>
                    
                  </TableRow>
                ))}
                </TableBody>
            </Table>
            </TableContainer>

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

            .draft-screen {
                width: 100%;
                background: black;
                color: white;
                text-align: center;
                padding: 20px;
                min-height: 100vh;
                justify-content: space-between;
            }

            .draft-card {
                flex-grow: 1; 
                width: 90%;
                margin: 20px auto;
                background: white;
                color: black;
                display: flex;
                justify-content: space-between;
                padding: 15px;
                border-radius: 12px;
                box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.4), -5px -5px 15px rgba(255, 255, 255, 0.1);
            }

            .draft-league-name {
                text-align: left;
            }

            .draft-details {
                text-align: right;
            }

            .draft-status {
                text-align: center;
                font-weight: bold;
                margin-top: 10px;
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

            .player-img {
              width: 40px;
              height: 40px;
              border-radius: 50%;
            }

            .player-pool-table {
                flex-grow: 1; 
                width: 90%;
                margin: 20px auto;
                background: white;
                font-family: "American Typewriter", serif;
            }
            `}</style>
        </div>
        </div>
    );
};

export default DraftScreen;
