import {supabase} from "./supabaseClient";

// ✅ Subscribe to User Inserts
export const subscribeToUserInserts = (setUsers) => {
  const subscription = supabase
    .channel("users-insert")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "users" }, (payload) => {
      console.log("🆕 New user added:", payload.new);
      setUsers((prevUsers) => [...prevUsers, payload.new]);
    })
    .subscribe();
  
  return () => supabase.removeChannel(subscription);
};

// ✅ Subscribe to League Inserts
export const subscribeToLeagueInserts = (setAvailableLeagues) => {
    const subscription = supabase
      .channel("leagues-insert")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "leagues" }, (payload) => {
        console.log("🆕 New league created:", payload.new);
        setAvailableLeagues((prevLeagues) => [...prevLeagues, payload.new]);
      })
      .subscribe();
  
    return () => supabase.removeChannel(subscription);
  };

  // ✅ Subscribe to League Roster Inserts (New User Joins League)
export const subscribeToLeagueRosterInserts = (setLeagueParticipants, leagueId) => {
    const subscription = supabase
      .channel("league_rosters-insert")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "league_rosters" }, async(payload) => {
        console.log("League Id at LeagueRosterInsert entry is ", leagueId);
        console.log("🆕 User joined league:", payload.new);
        console.log("User joined league : ", payload.new.league_id);
        const { data, error } = await supabase
        .from("league_rosters")
        .select("*")
        .eq("league_id", payload.new.league_id);
  
        if (!error) {
          setLeagueParticipants(data);
          console.log("Insert Listener fetches the updated league participants list", data);
        }else{
           console.log("Error in fetching", error.message);
        }
      })
      .subscribe();
  
    return () => supabase.removeChannel(subscription);
  };

  export const subscribeToLeaguePlayerInserts = (setAvailablePlayers, leagueId) => {
    const subscription = supabase
      .channel("league_players-insert")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "league_players" }, async(payload) => {
        console.log("🆕 New player added to league:", payload.new);
        // Only act if it's the same league
        if (payload.new.league_id === leagueId) {
          // Re-fetch the updated list of available players
          const { data, error } = await supabase
            .from("league_players")
            .select("*")
            .eq("league_id", leagueId)
            .eq("onroster", false);
  
            if (!error && data) {
              setAvailablePlayers(data);
            } else if (error) {
              console.error("❌ Error re-fetching league players:", error);
            }
          }
      })
      .subscribe();
  
    return () => supabase.removeChannel(subscription);
  };

  // Listener for Draft (Used in DraftScreen.js)
export const subscribeToDraftUpdates = (setCurrentRound, setCurrentPick, setDraftOrder, setFullTeamsCount) => {
  console.log("Setting up draft state real-time listener...");

  const draftSubscription = supabase
    .channel("draft_changes")
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "draft_state" }, (payload) => {
      console.log("Draft state updated:", payload.new);
      setCurrentRound(payload.new.current_round);
      setCurrentPick(payload.new.current_pick);
      setDraftOrder(payload.new.draft_order); 
      setFullTeamsCount(payload.new.full_teams_count || 0); // ✅ Sync full teams count  
    })
    .subscribe();

  return () => {
    supabase.removeChannel(draftSubscription);
  };
};


// ✅ Subscribe to League Player Updates (Draft, Add, Drop Players)
export const subscribeToLeaguePlayerUpdates = (setAvailablePlayers, leagueId) => {
  const subscription = supabase
    .channel("league_players-update")
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "league_players" }, async(payload) => {
      console.log("🔄 Player availability updated:", payload.new);

      const { data, error } = await supabase
      .from("league_players")
      .select("*")
      .eq("league_id", leagueId)
      .eq("onroster", false); // Fetch only players NOT on a team

      if (!error) {
        setAvailablePlayers(data);
        console.log("Listener fetches the updated player list for PlayerList", data);
      }else{
         console.log("Error in fetching", error.message);
      }

    })
    .subscribe();

  return () => supabase.removeChannel(subscription);
};



// ✅ Subscribe to League Roster Updates (User Updates Team Name or Roster)
export const subscribeToLeagueRosterUpdates = (setLeagueParticipants, leagueId) => {
  const subscription = supabase
    .channel("league_rosters-update")
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "league_rosters" }, async(payload) => {
      console.log("🔄 League roster updated:", payload.new);
      const { data, error } = await supabase
      .from("league_rosters")
      .select("*")
      .eq("league_id", leagueId)

      if (!error) {
        setLeagueParticipants(data);
        console.log("Listener fetches the updated league roster list", data);
      }else{
         console.log("Error in fetching", error.message);
      }
    })
    .subscribe();

  return () => supabase.removeChannel(subscription);
};

//Listener for DraftTimer Starting for each pick
export const subscribeToDraftTimerUpdates = (setTimerStart) => {
  console.log("Setting up draft timer real-time listener...");

  const timerSubscription = supabase
    .channel("draft_timer_changes")
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "draft_state" }, (payload) => {
      if (payload.new.timer_start) {
        console.log("⏳ Draft timer updated:", payload.new.timer_start);
        setTimerStart(payload.new.timer_start);
        localStorage.setItem("timer_start", payload.new.timer_start);
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(timerSubscription);
  };
};
