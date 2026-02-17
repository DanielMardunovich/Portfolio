// Fill out your copyright notice in the Description page of Project Settings.


#include "AIManager.h"

#include "SCR_SpawnPoint.h"
#include "Components/BoxComponent.h"
#include "Components/SCR_ActivatableComponent.h"
#include "Components/SCR_ObjectPoolComponent.h"
#include "Rooms/SCR_RoomManager.h"
#include "Team8_GP3/Character/AI/SCR_AI_Base.h"
#include "Team8_GP3/Character/AI/AIController/SCR_AI_Base_Controller.h"
#include "Team8_GP3/Character/Player/SCR_HealthComponent.h"
#include "Team8_GP3/Character/Player/SCR_Possession_Component.h"


void AAIManager::Destroyed()
{
	Super::Destroyed();

	UE_LOG(LogTemp, Warning, TEXT("I GOT DESTROYED Destroyed"));
}

// Sets default values
AAIManager::AAIManager(const FObjectInitializer& ObjectInitializer)
: Super(ObjectInitializer)
{

	ObjectPool = CreateDefaultSubobject<USCR_ObjectPoolComponent>(TEXT("Object pool"));

	StaticMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("StaticMesh"));
	RootComponent = StaticMesh;

	ActivateAIBox = CreateDefaultSubobject<UBoxComponent>(TEXT("Activate AI Trigger box"));

	SpawnPoints.Empty();
	
	// Set this actor to call Tick() every frame.  You can turn this off to improve performance if you don't need it.
	PrimaryActorTick.bCanEverTick = true;
}

// Called when the game starts or when spawned
void AAIManager::BeginPlay()
{
	Super::BeginPlay();

	ActivateAIBox->OnComponentBeginOverlap.AddDynamic(this, &AAIManager::ActivateAIOnOverlap);
}

void AAIManager::ActivateAIOnOverlap(UPrimitiveComponent* OverlappedComp, AActor* OtherActor,
	UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult)
{
	auto* possessionComponent = OtherActor->GetComponentByClass<USCR_Possession_Component>();
    if(!possessionComponent)
    	return;
	if (possessionComponent->bIsPlayer)
	{
		if (auto* Agent = Cast<ASCR_AI_Base>(OtherActor))
			if (Agent->ShouldNotGetAddedToManager == false)
				AddAgent(Agent);
		ActivateAgents(true);
		UE_LOG(LogTemp, Error, TEXT("Active Agents"));

		ActivateAIBox->DestroyComponent();
	}
}

void AAIManager::ManageTimers(bool ShouldStart)
{
	if(ShouldStart)
	{
		FTimerDelegate Delegate;
		Delegate.BindUFunction(this, "SpawnUnits"); 
		
		GetWorld()->GetTimerManager().SetTimer(Timer_Handle_SpawnDelay, Delegate, SpawnDelay, true, SpawnDelay);
	}
	else
	{
		GetWorld()->GetTimerManager().ClearTimer(Timer_Handle_SpawnDelay);
	}
}

void AAIManager::SpawnUnits()
{
	switch (SpawnType)
	{
	case ESpawnUnitType::SpawnAllAgentsAtTheSameTime:
		SpawnAllAgents();
		break;
	case ESpawnUnitType::SpawnFromClosest:
		SpawnAgentsFromClosestSpawner();
		break;
	case ESpawnUnitType::SpawnFromFurthest:
		SpawnAgentsFromFurthestSpawner();
		break;
	case ESpawnUnitType::SpawnFromRandom:
		SpawnAgentsFromRandomSpawner();
		break;
	default:
		break;
	}

	CleanUpSpawners();
}

void AAIManager::SpawnAllAgents()
{
	for (auto* spawnPoint : SpawnPoints)
	{		
		if (!spawnPoint || spawnPoint->shouldDestroy)
			continue;

		if (ChunkSpawning)
		{
			while (spawnPoint->SpawnSize > 0)
			{
				spawnPoint->SpawnUnit();
			}
		}
		else
		{
			spawnPoint->SpawnUnit();
		}
		
		if (spawnPoint->SpawnSize <= 0)
			spawnPoint->shouldDestroy = true;
	}
}

void AAIManager::SpawnAgentsFromClosestSpawner()
{
	auto* target = GetGameInstance()->GetSubsystem<USCR_AIBrainSubsystem>()->GetAITarget();
	if (!target)
	{
		//Failsafe to fall back to normal spawn type
		SpawnAllAgents();
		return;
	}
	
	USCR_SpawnPoint* Closets = nullptr;

	for (auto* spawnPoint : SpawnPoints)
	{
		if (!spawnPoint || spawnPoint->shouldDestroy) continue;

		if (!Closets)
		{
			Closets = spawnPoint;
			continue;
		}

		float distToPlayerFromSpawnPoint = FVector::Dist(spawnPoint->GetComponentLocation(), target->GetActorLocation());
		float distToPlayerFromClostest = FVector::Dist(Closets->GetComponentLocation(), target->GetActorLocation());

		if (distToPlayerFromClostest > distToPlayerFromSpawnPoint)
		{
			Closets = spawnPoint;
		}
	}

	if (!Closets) return;
	
	if (ChunkSpawning)
	{
		while (Closets->SpawnSize > 0)
		{
			Closets->SpawnUnit();
		}
	}
	else
	{
		Closets->SpawnUnit();
	}

	if (Closets->SpawnSize <= 0)
		Closets->shouldDestroy = true;	
}

void AAIManager::SpawnAgentsFromFurthestSpawner()
{
	auto* target = GetGameInstance()->GetSubsystem<USCR_AIBrainSubsystem>()->GetAITarget();
	if (!target)
	{
		//Failsafe to fall back to normal spawn type
		SpawnAllAgents();
		return;
	}
	
	USCR_SpawnPoint* Furthest = nullptr;

	for (auto* spawnPoint : SpawnPoints)
	{
		if (!spawnPoint || spawnPoint->shouldDestroy) continue;

		if (!Furthest)
		{
			Furthest = spawnPoint;
			continue;
		}

		float distToPlayerFromSpawnPoint = FVector::Dist(spawnPoint->GetComponentLocation(), target->GetActorLocation());
		float distToPlayerFromFurthest = FVector::Dist(Furthest->GetComponentLocation(), target->GetActorLocation());

		if (distToPlayerFromFurthest < distToPlayerFromSpawnPoint)
		{
			Furthest = spawnPoint;
		}
	}

	if (!Furthest) return;

	if (ChunkSpawning)
	{
		while (Furthest->SpawnSize > 0)
		{
			Furthest->SpawnUnit();
		}
	}
	else
	{
		Furthest->SpawnUnit();
	}
	

	if (Furthest->SpawnSize <= 0)
		Furthest->shouldDestroy = true;	
}

void AAIManager::SpawnAgentsFromRandomSpawner()
{	
	TArray<USCR_SpawnPoint*> ValidEntries;
	
	for (auto* Entry : SpawnPoints)
	{		
		if (Entry != nullptr)
			if (!Entry->shouldDestroy)
				if (Entry->SpawnSize > 0)
					ValidEntries.Add(Entry);
	}

	if (ValidEntries.Num() <= 0)
	{
		ManageTimers(false);
		return;
	}

	if (ValidEntries.Num() > 0)
	{
		int32 RandomIndex = FMath::RandHelper(ValidEntries.Num());

		if (auto* RandomSpawnPoint = ValidEntries[RandomIndex])
		{
			if (ChunkSpawning)
			{
				while (RandomSpawnPoint->SpawnSize > 0)
				{
					RandomSpawnPoint->SpawnUnit();
				}
			}
			else
			{
				RandomSpawnPoint->SpawnUnit();
			}

			for (auto* Entry : SpawnPoints)
			{
				if (Entry->SpawnSize <= 0)
					Entry->shouldDestroy = true;
			}
		}
	}
}

void AAIManager::CleanUpSpawners()
{
	for (int i = 0; i < SpawnPoints.Num(); i++)
	{
		if (!SpawnPoints[i]) continue;
		
		if (SpawnPoints[i]->shouldDestroy)
		{
			SpawnPoints[i]->DestroyComponent();
		}
	}

	SpawnPoints.Shrink();
}

void AAIManager::AddAgent(ASCR_AI_Base* Agent)
{
	if (!Agent) return;

	if(Agent->GetComponentByClass<USCR_ActivatableComponent>()->bIsEnabled)
	{
		if (!ActiveAgents.Contains(Agent))
			ActiveAgents.Add(Agent);
	}	
	else 
	{
		if (!InactiveAgents.Contains(Agent))
			InactiveAgents.Add(Agent);
	}
		
}

void AAIManager::MoveAgentToActive(ASCR_AI_Base* Agent)
{
	if (InactiveAgents.Contains(Agent) && !ActiveAgents.Contains(Agent))
	{
		InactiveAgents.Remove(Agent);

		ActiveAgents.Add(Agent);
	}
}

void AAIManager::MoveAgentToInActive(ASCR_AI_Base* Agent)
{
	if (!InactiveAgents.Contains(Agent) && ActiveAgents.Contains(Agent))
	{
		ActiveAgents.Remove(Agent);

		InactiveAgents.Add(Agent);
	}
}

void AAIManager::AddSpawnPoint(USCR_SpawnPoint* point)
{
	if (!SpawnPoints.Contains(point))
	{
		SpawnPoints.Add(point);
	}
}

void AAIManager::ActivateAgents(bool activeStatus)
{
	if (activeStatus)
	{
		ActiveAgents.Append(InactiveAgents);
		InactiveAgents.Reset();

		for(auto* agent : ActiveAgents)
		{
			if (!agent) continue;
			
			agent->GetComponentByClass<USCR_HealthComponent>()->OnDeathWithLocation.AddDynamic(this, &AAIManager::CheckIfRoomIsClear);

			agent->OnAIAggro.AddDynamic(this, &AAIManager::ShouldActivateHord);
			//auto* controller = Cast<ASCR_AI_Base_Controller>(agent->GetController());
			
			//if (!controller) continue;
			
			//controller->State = EAIState::Attacking;
			//controller->ActivateAI();
		}

		ManageTimers(true);
	}
	else
	{
		InactiveAgents.Append(ActiveAgents);
		ActiveAgents.Reset();

		for(auto* agent : InactiveAgents)
		{
			if (!agent) continue;
			
			agent->GetComponentByClass<USCR_HealthComponent>()->OnDeathWithLocation.RemoveAll(this);
			auto* controller = Cast<ASCR_AI_Base_Controller>(agent->GetController());

			if (!controller) continue;
			
			controller->State = EAIState::Idle;
			controller->ActivateAI();
		}

		ManageTimers(false);
	}
	
	GetWorld()->GetGameInstance()->GetSubsystem<USCR_AIBrainSubsystem>()->SendActivatedStatus();

	SetActorTickEnabled(activeStatus);
}

void AAIManager::CheckIfRoomIsClear(ASCR_PlayerCharacter* character, FVector lastDeathLocation)
{
	MoveAgentToInActive(static_cast<ASCR_AI_Base*>(character));
	character->GetComponentByClass<USCR_HealthComponent>()->OnDeathWithLocation.RemoveAll(this);

	if (ActiveAgents.Num() == 0 || ActiveAgents.Num() == 1 && ActiveAgents[0]->GetComponentByClass<USCR_Possession_Component>()->bIsPlayer)
	{
		ActivateAgents(false);
		OnAllAgentsDead.Broadcast();

		DropMemoryShard(lastDeathLocation);
	}
	if (bLastManStandingActive == false && ((InactiveAgents.Num()/TotalEnemies) >= LastManStandingThreshold))
	{
		UE_LOG(LogTemp, Warning, TEXT("LastManStanding Activated"));
		bLastManStandingActive = true;
		OnLastManStanding.Broadcast();
		for (auto* agent : ActiveAgents)
		{
			agent->bIsAILastManStanding = true;
		}
	}
}

void AAIManager::ShouldActivateHord()
{
	if (HordActive) return;
	
	AggroedEnemies++;

	OnAIActivate.Broadcast();

	if (AggroedEnemies >= MaxAggroedEnemies)
	{
		for(auto* agent : ActiveAgents)
		{
			if (!agent) continue;

			agent->OnAIAggro.RemoveDynamic(this, &AAIManager::ShouldActivateHord);
			
			auto* controller = Cast<ASCR_AI_Base_Controller>(agent->GetController());
			
			if (!controller) continue;
			
			controller->State = EAIState::Attacking;
			controller->ActivateAI();
		}
		HordActive = true;
		OnHordStarted.Broadcast();
	}
}

void AAIManager::IsLastManStanding()
{
}

void AAIManager::DropMemoryShard(const FVector& SpawnLocation)
{
	int shardAmount = MemoryShardsToDrop.Num();
	
	for (int i = 0; i < shardAmount; i++)
	{
		float Radius = ShardSpawningRadius;
		FVector Center = SpawnLocation;
		FVector location;
	
		if (shardAmount == 1) location = SpawnLocation;
		else
		{
			float AngleRadians = (2 * PI / shardAmount) * i;
			location = Center + FVector(FMath::Cos(AngleRadians), FMath::Sin(AngleRadians), 0.f) * Radius;
		}
			
		FActorSpawnParameters SpawnParams;
		GetWorld()->SpawnActor<AActor>(MemoryShardsToDrop[i], location, FRotator::ZeroRotator, SpawnParams);
	}
}
