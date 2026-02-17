// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "SCR_AIBrainSubsystem.generated.h"

UENUM(BlueprintType)
enum class ECharacterType : uint8
{
	Melee     UMETA(DisplayName = "Melee"),
	Ranged     UMETA(DisplayName = "Ranged"),
	Caster     UMETA(DisplayName = "Caster"),
	Random     UMETA(DisplayName = "Caster")
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnActivateAI);

/**
 * 
 */
UCLASS()
class TEAM8_GP3_API USCR_AIBrainSubsystem : public UGameInstanceSubsystem
{
public:
	UFUNCTION(BlueprintCallable)
	void SendActivatedStatus();

	UFUNCTION(BlueprintCallable)
	AActor* GetAITarget(bool debug = false);

	UFUNCTION(BlueprintCallable)
	void SetDebugTarget(AActor* target);
	
	UPROPERTY(BlueprintAssignable, BlueprintCallable)
	FOnActivateAI OnAIActivate;

	//Attack tokens
public:	
	UFUNCTION(BlueprintCallable)
	bool ReserveAttackToken(ECharacterType type, int Ammount);

	UFUNCTION(BlueprintCallable)
	void ReturnAttackToken(ECharacterType type, int Ammount);

	UFUNCTION(BlueprintCallable)
	void AllowedAttackers(ECharacterType type, int Ammount);
	
private:
	GENERATED_BODY()
	
	UPROPERTY(Transient)
	AActor* DebugTarget = nullptr;

protected:
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	int MeleeAttackTokens = 1;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	int MaxMeleeAttackTokens = 1;
	
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	int RangedAttackTokens = 1;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	int MaxRangedAttackTokens = 1;
};
