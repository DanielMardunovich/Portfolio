switch (SpawnLogic)
{
case ESpawnLogic::Single:
    SpawnUnits();
    break;

case ESpawnLogic::Interval:
    GetWorldTimerManager().SetTimer(
        SpawnTimer,
        this,
        &ASpawner::SpawnUnits,
        SpawnInterval,
        true,
        InitialSpawnDelay
    );
    break;

case ESpawnLogic::Chunk:
    for (int i = 0; i < AmountOfUnitsToSpawn; i++)
    {
        auto unit = GetWorld()->SpawnActor<ASimpleDefaultAI>(UnitToSpawn, GetActorLocation(), GetActorRotation(), SpawnParams);
        if (ShouldSpawnHunting)
            if (IsValid(unit))
                unit->SetHunting(true);
    }
    AmountOfUnitsToSpawn = 0;
    break;
}