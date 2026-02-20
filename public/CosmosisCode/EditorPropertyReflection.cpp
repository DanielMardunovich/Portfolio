void ASpawner::PostEditChangeProperty(FPropertyChangedEvent& PropertyChangedEvent)
{
    Super::PostEditChangeProperty(PropertyChangedEvent);

    if (PropertyChangedEvent.Property &&
        PropertyChangedEvent.Property->GetFName() == GET_MEMBER_NAME_CHECKED(ASpawner, AmountOfUnitsToSpawn))
    {
        bShowSpawnInterval = (SpawnLogic == ESpawnLogic::Interval);
    }
}