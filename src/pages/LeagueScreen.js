import React, { useState, useEffect } from "react";
import { Button, Select, MenuItem, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, Card, CardContent, Typography } from "@mui/material";
import NavigationBar from "../NavigationBar";
import { useLeague } from "../LeagueContext";
import { supabase } from "../supabaseClient";
import { useLocation, useNavigate } from "react-router-dom";



const LeagueScreen = () => {
    
    const navigate = useNavigate();
    
    const { leagueParticipants, setLeagueParticipants, leagueId, users, userId} = useLeague();
    const [leagueUsers, setleagueUsers] = useState([...leagueParticipants]);
    const [isDataFetched, setIsDataFetched] = useState(false);
    const [leagueName, setLeagueName] = useState();
    const [loading, setLoading] = useState(false); // Add loading state


    const [statsFilter, setStatsFilter] = useState("2024");

    console.log("League Name ", leagueName);

    useEffect(() => {
        const fetchName = async () => {
          await fetchLeagueName();
          await fetchleagueUsers();
        };
        fetchName();
    }, []);

    useEffect(()=> {
        fetchleagueUsers();
      },[leagueParticipants])

    const fetchleagueUsers = async() => {
        const leagueUsersTemp = leagueParticipants.map((participant) => {
          const username = users.find((m) => m.id === participant.user_id).user_name || {};
          return {
            ...participant, 
            user_name : username || "",
          };
        });
        setleagueUsers(leagueUsersTemp);
    }

    const fetchLeagueName = async () => {
        try{
          if (!isDataFetched) {
            console.log("Fetching LeagueName...", isDataFetched);
            const { data, error } = await supabase.from("leagues").select("*").eq("league_id", leagueId);
            if (error) {
              console.error("Error fetching player stats:", error.message);
              return;
            }
            console.log("League Name fetched is ",data[0]);
    
            setLeagueName(data[0].league_name);
            setIsDataFetched(true);
          }
        } catch (err) {
          console.error("🔥 Unexpected fetch error:", err);
        }
      };

    const handleRowClick = (team) => {
        if (team.user_id === userId) {
          // If it's the current user's team, navigate to My Team tab
          navigate("/my-team");
        } else {
          // If it's another user's team, navigate to TeamViewScreen
            console.log("No Screen Yet");
        }
    };


    return (
        <div>
        <NavigationBar />
        <div className="league-screen">
            {/* League Info Card */}
            <Card className="league-card">
            <CardContent>
                <Typography variant="h5" className="league-name">{leagueName}</Typography>
                <Typography variant="h6" className="league-details">Teams: {leagueUsers.length} </Typography>
            </CardContent>
            </Card>

            {/* Filter Row */}
            <div className="filter-row">
            <Select value={statsFilter} onChange={(e) => setStatsFilter(e.target.value)} className="filter-select">
                <MenuItem value="2024">2024 Season</MenuItem>
                <MenuItem value="week1">Week 1</MenuItem>
            </Select>
            </div>

            {/* League Standings Table */}
            <TableContainer component={Paper} className="standings-table">
            <Table>
                <TableHead>
                <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Team Name</TableCell>
                    <TableCell>W</TableCell>
                    <TableCell>L</TableCell>
                    <TableCell>T</TableCell>
                    <TableCell sx={{textAlign:"center"}}>Fantasy Points</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                    {leagueUsers.map((team, index) => (
                        <TableRow key={index}
                            onClick={() => handleRowClick(team)} 
                            sx={{ cursor: "pointer", "&:hover": { backgroundColor: "rgba(16, 86, 51, 0.1)" } }} // Hover effect for better UX
                        >
                        <TableCell>{team.user_name}</TableCell>
                        <TableCell>{team.team_name}</TableCell>
                        <TableCell>0</TableCell>
                        <TableCell>0</TableCell>
                        <TableCell>0</TableCell>
                        <TableCell sx={{textAlign: "center"}}>0</TableCell>
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

            .league-screen {
                width: 100%;
                background: black;
                color: white;
                text-align: center;
                padding: 20px;
                min-height: 100vh;
                justify-content: space-between;
            }

            .league-card {
                width: 80%;
                margin: 20px auto;
                background: white;
                color: black;
                display: flex;
                justify-content: space-between;
                padding: 15px;
                border-radius: 12px;
                box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.4), -5px -5px 15px rgba(255, 255, 255, 0.1);
            }

            .league-name {
                text-align: left;
            }

            .league-details {
                text-align: right;
            }

            .filter-row {
                margin: 20px 0;
            }

            .filter-select {
                background: white;
                color: black;
                border-radius: 5px;
            }

            .standings-table {
                flex-grow: 1; 
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

export default LeagueScreen;
