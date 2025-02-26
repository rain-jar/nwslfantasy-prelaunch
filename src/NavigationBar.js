import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLeague } from "./LeagueContext";
import { AppBar, Toolbar, Button, Menu, MenuItem, Typography } from "@mui/material";

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { users, userId, leagueId, userLeagues } = useLeague(); // Fetch user's leagues from context
  const [anchorEl, setAnchorEl] = useState(null);

  console.log("User Leagues in Navigation ", userLeagues, users, leagueId, userId);
  const userName = users.find((m) => m.id === userId).user_name;
  const leagueName = userLeagues.find((m) => m.id === leagueId).name;


  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" sx={{ background: "black", color: "white" }}>
        <Toolbar>
            <Button 
                color="inherit" 
                onClick={() => navigate("/create-join")}
                className={location.pathname === "/create-join" ? "active-nav" : ""}
            >
                Home
            </Button>

            <Button 
                color="inherit" 
                onClick={() => navigate("/players")}
                className={location.pathname === "/players" ? "active-nav" : ""}
            >
                Players
            </Button>

            <Button 
                color="inherit" 
                onClick={() => navigate("/league-standings")}
                className={location.pathname === "/league-standings" ? "active-nav" : ""}
            >
                League
            </Button>

            <Button 
                color="inherit" 
                onClick={() => navigate("/my-team")}
                className={location.pathname === "/my-team" ? "active-nav" : ""}
            >
                My Team
            </Button>

            <div style={{ marginLeft: "auto" }}>                
                <Button 
                color="inherit" 
                onClick={handleMenuOpen} 
                endIcon={<span style={{ fontSize: "1rem" }}>▼</span>}
                className={location.pathname.includes("/league") ? "active-nav" : ""}
                >
                Leagues
                </Button>
            </div>

            <Typography variant="h9" className="team-name">User : {userName}  </Typography>
            <Typography variant="h9" className="team-name">      </Typography>
            <Typography variant="h9" className="team-name"> League : {leagueName}</Typography>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                {userLeagues.map((league) => (
                <MenuItem key={league.id} onClick={() => navigate(`/league/${league.id}`)}>
                    {league.name}
                </MenuItem>
                ))}
            </Menu>

            {/* Styles */}
            <style jsx>{`
                .active-nav {
                    border-bottom: 2px solid white; /* Underline effect */
                    font-weight: bold;
                }
            `}</style>
        </Toolbar>



    </AppBar>
  );
};

export default NavigationBar;
