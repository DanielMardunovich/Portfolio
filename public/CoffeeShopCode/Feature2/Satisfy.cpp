bool FGoapWorldState::Satisfies(const FGoapWorldState& Other) const
{
    for (const auto& Pair : Other.BoolStates)
    {
        if (GetBoolState(Pair.Key, !Pair.Value) != Pair.Value)
            return false;
    }

    for (const auto& Pair : Other.IntStates)
    {
        if (GetIntState(Pair.Key, Pair.Value + 1) < Pair.Value)
            return false;
    }

    for (const auto& Pair : Other.FloatStates)
    {
        if (!FMath::IsNearlyEqual(GetFloatState(Pair.Key, Pair.Value + 1.0f), Pair.Value, 
            GoapPlanningConstants::FLOAT_COMPARISON_TOLERANCE))
            return false;
    }

    for (const auto& Pair : Other.ObjectStates)
    {
        if (GetObjectState(Pair.Key) != Pair.Value)
            return false;
    }

    return true;
}