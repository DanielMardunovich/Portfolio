bool UGoapActionDataAsset::CheckProceduralPrecondition_Implementation(
    AActor* Agent, const FGoapWorldState& CurrentState) const
{
    for (const FGoapFloatCondition& Condition : FloatPreconditionChecks)
        if (!Condition.Evaluate(CurrentState))
            return false;

    for (const FGoapIntCondition& Condition : IntPreconditionChecks)
        if (!Condition.Evaluate(CurrentState))
            return false;

    for (const FGoapBoolCondition& Condition : BoolPreconditionChecks)
        if (!Condition.Evaluate(CurrentState))
            return false;

    return true;
}