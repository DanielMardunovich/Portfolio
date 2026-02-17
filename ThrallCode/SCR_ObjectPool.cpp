#include "SCR_ObjectPool.h"
#include "Engine/World.h"
#include "Team8_GP3/GameModes/SCR_GMPrototype.h"
//#include "EntitySystem/MovieSceneEntitySystemRunner.h"

ASCR_ObjectPool::ASCR_ObjectPool()
{
	PrimaryActorTick.bCanEverTick = false;
	// Initialize the pool into the world

}

void ASCR_ObjectPool::BeginPlay()
{
	Super::BeginPlay();
	if (InitialPoolSize <= 0)
	{
		InitialPoolSize = 10; // Default initial size if not set
	}
	if (PoolTopUpSize <= 0)
	{
		PoolTopUpSize = 5; // Default top-up size if not set
	}
	TopUpPool();
	// Add this pool to the global object pools set
	ASCR_GMPrototype* GameMode = Cast<ASCR_GMPrototype>(GetWorld()->GetAuthGameMode());
	if (GameMode)
	{
		GameMode->ObjectPools.Add(this);
	}
	else
	{
		UE_LOG(LogTemp, Warning, TEXT("GameMode is not set or not of type ASCR_GMPrototype!"));
	}
}

void ASCR_ObjectPool::TopUpPool()
{
	if (!PooledActorClass) return;

	int PoolIncrease = IsPoolEmpty() ? InitialPoolSize : PoolTopUpSize;
	
	for (int32 i = 0; i < PoolIncrease; ++i)
	{
		FActorSpawnParameters SpawnParams;
		SpawnParams.Owner = this;
		SpawnParams.Instigator = GetInstigator();

		AActor* SpawnedActor = GetWorld()->SpawnActor<AActor>(
			PooledActorClass,
			FVector::ZeroVector,
			FRotator::ZeroRotator,
			SpawnParams
		);

		if (SpawnedActor)
		{
			//SpawnedActor->AttachToActor(this, FAttachmentTransformRules::KeepRelativeTransform);
			
			USCR_ActivatableComponent* ActivatableComp = 
				Cast<USCR_ActivatableComponent>(SpawnedActor->FindComponentByClass(USCR_ActivatableComponent::StaticClass()));

			if (!ActivatableComp)
			{
				ActivatableComp = NewObject<USCR_ActivatableComponent>(SpawnedActor);
				if (ActivatableComp)
				{
					ActivatableComp->RegisterComponent();
				}
			}

			if (ActivatableComp) ActivatableComp->Disable();

			PooledActors.Add(ActivatableComp);
		}
	}
}

AActor* ASCR_ObjectPool::GetPooledActor()
{
	for (USCR_ActivatableComponent* Comp : PooledActors)
	{
		AActor* Actor = Comp->GetOwner();
		if (Actor && Actor->IsHidden()) return Actor;
	}

	TopUpPool();
	return GetPooledActor();
}

USCR_ActivatableComponent* ASCR_ObjectPool::GetPooledActivatableComponent()
{
	for (USCR_ActivatableComponent* Comp : PooledActors)
	{
		if (Comp && !Comp->bIsEnabled) return Comp;
	}

	TopUpPool();
	return GetPooledActivatableComponent();
}

AActor* ASCR_ObjectPool::GetPooledActorRoundRobin()
{
	// Double-check empty pool
	if (PooledActors.Num() == 0)
	{
		UE_LOG(LogTemp, Warning, TEXT("No actors in pool - attempting top-up"));
		TopUpPool();
		if (PooledActors.Num() == 0)
		{
			UE_LOG(LogTemp, Error, TEXT("Failed to create any pooled actors!"));
			return nullptr;
		}
	}

	CurrentPoolIndex %= PooledActors.Num();
	
	// Get component
	USCR_ActivatableComponent* Comp = PooledActors[CurrentPoolIndex++];

	if (!Comp)
	{
		UE_LOG(LogTemp, Warning, TEXT("Null component in pool!"));
		return nullptr;
	}
	
	Comp->Enable();
    
	return Comp->GetOwner();
}

USCR_ActivatableComponent* ASCR_ObjectPool::GetPooledActivatableComponentRoundRobin()
{
	if (PooledActors.Num() == 0)
	{
		UE_LOG(LogTemp, Warning, TEXT("No actors in pool!"));
		TopUpPool();
		if (PooledActors.Num() == 0)
		{
			UE_LOG(LogTemp, Warning, TEXT("Pool still empty after top-up!"));
			return nullptr;
		}
	}

	USCR_ActivatableComponent* Comp = PooledActors[CurrentPoolIndex];
    
	// Move to next index (with wrap-around)
	CurrentPoolIndex = (CurrentPoolIndex + 1) % PooledActors.Num();

	if (Comp)
	{
		Comp->Enable();
		return Comp;
	}

	return nullptr;
}


void ASCR_ObjectPool::ClearPool()
{
	CleanupPool();
}

void ASCR_ObjectPool::EndPlay(const EEndPlayReason::Type EndPlayReason)
{
	Super::EndPlay(EndPlayReason);
	CleanupPool();
}

void ASCR_ObjectPool::Destroyed()
{
	Super::Destroyed();
	CleanupPool();
}

void ASCR_ObjectPool::CleanupPool()
{
	// We need to destroy the actors, not just the components
	for (USCR_ActivatableComponent* Comp : PooledActors)
	{
		if (Comp)
		{
			AActor* ActorOwner = Comp->GetOwner();
			if (ActorOwner)
			{
				// Ensure the actor is properly destroyed
				ActorOwner->Destroy();
			}
		}
	}
    
	PooledActors.Empty();
}
