// LeagueContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import {supabase} from "./supabaseClient";
import {subscribeToUserInserts} from "./supabaseListeners";
import {subscribeToLeagueInserts} from "./supabaseListeners";
import {subscribeToLeaguePlayerInserts} from "./supabaseListeners";
import {subscribeToLeagueRosterInserts} from "./supabaseListeners";
import {subscribeToLeaguePlayerUpdates} from "./supabaseListeners";
import { subscribeToLeagueRosterUpdates } from "./supabaseListeners";


const LeagueContext = createContext(null);

export function LeagueProvider({currentLeagueId, currentUserId, children }) {

  // Load stored data from localStorage (or default to empty array)
  const [users, setUsers] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [leagueParticipants, setLeagueParticipants] = useState([]);

    // Load stored data from localStorage if props are not provided
  const [userLeagues, setUserLeagues] = useState(JSON.parse(localStorage.getItem("userLeagues")) || []);
  const [userId, setCurrentUserId] = useState(currentUserId || localStorage.getItem("currentUserId") || null);
  const [leagueId, setCurrentLeagueId] = useState(currentLeagueId || localStorage.getItem("currentLeagueId") || null);
  const [loading, setLoading] = useState(true); 


  
// Checking session for user login persistence. 
  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      console.log("Checking for a session");
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Session check error:", error.message);
        return;
      }
      if (user) {
        console.log("🔄 Restoring session from Supabase:", user.id);
        setCurrentUserId(user.id);
        localStorage.setItem("currentUserId", user.id);
      }else{
        console.log("❌ No valid session found, logging out.");
        setCurrentUserId(null);
        localStorage.removeItem("currentUserId");
      }
      setLoading(false);
    };
  
    checkSession();
  
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setCurrentUserId(session.user.id);
        localStorage.setItem("currentUserId", session.user.id);
      } else {
        setCurrentUserId(null);
        localStorage.removeItem("currentUserId");
      }
      setLoading(false); // ✅ Fix: Ensure loading is updated after login/logout
    });
  
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // ✅ Logout Function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUserId(null);
    localStorage.removeItem("currentUserId");
    window.location.href = "/"; // ✅ Redirect to Welcome Screen
  };


  // Sync userId & leagueId with localStorage when they change
  useEffect(() => {
    if (currentUserId) {
      setCurrentUserId(currentUserId);
      localStorage.setItem("currentUserId", currentUserId);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (currentLeagueId) {
      setCurrentLeagueId(currentLeagueId);
      localStorage.setItem("currentLeagueId", currentLeagueId);
    }
  }, [currentLeagueId]);

  // Fetch user data & listen for new users being added
  useEffect(() => {
    const fetchUserInitial = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*");

      if (!error && data) {
        setUsers(data);
        console.log("Fetching User data ", data);
      }
    };

    fetchUserInitial();
    const unsubscribeUserInserts = subscribeToUserInserts(setUsers);

    return () => {
      unsubscribeUserInserts(); // ✅ Cleanup
    };
  }, []);

  // Fetch leagues associated with the user
  useEffect(() => {
    if (!userId) return;

    const fetchLeagues = async () => {
      const { data, error } = await supabase
        .from("league_rosters")
        .select("league_id, leagues(league_name), team_name")
        .eq("user_id", userId);

      if (!error && data) {
        const formattedLeagues = data.map((entry) => ({
          id: entry.league_id,
          name: entry.leagues.league_name,
          team_name: entry.team_name
        }));
        setUserLeagues(formattedLeagues);
        localStorage.setItem("userLeagues", JSON.stringify(formattedLeagues)); // ✅ Store leagues in cache
      }
    };

    fetchLeagues();
  }, [userId]);


  useEffect(() => {
      console.log("Leagueid ", leagueId);
      if (!leagueId) return;

      const lastFetch = localStorage.getItem("lastFetchTimestamp");
      const now = Date.now();
  
      // Fetch fresh data only if older than 10 minutes
    //  if (!lastFetch || now - lastFetch > 10 * 60 * 1000) {
        const fetchAvailablePlayers = async () => {
          const { data, error } = await supabase
            .from("league_players")
            .select("*")
            .eq("league_id", leagueId)
            .eq("onroster", false);
          if (!error && data) {
            setAvailablePlayers(data);
      //      localStorage.setItem("lastFetchTimestamp", now);
          }
        };
  
        const fetchLeagueParticipants = async () => {
          const { data, error } = await supabase
            .from("league_rosters")
            .select("*")
            .eq("league_id", leagueId);
          if (!error && data) {
            setLeagueParticipants(data);
          }
        };
  
        fetchAvailablePlayers();
        fetchLeagueParticipants();
    //  }

    //  const unsubscribeLeagueInserts = subscribeToLeagueInserts(setAvailableLeagues);
      const unsubscribeInserts = subscribeToLeaguePlayerInserts(setAvailablePlayers);
      const unsubscribeRosterInserts = subscribeToLeagueRosterInserts(setLeagueParticipants, leagueId);
      const unsubscribeUpdates = subscribeToLeaguePlayerUpdates(setAvailablePlayers, leagueId);
      const unsubscribeRosterUpdates = subscribeToLeagueRosterUpdates(setLeagueParticipants, leagueId);

      supabase.getChannels().forEach(channel => console.log("Active channel:", channel));

      return () => {
        // Clean up both subscriptions
        unsubscribeInserts();
        unsubscribeRosterInserts();
        unsubscribeUpdates();
        unsubscribeRosterUpdates();
      };
  }, [leagueId]);
  

  return (
    <LeagueContext.Provider value={{users, setUsers, availablePlayers, setAvailablePlayers, leagueParticipants, setLeagueParticipants, leagueId, userId, userLeagues, setCurrentUserId, loading, handleLogout}}>
      {children}
    </LeagueContext.Provider>
  );
}

// Helper hook to read from context
export function useLeague() {
  return useContext(LeagueContext);
}


