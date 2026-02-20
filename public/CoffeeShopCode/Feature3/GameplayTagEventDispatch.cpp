void UGoapActionDataAsset::BroadcastCompletionEvent(AActor* Agent, bool bSuccess)
{
    if (!bSendTagEvents || !Agent)
        return;

    if (bSuccess)
    {
        if (CompletionEventTags.Num() > 0)
            OnActionCompleted.Broadcast(CompletionEventTags, Agent);
    }
    else
    {
        if (FailureEventTags.Num() > 0)
            OnActionFailed.Broadcast(FailureEventTags, Agent);
    }
}