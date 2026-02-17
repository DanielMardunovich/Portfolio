// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Rooms/SCR_RoomManager.h"
#include "AIManager.generated.h"

class UBoxComponent;
class USCR_SpawnPoint;
class USCR_ObjectPoolComponent;
class ASCR_AI_Base;

DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnAllAgentsDead);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnHordStarted);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnAIActivate);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnLastManStanding);

UENUM(BlueprintType)
enum class ESpawnUnitType : uint8
{
	SpawnAllAgentsAtTheSameTime		UMETA(DisplayName = "Spawn all Agents at the same time"),
	SpawnFromClosest				UMETA(DisplayName = "Spawn Agents from closest spawnpoint"),
	SpawnFromFurthest				UMETA(DisplayName = "Spawn Agents from furthest spawnpoint"),
	SpawnFromRandom					UMETA(DisplayName = "Spawn Agents from Random spawnpoint")
};

enum class ESpawnerType : uint8
{
	NormalSpawner				UMETA(DisplayName = "Normal Spawner"),
	WaveSpawningWithTimer		UMETA(DisplayName = "Wave Spawner with timer"),
	WaveSpawningPerWave			UMETA(DisplayName = "Spawn waves after each wave is completed")
};

UCLASS()
class TEAM8_GP3_API AAIManager : public AActor
{
public:
	virtual void Destroyed() override;

	// Sets default values for this actor's properties
	AAIManager(const FObjectInitializer& ObjectInitializer);

	UFUNCTION(BlueprintCallable)
	void AddAgent(ASCR_AI_Base* Agent);

	UFUNCTION(BlueprintCallable)
	void MoveAgentToActive(ASCR_AI_Base* Agent);

	UFUNCTION(BlueprintCallable)
	void MoveAgentToInActive(ASCR_AI_Base* Agent);

	void AddSpawnPoint(USCR_SpawnPoint* point);

	UFUNCTION(BlueprintCallable)
	void ActivateAgents(bool activeStatus);

	UFUNCTION(BlueprintCallable)
	void CheckIfRoomIsClear(ASCR_PlayerCharacter* character, FVector lastDeathLocation);

	UFUNCTION(BlueprintCallable)
	void ShouldActivateHord();

	UPROPERTY(Transient)
	int AggroedEnemies = 0;

	UPROPERTY(Transient)
	bool HordActive = false;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	bool bLastManStandingActive = false;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	float LastManStandingThreshold;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	float TotalEnemies;

	UFUNCTION(BlueprintCallable)
	void IsLastManStanding();

	UPROPERTY(EditAnywhere, BlueprintReadWrite, meta = (ToolTip = "Max ammount of enemies to aggro before the hord spawns"))
	int MaxAggroedEnemies;

	UPROPERTY(BlueprintAssignable, BlueprintReadWrite, meta = (ToolTip = "Gets called when all Agents are dead after the manager has been activated"))
	FOnAllAgentsDead OnAllAgentsDead;

	UPROPERTY(BlueprintAssignable, BlueprintReadWrite, meta = (ToolTip = "Gets called when the hord has been activated"))
	FOnHordStarted OnHordStarted;

	UPROPERTY(BlueprintAssignable, BlueprintReadWrite, meta = (ToolTip = "Gets called when the hord has been activated"))
    FOnAIActivate OnAIActivate;

	UPROPERTY(BlueprintAssignable, BlueprintReadWrite, meta = (ToolTip = "Gets called when Last Man Standing threshold is met"))
	FOnLastManStanding OnLastManStanding;
	
protected:
	// Called when the game starts or when spawned
	virtual void BeginPlay() override;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Pool|Spawning", meta = (ToolTip = "Decide what spawn type this spawner should have"))
	ESpawnUnitType SpawnType;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Pool|Spawning", meta = (ToolTip = "Toggle on if you want each spawner to spawn all units at the same time"))
	bool ChunkSpawning = false;
	
	UPROPERTY(BlueprintReadWrite, EditAnywhere, Category="Pool|Spawning", meta = (ToolTip = "List of all spawnpoints, press the + to add more"))
	TArray<USCR_SpawnPoint*> SpawnPoints;

	UPROPERTY(BlueprintReadWrite, VisibleAnywhere, Category="Pool|Class Assignmenet", meta = (ToolTip = "List of all active AI, not to be changed by anyone"))
	TArray<ASCR_AI_Base*> ActiveAgents;

	UPROPERTY(BlueprintReadWrite, VisibleAnywhere, Category="Pool|Class Assignmenet", meta = (ToolTip = "List of all Inactive AI, not to be changed by anyone"))
	TArray<ASCR_AI_Base*> InactiveAgents;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Pool|Spawning", meta=(ToolTip = "Change this to change the spawn delay for all spawners"))
	float SpawnDelay = 1.0f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "MemoryShards")
	TArray<TSubclassOf<ASCR_MemoryShard>> MemoryShardsToDrop;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "MemoryShards")
	float ShardSpawningRadius = 100;

	
public:

	UPROPERTY(EditAnywhere)
	UBoxComponent* ActivateAIBox;
	
	UPROPERTY(EditAnywhere)
	UStaticMeshComponent* StaticMesh;

	UPROPERTY(EditAnywhere)
	USCR_ObjectPoolComponent* ObjectPool;

	UFUNCTION(BlueprintCallable)
	void DropMemoryShard(const FVector& SpawnLocation);

private:
	GENERATED_BODY()
	
	UFUNCTION()
	void ActivateAIOnOverlap(UPrimitiveComponent* OverlappedComp, AActor* OtherActor,
					UPrimitiveComponent* OtherComp, int32 OtherBodyIndex,
					bool bFromSweep, const FHitResult& SweepResult);

	UFUNCTION()
	void ManageTimers(bool ShouldStart);

	UFUNCTION()
	void SpawnUnits();

	UFUNCTION()
	void SpawnAllAgents();

	UFUNCTION()
	void SpawnAgentsFromClosestSpawner();

	UFUNCTION()
	void SpawnAgentsFromFurthestSpawner();

	UFUNCTION()
	void SpawnAgentsFromRandomSpawner();

	UFUNCTION()
	void CleanUpSpawners();
	
	FTimerHandle Timer_Handle_SpawnDelay;
};
