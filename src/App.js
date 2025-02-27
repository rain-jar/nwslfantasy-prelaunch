
import './App.css';
import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient.js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomeScreen from "./pages/WelcomeScreen";
import ProfileScreen from './pages/ProfileScreen';
import ProfileListScreen from './pages/ProfileListScreen.js';
import CreateJoinScreen from './pages/CreateJoinScreen'; 
import LeagueSetupScreen from './pages/LeagueSetupScreen';
import PlayersScreen from './pages/PlayersScreen.js';
import MyTeamScreen from './pages/MyTeamScreen.js';
import LeagueScreen from './pages/LeagueScreen.js';
import DraftScreen from './pages/DraftScreen.js';
import { LeagueProvider, useLeague } from "./LeagueContext";


function App() {

  const [users, setUsers] = useState([]); // Store multiple users
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedLeagueId, setSelectedLeagueId] = useState(null);
  const [playerStats, setPlayerStats] = useState([]);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  


    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        await fetchPlayerStats();
        setLoading(false);
      };
        fetchData();
    }, []);

    const fetchPlayerStats = async () => {
      if (!isDataFetched) {
        console.log("Fetching Player Stats...");
        const { data, error } = await supabase.from("players_base").select("*");
        if (error) {
          console.error("Error fetching player stats:", error);
          return;
        }
        setPlayerStats(data);
        setIsDataFetched(true);
        console.log("Players Base data is fetched in App.tsx",data );
      }
    };


  const handleSaveProfile = async (userName) => {

    console.log("Profile saved for user:", userName);
    
    const newUser = {
      user_name: userName
    };
    console.log("newUser array created");
    try{
      // Insert new user into Supabase
      console.log("Adding a User");
      const { data, error } = await supabase.from("users").insert([newUser]).select();

      if (error) {
        console.error("Error saving user:", error);
        alert("Failed to save profile. Try again.");
        return;
      }

      setUsers((prevUsers) => [...prevUsers, data[0]]);
      setCurrentUserId(data[0].id);
      console.log("Setting the following details:", data, data[0].id, users);
    }catch (err) {
      console.error("Uexpected error", err)
    }




  };

  const onUserSelect = async(userId) => {
    console.log("User Selected is ", userId);
    setCurrentUserId(userId);
  }

  return (
    <LeagueProvider leagueId={selectedLeagueId} userId={currentUserId}>
      <Router>
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/create-profile" element={<ProfileScreen onSave={handleSaveProfile} />}/>
          <Route path="/existing-user" element={<ProfileListScreen onSelect={onUserSelect}/>}/>
          <Route path="/create-join" element={<CreateJoinScreen currentUser={{ id: currentUserId }} onLeagueChosen={(newLeagueId) => setSelectedLeagueId(newLeagueId)}/>} />
          <Route path="/league-setup" element={<LeagueSetupScreen onLeagueChosen={(newLeagueId) => setSelectedLeagueId(newLeagueId)}/>} />
          <Route path="/players" element={<PlayersScreen playersBase={playerStats}/>} />
          <Route path="/my-team" element={<MyTeamScreen playersBase={playerStats}/>} />
          <Route path="/league-standings" element={<LeagueScreen/>} />
          <Route path="/draft" element={<DraftScreen playersBase={playerStats}/>} />

        </Routes>
      </Router>
    </LeagueProvider>
  );
}

export default App;
