void ASpawner::SpawnUnits()
{
    if (!HasAuthority())
        return;

    if (AmountOfUnitsToSpawn <= 0)
    {
        StopSpawning();
        return;
    }

    auto unit = GetWorld()->SpawnActor<ASimpleDefaultAI>(UnitToSpawn, GetActorLocation(), GetActorRotation(), SpawnParams);
    
    if (ShouldSpawnHunting)
        if (IsValid(unit))
            unit->SetHunting(true);

    AmountOfUnitsToSpawn--;
}