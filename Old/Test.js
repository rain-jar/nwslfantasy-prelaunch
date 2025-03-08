const nextTurn = async (wasFull = false) => { // ✅ Accept wasFull flag
    console.log("currentPick: ", currentPick, " currentRound: ", currentRound);
    console.log("Draft Order inside Next Turn ", draftOrder);

    let newPick = currentPick;
    let newRound = currentRound;
    let newDraftOrder = [...draftOrder];

    const totalTeams = leagueParticipants.length;
    const previousUserId = draftOrder[currentPick]?.user_id; // ✅ Track previous user ID

    // ✅ Ensure we don’t enter an infinite loop if all teams are full
    if (fullTeamsCountRef.current >= totalTeams) {
        console.log("✅ All teams are full. Ending the draft.");
        return;
    }

    // ✅ Increment the pick normally
    if (newPick < newDraftOrder.length - 1) {
        newPick++;
    } else {
        newRound++;
        newDraftOrder.reverse(); // Reverse for snake draft
        newPick = 0;
    }

    // ✅ If the call was made because the team was full, keep skipping until it's a different team
    while (wasFull && newDraftOrder[newPick]?.user_id === previousUserId) {
        console.log("Skipping back-to-back pick for full team...");
        if (newPick < newDraftOrder.length - 1) {
            newPick++;
        } else {
            newRound++;
            newDraftOrder.reverse();
            newPick = 0;
        }
    }

    // ✅ Save timer_start to Supabase when it's the first draft or a back-to-back turn
    if (!timerStart || newDraftOrder[newPick]?.user_id === userId) {
        console.log("🔄 First draft OR Snake draft detected - setting timerStart in Supabase.");
        
        const { error } = await supabase
            .from("draft_state")
            .update({ timer_start: new Date().toISOString() })
            .eq("id", draftStateId);

        if (error) {
            console.error("❌ Error initializing timer_start in Supabase:", error);
        } else {
            console.log("✅ TimerStart initialized in Supabase for first draft pick.");
        }
    }

    // Update local state
    setCurrentPick(newPick);
    setCurrentRound(newRound);
    setDraftOrder(newDraftOrder);
    console.log("currentPick: ", newPick, " currentRound: ", newRound);

    if (!draftStateId) return;

    // Save draft state to Supabase
    const { error } = await supabase
        .from("draft_state")
        .update({
            current_round: newRound,
            current_pick: newPick,
            draft_order: newDraftOrder
        })
        .eq("id", draftStateId);

    if (error) {
        console.error("Error updating draft state:", error);
    }
};
