float FGoapPlanner::CalculateHeuristic(const FGoapWorldState& State, const FGoapWorldState& GoalState)
{
    return static_cast<float>(State.GetDistanceTo(GoalState));
}

struct FGoapNodeComparator
{
    bool operator()(const TSharedPtr<FGoapPlanNode>& A, const TSharedPtr<FGoapPlanNode>& B) const
    {
        return A->GetFCost() > B->GetFCost();
    }
};