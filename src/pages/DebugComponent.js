import {  useEffect } from "react";
import { useLeague } from "../LeagueContext";

const DebugComponent = () => {
  const { userId } = useLeague();

  useEffect(() => {
    console.log("Current User ID (from context):", userId);
  }, [userId]);

  return null; // This component just logs info, no UI needed
};

export default DebugComponent;
