void FGoapPlanner::BuildPlan(TSharedPtr<FGoapPlanNode> GoalNode, TArray<FGoapActionInstance>& OutPlan)
{
    TArray<FGoapActionInstance> ReversePlan;
    TSharedPtr<FGoapPlanNode> CurrentNode = GoalNode;

    while (CurrentNode.IsValid() && CurrentNode->ActionInstance.IsValid())
    {
        ReversePlan.Add(CurrentNode->ActionInstance);
        CurrentNode = CurrentNode->Parent;
    }

    for (int32 i = ReversePlan.Num() - 1; i >= 0; --i)
        OutPlan.Add(ReversePlan[i]);
}