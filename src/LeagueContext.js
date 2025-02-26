// LeagueContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import {supabase} from "./supabaseClient";
import {subscribeToUserInserts} from "./supabaseListeners";
import {subscribeToLeaguePlayerInserts} from "./supabaseListeners";
import {subscribeToLeagueRosterInserts} from "./supabaseListeners";



const LeagueContext = createContext(null);

export function LeagueProvider({leagueId, userId, children }) {

  // Load stored data from localStorage (or default to empty array)
  const [users, setUsers] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [leagueParticipants, setLeagueParticipants] = useState([]);
  const [userLeagues, setLeagues] = useState([]);

  useEffect(() => {
    const fetchUserInitial = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
      if (!error && data) {
        setUsers(data);
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
    users, availablePlayers
  });

  useEffect(() => {
    if (!userId) return;
        
    const fetchLeagues = async () => {
      const { data, error } = await supabase
      .from("league_rosters")
      .select("league_id, leagues(league_name), team_name")
      .eq("user_id", userId);

      if (error) {
        console.error("Error fetching user leagues:", error);
      } else {
        const formattedLeagues = (data.map((entry) => ({
          id: entry.league_id,
          name: entry.leagues.league_name,
          team_name: entry.team_name
        })));
        setLeagues(formattedLeagues);
      }
    };
    fetchLeagues();

  },[userId])


  useEffect(() => {
      console.log("Leagueid ", leagueId);

      if (!leagueId) return;
      const fetchInitial = async () => {
          const { data, error } = await supabase
            .from("league_players")
            .select("*")
            .eq("league_id", leagueId)
            .eq("onroster", false);
          if (!error && data) {
            setAvailablePlayers(data);
            console.log("LC has set AvP to ", availablePlayers)
          }
      };
      const fetchRosterInitial = async () => {
        const { data, error } = await supabase
          .from("league_rosters")
          .select("*")
          .eq("league_id", leagueId)
        if (!error && data) {
          console.log("League Participants in LeagueContext fetch ", data);
          setLeagueParticipants(data);
        }
      };
      fetchInitial();
      fetchRosterInitial();
      const unsubscribeInserts = subscribeToLeaguePlayerInserts(setAvailablePlayers);
      const unsubscribeRosterInserts = subscribeToLeagueRosterInserts(setLeagueParticipants, leagueId);

      supabase.getChannels().forEach(channel => console.log("Active channel:", channel));

      return () => {
        // Clean up both subscriptions
      //  unsubscribeUpdates();
        unsubscribeInserts();
      //  unsubscribeRosterUpdates();
        unsubscribeRosterInserts();
      };
  }, [leagueId]);
  

  return (
    <LeagueContext.Provider value={{users, setUsers, availablePlayers, setAvailablePlayers, leagueParticipants, setLeagueParticipants, leagueId, userId, userLeagues}}>
      {children}
    </LeagueContext.Provider>
  );
}

// Helper hook to read from context
export function useLeague() {
  return useContext(LeagueContext);
}
