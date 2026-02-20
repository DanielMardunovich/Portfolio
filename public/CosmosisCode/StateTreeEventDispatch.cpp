FStateTreeEvent AttackEvent;
AttackEvent.Tag = FGameplayTag::RequestGameplayTag(FName("ActiveStatus.true"));

if (IsValid(enemy->CurrentController))
    enemy->CurrentController->StateTreeAIComponent->SendStateTreeEvent(AttackEvent);