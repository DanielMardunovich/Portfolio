FORCEINLINE uint32 GetTypeHash(const FGoapWorldState& State)
{
    uint32 Hash = 0;
    for (const auto& Pair : State.GetBoolStates())
    {
        Hash = HashCombine(Hash, GetTypeHash(Pair.Key));
        Hash = HashCombine(Hash, GetTypeHash(Pair.Value));
    }
    for (const auto& Pair : State.GetFloatStates())
    {
        Hash = HashCombine(Hash, GetTypeHash(Pair.Key));
        Hash = HashCombine(Hash, GetTypeHash(FMath::RoundToInt(Pair.Value * 100.0f)));
    }
    // ... ints and objects follow same pattern
    return Hash;
}