int32 FGoapWorldState::GetDistanceTo(const FGoapWorldState& GoalState) const
{
    int32 Distance = 0;

    for (const auto& Pair : GoalState.BoolStates)
        if (GetBoolState(Pair.Key, !Pair.Value) != Pair.Value)
            Distance++;

    for (const auto& Pair : GoalState.IntStates)
        if (GetIntState(Pair.Key, Pair.Value + 1) != Pair.Value)
            Distance++;

    for (const auto& Pair : GoalState.FloatStates)
        if (!FMath::IsNearlyEqual(GetFloatState(Pair.Key, Pair.Value + 1.0f), Pair.Value,
            GoapPlanningConstants::FLOAT_COMPARISON_TOLERANCE))
            Distance++;

    for (const auto& Pair : GoalState.ObjectStates)
        if (GetObjectState(Pair.Key) != Pair.Value)
            Distance++;

    return Distance;
}