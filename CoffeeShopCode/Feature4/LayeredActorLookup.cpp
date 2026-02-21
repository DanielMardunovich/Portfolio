AActor* UGoapWorldSubsystem::GetActorByKeyOrTag(AActor* Agent, FName Key) const
{
    // Tier 1: Check agent's own assigned world state
    UGoapComponent* GoapComp = GetGoapComponent(Agent);
    if (GoapComp)
    {
        AActor* AssignedActor = GoapComp->GetWorldState().GetActorState(Key);
        if (AssignedActor)
            return AssignedActor;
    }

    // Tier 2: Check default world knowledge
    AActor* DefaultActor = GetDefaultActor(Key);
    if (DefaultActor)
        return DefaultActor;

    // Tier 3: Fall back to tag-based world search
    return FindActorByTag(Key);
}