// LeagueContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import {supabase} from "./supabaseClient";
import {subscribeToUserInserts} from "./supabaseListeners";


const LeagueContext = createContext(null);

export function LeagueProvider({children }) {
  const [users, setUsers] = useState([]);


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
    users
  });

  return (
    <LeagueContext.Provider value={{users, setUsers}}>
      {children}
    </LeagueContext.Provider>
  );
}

// Helper hook to read from context
export function useLeague() {
  return useContext(LeagueContext);
}
