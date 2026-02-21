UENUM(BlueprintType)
enum class EAIManagerState : uint8
{
    Normal          // AI behaves normally
    Paused          // AI logic paused, frozen in place
    Disabled        // AI completely disabled
    DebugControlled // Under debug control
};