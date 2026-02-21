struct FAIAgentInfo
{
    TWeakObjectPtr<APawn> Pawn;
    TWeakObjectPtr<AAIController> Controller;
    TWeakObjectPtr<UGoapComponent> GoapComponent;
    TWeakObjectPtr<UActivatableComponent> ActivatableComponent;

    EAIManagerState CurrentState = EAIManagerState::Normal;
    bool bIsActive = true;

    FVector SpawnLocation = FVector::ZeroVector;
    FRotator SpawnRotation = FRotator::ZeroRotator;

    FString DebugName;
    float RegistrationTime = 0.0f;
};