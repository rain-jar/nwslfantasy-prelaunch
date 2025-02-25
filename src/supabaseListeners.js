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