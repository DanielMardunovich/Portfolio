bool UGoapGoalDataAsset::IsValid_Implementation(
    AActor* Agent, const FGoapWorldState& CurrentState) const
{
    for (const FGoapFloatCondition& Condition : FloatValidationConditions)
        if (!Condition.Evaluate(CurrentState))
            return false;

    // Goal is invalid if already achieved —
    // allows system to automatically switch to lower priority goals
    if (!DesiredState.IsEmpty())
        if (CurrentState.Satisfies(DesiredState))
            return false;

    return true;
}