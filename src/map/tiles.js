export const TILE_SIZE = 16;

export const TILES = [
  //Full grass tiles
  { id: "grass_empty", sx: 0, sy: 0, weight: 75 },
  { id: "grass_grass", sx: 1, sy: 0, weight: 50 },
  { id: "grass_flower", sx: 2, sy: 0, weight: 6 },

  // Water Tiles L
  { id: "water_connectsgrass_tl", sx: 0, sy: 1, weight: 1 },
  { id: "water_connectsgrass_bl", sx: 0, sy: 3, weight: 1 },
  { id: "water_connectsgrass_tl_corner", sx: 0, sy: 5, weight: 1 },
  { id: "water_connectsgrass_bl_corner", sx: 3, sy: 5, weight: 1 },

  // Water Tiles R
  { id: "water_connectsgrass_tr", sx: 2, sy: 1, weight: 1 },
  { id: "water_connectsgrass_br", sx: 2, sy: 3, weight: 1 },
  { id: "water_connectsgrass_tr_corner", sx: 1, sy: 5, weight: 1 },
  { id: "water_connectsgrass_br_corner", sx: 2, sy: 5, weight: 1 },

  // Water Tiles C
  { id: "water_center", sx: 1, sy: 2, weight: 1 },
  { id: "water_connectsgrass_l", sx: 0, sy: 2, weight: 1 },
  { id: "water_connectsgrass_r", sx: 2, sy: 2, weight: 1 },
  { id: "water_connectsgrass_t", sx: 1, sy: 1, weight: 1 },
  { id: "water_connectsgrass_b", sx: 1, sy: 3, weight: 1 },

  //River to water connections
  { id: "water_connectsriver_l", sx: 2, sy: 4, weight: 1 },
  { id: "water_connectsriver_r", sx: 0, sy: 4, weight: 1 },
  { id: "water_connectsriver_t", sx: 3, sy: 2, weight: 1 },
  { id: "water_connectsriver_b", sx: 3, sy: 4, weight: 1 },

  //River Tiles L
  { id: "river_connectsgrass_bl", sx: 3, sy: 1, weight: 1 },
  { id: "river_connectsgrass_tl", sx: 3, sy: 0, weight: 1 },

  //River Tiles R
  { id: "river_connectsgrass_tr", sx: 4, sy: 0, weight: 1 },
  { id: "river_connectsgrass_br", sx: 4, sy: 1, weight: 1 },

  //River Tiles C
  { id: "river_connectsgrass_tb", sx: 1, sy: 4, weight:1 },
  { id: "river_connectsgrass_lr", sx: 3, sy: 3, weight: 1},
  
   //River Endings
  { id: "river_connectsgrass_tbl", sx: 6, sy: 1, weight: 1 },
  { id: "river_connectsgrass_tbr", sx: 6, sy: 0, weight: 1 },
  { id: "river_connectsgrass_trl", sx: 5, sy: 0, weight: 1 },
  { id: "river_connectsgrass_brl", sx: 5, sy: 1, weight: 1 },

];