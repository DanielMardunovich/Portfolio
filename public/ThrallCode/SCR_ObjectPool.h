#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Components/SCR_ActivatableComponent.h"
#include "SCR_ObjectPool.generated.h"


UCLASS()
class TEAM8_GP3_API ASCR_ObjectPool : public AActor
{
	GENERATED_BODY()

public:
	ASCR_ObjectPool();

protected:
	virtual void BeginPlay() override;

public:
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Pooling")
	TSubclassOf<AActor> PooledActorClass;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Pooling")
	int32 InitialPoolSize = 10;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Pooling")
	int32 PoolTopUpSize = 10;

	UFUNCTION(BlueprintCallable, Category="Pooling")
	AActor* GetPooledActor();

	UFUNCTION(BlueprintCallable, Category="Pooling")
	USCR_ActivatableComponent* GetPooledActivatableComponent();

	UFUNCTION(BlueprintCallable, Category="Pooling")
	AActor* GetPooledActorRoundRobin();

	UFUNCTION(BlueprintCallable, Category="Pooling")
	USCR_ActivatableComponent* GetPooledActivatableComponentRoundRobin();

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Pooling")
	TArray<USCR_ActivatableComponent*> PooledActors;

	UFUNCTION(BlueprintCallable, Category="Pooling")
	void ClearPool();

	virtual void EndPlay(const EEndPlayReason::Type EndPlayReason) override;
	virtual void Destroyed() override;

private:

	int32 CurrentPoolIndex = 0;

	void TopUpPool();

	void CleanupPool();

	bool IsPoolEmpty() const
	{
		return PooledActors.Num() == 0;
	}
};
