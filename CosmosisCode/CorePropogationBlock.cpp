void ASimpleDefaultAI::HandleTargetPerceptionUpdated(AActor* Actor, FAIStimulus Stimulus)
{
    if (Stimulus.WasSuccessfullySensed())
    {
        auto enemiesInRadius = GetWorld()->GetSubsystem<UEnemyLookup>()->FindAllContentInRadius(GetActorLocation(), 1);

        for(auto enemy : enemiesInRadius)
        {
            if (!IsValid(enemy))
                continue;

            enemy->SetHunting(true);
            
            FStateTreeEvent AttackEvent;
            AttackEvent.Tag = FGameplayTag::RequestGameplayTag(FName("ActiveStatus.true"));

            if (IsValid(enemy->CurrentController))
                enemy->CurrentController->StateTreeAIComponent->SendStateTreeEvent(AttackEvent);
        }
    }
}