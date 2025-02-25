
import './App.css';
import React, { useState } from "react";
import { supabase } from "./supabaseClient.js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomeScreen from "./pages/WelcomeScreen";
import ProfileScreen from './pages/ProfileScreen';
import ProfileListScreen from './pages/ProfileListScreen.js';
import CreateJoinScreen from './pages/CreateJoinScreen'; 
import { LeagueProvider, useLeague } from "./LeagueContext";


function App() {

  const [users, setUsers] = useState([]); // Store multiple users
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedLeagueId, setSelectedLeagueId] = useState(null);

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
        </Routes>
      </Router>
    </LeagueProvider>
  );
}

export default App;
