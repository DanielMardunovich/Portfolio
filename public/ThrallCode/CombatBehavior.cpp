#include "CombatBehavior.h"

void CombatAgent::UpdateTactics(const TacticContext &ctx) {
  // Merge shared context with local state to choose behavior
  if (ctx.priority > 5) {
    // enter aggressive state
  } else {
    // hold position / flank
  }
}

void CombatAgent::ApplyTactics() {
  // execute chosen actions
}
