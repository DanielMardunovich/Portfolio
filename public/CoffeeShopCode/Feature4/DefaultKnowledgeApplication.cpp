void UGoapWorldSubsystem::ApplyDefaultKnowledgeToAgent(AActor* Agent)
{
    UGoapComponent* GoapComp = GetGoapComponent(Agent);

    // Apply all globally flagged default entries
    for (const FGoapDefaultWorldEntry& Entry : DefaultWorldEntries)
        if (Entry.bIsGlobalKnowledge && !Entry.bUseFixedLocation && Entry.Actor.IsValid())
            GoapComp->SetObjectState(Entry.Key, Entry.Actor.Get());

    // Also apply shared world state on top
    GoapComp->ApplyEffects(SharedWorldState);
}