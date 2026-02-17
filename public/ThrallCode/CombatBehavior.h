// Simple shared tactic blackboard example
struct TacticContext {
  int priority;
  // placeholder vector
  float tx, ty, tz;
};

class CombatAgent {
public:
  void UpdateTactics(const TacticContext &ctx);
  void ApplyTactics();
};
