struct FAIPoolEntry
{
    TWeakObjectPtr<ACharacter> Character;
    TWeakObjectPtr<AAIController> Controller;
    
    bool bInUse = false;
    FString PoolName;
    
    FVector OriginalSpawnLocation = FVector::ZeroVector;
    FRotator OriginalSpawnRotation = FRotator::ZeroRotator;
    
    float TimeReturned = 0.0f; // For debugging
    int32 TimesUsed = 0;       // Statistics
};