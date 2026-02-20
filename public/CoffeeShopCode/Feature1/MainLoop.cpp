while (OpenSet.Num() > 0 && NodesExplored < MaxNodesToExplore)
{
    TSharedPtr<FGoapPlanNode> Current;
    OpenSet.HeapPop(Current, FGoapNodeComparator());

    if (Current->State.Satisfies(GoalState))
    {
        BuildPlan(Current, OutPlan);
        return true;
    }

    ClosedSet.Add(Current->State);
    NodesExplored++;

    TArray<FGoapActionInstance> ApplicableActions;
    GetApplicableActions(Agent, Current->State, AvailableActions, ApplicableActions);

    for (const FGoapActionInstance& Action : ApplicableActions)
    {
        FGoapWorldState NewState = Current->State;
        NewState.ApplyState(Action.Effects);

        if (ClosedSet.Contains(NewState))
            continue;

        float NewGCost = Current->GCost + Action.GetCost();
        float NewHCost = CalculateHeuristic(NewState, GoalState);

        TSharedPtr<FGoapPlanNode> NewNode = MakeShared<FGoapPlanNode>(
            Action, NewState, NewGCost, NewHCost, Current
        );
        OpenSet.HeapPush(NewNode, FGoapNodeComparator());
    }
}