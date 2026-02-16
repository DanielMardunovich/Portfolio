export const FACTION = {
  FRIENDLY: "friendly",
  ENEMY: "enemy"
};

export const UNIT_SPRITES = {
  FRIENDLY_SOLDIER: { sx: 16, sy: 6 },
  FRIENDLY_ARCHER:  { sx: 16, sy: 7 },

  ENEMY_SOLDIER:    { sx: 16, sy: 8 },
  ENEMY_ARCHER:     { sx: 16, sy: 9 }
};


export function createUnit({
  id,
  faction,
  sprite,
  x,
  y,
  hp = 10,
  atk = 3,
  move = 4,
  range = 1
}) {
  return {
    id,
    faction,
    sprite,
    x,
    y,
    hp,
    atk,
    move,
    range,
    hasActed: false
  };
}

// Unit registry & factory --------------------------------------------------
// This allows creating reusable unit classes (see ./units/UnitBase.js)
const UnitRegistry = new Map();

export function registerUnitType(typeName, unitClass) {
  if (!typeName || !unitClass) throw new Error("registerUnitType requires (typeName, unitClass)");
  UnitRegistry.set(typeName, unitClass);
}

export function createUnitFromType(typeName, { id, x = 0, y = 0 } = {}) {
  const UnitClass = UnitRegistry.get(typeName);
  if (!UnitClass) throw new Error(`Unknown unit type: ${typeName}`);
  // UnitClass is expected to be a class derived from the UnitBase exported in ./units/UnitBase.js
  const def = new UnitClass({ id });
  // Convert definition into a runtime unit (game-friendly object)
  return {
    id: def.id || id,
    type: typeName,
    faction: def.faction,
    sprite: def.sprite,
    x,
    y,
    hp: def.hp,
    atk: def.atk,
    move: def.move,
    range: def.range,
    hasActed: false,
    // metadata for UI (info panel images/text etc.)
    meta: {
      images: def.images || [],
      info: def.info || {}
    }
  };
}

export function listRegisteredUnitTypes() {
  return Array.from(UnitRegistry.keys());
}

