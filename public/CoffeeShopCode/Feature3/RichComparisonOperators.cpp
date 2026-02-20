bool FGoapFloatCondition::Evaluate(const FGoapWorldState& WorldState) const
{
    float CurrentValue = WorldState.GetFloatState(StateKey);

    switch (Operator)
    {
    case EGoapComparisonOperator::Equal:
        return FMath::IsNearlyEqual(CurrentValue, Value, 0.001f);
    case EGoapComparisonOperator::GreaterThan:
        return CurrentValue > Value;
    case EGoapComparisonOperator::LessThan:
        return CurrentValue < Value;
    case EGoapComparisonOperator::GreaterOrEqual:
        return CurrentValue >= Value;
    case EGoapComparisonOperator::LessOrEqual:
        return CurrentValue <= Value;
    case EGoapComparisonOperator::NotEqual:
        return !FMath::IsNearlyEqual(CurrentValue, Value, 0.001f);
    default:
        return false;
    }
}