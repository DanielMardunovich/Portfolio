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

