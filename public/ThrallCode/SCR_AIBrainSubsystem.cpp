// Fill out your copyright notice in the Description page of Project Settings.


#include "SCR_AIBrainSubsystem.h"

#include "SCR_AI_Base.h"
#include "Kismet/GameplayStatics.h"
#include "Team8_GP3/Character/Player/SCR_Possession_Component.h"

void USCR_AIBrainSubsystem::SendActivatedStatus()
{
	OnAIActivate.Broadcast();
}

AActor* USCR_AIBrainSubsystem::GetAITarget(bool debug)
{
	if (debug)
		return DebugTarget;

	if (auto* pawn = UGameplayStatics::GetPlayerController(GetWorld(), 0)->GetPawnOrSpectator())
	{
		if (pawn->GetComponentByClass<USCR_Possession_Component>()->bIsPlayer)
			return pawn;
	}
	
	return nullptr;
}

void USCR_AIBrainSubsystem::SetDebugTarget(AActor* target)
{
	DebugTarget = target;
}

bool USCR_AIBrainSubsystem::ReserveAttackToken(ECharacterType type, int Ammount)
{
	switch (type)
	{
	case ECharacterType::Melee:
		if (MeleeAttackTokens >= Ammount)
		{			
			MeleeAttackTokens -= Ammount;
			return true;
		}
		break;
	case ECharacterType::Ranged:
		if (RangedAttackTokens >= Ammount)
		{
			RangedAttackTokens -= Ammount;
			return true;
		}
		break;
	case ECharacterType::Caster:
		UE_LOG(LogTemp, Error, TEXT("ReturnAttackToken SCR_AIBranSubSystem Caster: NOT IMPLEMENTED"));
		break;
	default:
		UE_LOG(LogTemp, Error, TEXT("ReturnAttackToken SCR_AIBranSubSystem default: NOT IMPLEMENTED"))
		return false;
	}
	
	return false;
}

void USCR_AIBrainSubsystem::ReturnAttackToken(ECharacterType type, int Ammount)
{
	switch (type)
	{
	case ECharacterType::Melee:
		MeleeAttackTokens += Ammount;

		if (MeleeAttackTokens > MaxMeleeAttackTokens)
			MeleeAttackTokens = MaxMeleeAttackTokens;
		break;
	case ECharacterType::Ranged:
		RangedAttackTokens += Ammount;

		if (RangedAttackTokens > MaxRangedAttackTokens)
			RangedAttackTokens = MaxRangedAttackTokens;
		break;
	case ECharacterType::Caster:
		UE_LOG(LogTemp, Error, TEXT("ReturnAttackToken SCR_AIBranSubSystem Caster: NOT IMPLEMENTED"));
		break;
	default:
		UE_LOG(LogTemp, Error, TEXT("ReturnAttackToken SCR_AIBranSubSystem default: NOT IMPLEMENTED"));
		break;
	}
}

void USCR_AIBrainSubsystem::AllowedAttackers(ECharacterType type, int Ammount)
{
	switch (type)
	{
	case ECharacterType::Melee:
		MeleeAttackTokens = Ammount;

		MaxMeleeAttackTokens = Ammount;
		break;
	case ECharacterType::Ranged:
		RangedAttackTokens = Ammount;

		MaxRangedAttackTokens = Ammount;
		break;
	case ECharacterType::Caster:
		UE_LOG(LogTemp, Error, TEXT("ReturnAttackToken SCR_AIBranSubSystem Caster: NOT IMPLEMENTED"));
		break;
	default:
		UE_LOG(LogTemp, Error, TEXT("ReturnAttackToken SCR_AIBranSubSystem default: NOT IMPLEMENTED"));
		break;
	}
}
