// LeagueContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import {supabase} from "./supabaseClient";
import {subscribeToUserInserts} from "./supabaseListeners";
import {subscribeToLeaguePlayerInserts} from "./supabaseListeners";
import {subscribeToLeagueRosterInserts} from "./supabaseListeners";



const LeagueContext = createContext(null);

export function LeagueProvider({leagueId, userId, children }) {

  // Load stored data from localStorage (or default to empty array)
  const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
  const storedPlayers = JSON.parse(localStorage.getItem("availablePlayers")) || [];
  const storedLeagues = JSON.parse(localStorage.getItem("userLeagues")) || [];
  const storedParticipants = JSON.parse(localStorage.getItem("leagueParticipants")) || [];
//  const storedUserId = localStorage.getItem("userId") || null;
//  const storedLeagueId = localStorage.getItem("leagueId") || null;

  const [users, setUsers] = useState(storedUsers);
  const [availablePlayers, setAvailablePlayers] = useState(storedPlayers);
  const [leagueParticipants, setLeagueParticipants] = useState(() => {
    console.log("Restoring from localStorage:", storedParticipants);
    return storedParticipants;
  });

  const [userLeagues, setLeagues] = useState(storedLeagues);
  const [currentUserId, setUserId] = useState( localStorage.getItem("userId") || null);
  const [currentLeagueId, setLeagueId] = useState(leagueId || localStorage.getItem("leagueId") || null);




  useEffect(() => {
    const fetchUserInitial = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
      if (!error && data) {
        setUsers(data);
        localStorage.setItem("users", JSON.stringify(data));
        console.log("Fetching User data ", data);
      }
    };
    fetchUserInitial();
    const unsubscribeUserInserts = subscribeToUserInserts(setUsers);
    return () => {
      unsubscribeUserInserts();
    }
  },[])

  console.log("LeagueProvider value:", {
    users, availablePlayers, currentLeagueId, currentUserId
  });

  useEffect(() => {
    if (!currentUserId) return;
    if (userId && userId !== currentUserId) {
      setUserId(userId);
      localStorage.setItem("userId", userId);
      console.log("Users ", currentUserId, userId);
    }
        
    const fetchLeagues = async () => {
      const { data, error } = await supabase
      .from("league_rosters")
      .select("league_id, leagues(league_name), team_name")
      .eq("user_id", currentUserId);

      if (error) {
        console.error("Error fetching user leagues:", error);
      } else {
        const formattedLeagues = (data.map((entry) => ({
          id: entry.league_id,
          name: entry.leagues.league_name,
          team_name: entry.team_name
        })));
        setLeagues(formattedLeagues);
        localStorage.setItem("userLeagues", JSON.stringify(formattedLeagues));
      }
    };
    fetchLeagues();

  },[userId, currentUserId])


  useEffect(() => {
      console.log("Leagueid ", currentLeagueId, leagueId);

      if (!currentLeagueId) return;

      if (leagueId && leagueId !== currentLeagueId) {
        setLeagueId(leagueId);
        localStorage.setItem("leagueId", leagueId);
        console.log("Leagueid ", currentLeagueId, leagueId);
      }

      if (availablePlayers.length === 0 || leagueParticipants.length === 0) {
        const fetchInitial = async () => {

            const { data, error } = await supabase
              .from("league_players")
              .select("*")
              .eq("league_id", currentLeagueId)
              .eq("onroster", false);
            if (!error && data) {
              setAvailablePlayers(data);
              localStorage.setItem("availablePlayers", JSON.stringify(data));
              console.log("LC has set AvP to ", availablePlayers)
            }
          };

          const fetchRosterInitial = async () => {
            const { data, error } = await supabase
              .from("league_rosters")
              .select("*")
              .eq("league_id", currentLeagueId)
            if (!error && data) {
              console.log("League Participants in LeagueContext fetch ", data);
              setLeagueParticipants(data);
              localStorage.setItem("leagueParticipants", JSON.stringify(data));

            }
          };
          fetchInitial();
          fetchRosterInitial();
       //   setLeagueId(currentLeagueId);
      }

    
      const unsubscribeInserts = subscribeToLeaguePlayerInserts(setAvailablePlayers);
      const unsubscribeRosterInserts = subscribeToLeagueRosterInserts(setLeagueParticipants, currentLeagueId);

      supabase.getChannels().forEach(channel => console.log("Active channel:", channel));

      return () => {
        // Clean up both subscriptions
      //  unsubscribeUpdates();
        unsubscribeInserts();
      //  unsubscribeRosterUpdates();
        unsubscribeRosterInserts();
      };
  }, [leagueId, currentLeagueId]);
  

  return (
    <LeagueContext.Provider value={{users, setUsers, availablePlayers, setAvailablePlayers, leagueParticipants, setLeagueParticipants, currentLeagueId, currentUserId, userLeagues}}>
      {children}
    </LeagueContext.Provider>
  );
}

// Helper hook to read from context
export function useLeague() {
  return useContext(LeagueContext);
}
