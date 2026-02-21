void ASimpleDefaultAI::Server_OnMove_Implementation()
{
    worldState.CurrentTile = GetWorld()->GetSubsystem<UEnemyLookup>()->WorldToTile(GetActorLocation());
    if (worldState.PreviousTile == worldState.CurrentTile)
        return;

    auto system = GetWorld()->GetSubsystem<UEnemyLookup>();
    system->RemoveAIFromTile(system->TileToWorld(worldState.PreviousTile), this);
    worldState.PreviousTile = worldState.CurrentTile;
    system->AddAIToTile(GetActorLocation(), this);
}