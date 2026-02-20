void UGoapWorldSubsystem::AssignActorToAllAgents(FName Key, AActor* TargetActor)
{
    // Keep subsystem state consistent
    SharedWorldState.SetActorState(Key, TargetActor);

    // Push to every active agent
    for (TObjectIterator<UGoapComponent> It; It; ++It)
    {
        if (It->GetWorld() == GetWorld())
            if (GoapComp && GoapComp->GetOwner())
                GoapComp->SetObjectState(Key, TargetActor);
    }
}