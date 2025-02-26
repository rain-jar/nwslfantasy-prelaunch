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
        console.log("🆕 User joined league:", payload.new);
        const { data, error } = await supabase
        .from("league_rosters")
        .select("*")
        .eq("league_id", leagueId)
  
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