AActor* UGoapWorldSubsystem::FindActorByTag(FName Tag) const
{
    // Check cache first
    if (const TObjectPtr<AActor>* CachedActor = CachedActorsByTag.Find(Tag))
        if (*CachedActor && (*CachedActor)->IsValidLowLevel())
            return CachedActor->Get();

    // Cache miss — search world and populate
    TArray<AActor*> FoundActors;
    UGameplayStatics::GetAllActorsWithTag(World, Tag, FoundActors);
    
    if (FoundActors.Num() > 0)
    {
        const_cast<UGoapWorldSubsystem*>(this)->CachedActorsByTag.Add(Tag, FoundActors[0]);
        return FoundActors[0];
    }

    return nullptr;
}