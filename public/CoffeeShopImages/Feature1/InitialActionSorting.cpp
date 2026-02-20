InitialApplicableActions.Sort([this, &GoalState, &CurrentState](const FGoapActionInstance& A, const FGoapActionInstance& B)
{
    FGoapWorldState StateAfterA = CurrentState;
    StateAfterA.ApplyState(A.Effects);

    FGoapWorldState StateAfterB = CurrentState;
    StateAfterB.ApplyState(B.Effects);

    return CalculateHeuristic(StateAfterA, GoalState) < CalculateHeuristic(StateAfterB, GoalState);
});