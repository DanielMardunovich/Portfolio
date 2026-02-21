// ===== POOLING SETTINGS =====
UPROPERTY(Config, EditAnywhere, Category = "Pooling")
bool bAutoPreSpawn;

UPROPERTY(Config, EditAnywhere, Category = "Pooling")
TArray<FPoolConfig> DefaultPools;

// ===== GOAP SETTINGS =====
UPROPERTY(Config, EditAnywhere, Category = "GOAP", 
    meta=(ClampMin="0.1", ClampMax="10.0"))
float DefaultPlanningInterval;

UPROPERTY(Config, EditAnywhere, Category = "GOAP",
    meta=(ClampMin="50", ClampMax="2000"))
int32 MaxPlanningNodes;

// ===== PERFORMANCE SETTINGS =====
UPROPERTY(Config, EditAnywhere, Category = "Performance",
    meta=(ClampMin="0", ClampMax="500"))
int32 MaxActiveAI = 0;

UPROPERTY(Config, EditAnywhere, Category = "Performance")
bool bEnableAILOD = false;

UPROPERTY(Config, EditAnywhere, Category = "Performance",
    meta=(EditCondition="bEnableAILOD", ClampMin="1000"))
float LODDistance = 5000.0f;