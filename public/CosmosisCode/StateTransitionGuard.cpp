void ASimpleDefaultAI::SetHunting(bool hunting)
{
    if (hunting)
    {
        if(worldState.CurrentBehaviour != EAIState::Hunting)
        {
            worldState.CurrentBehaviour = EAIState::Hunting;
            OnGotActivated.Broadcast();
        }
        ...
    }
    else
        worldState.CurrentBehaviour = EAIState::Idle;
}