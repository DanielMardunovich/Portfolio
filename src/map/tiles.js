export const TILE_SIZE = 16;

export const TILES = [
  { id: "grass", sx: 0, sy: 0, weight: 6 },
  { id: "grass1", sx: 1, sy: 0, weight: 6 },
  { id: "grass2", sx: 2, sy: 0, weight: 6 },

  { id: "water", sx: 1, sy: 2, weight: 1 },

  //Water Tiles
    //L

    { id: "water_corner_tl", sx: 0, sy: 1, weight: 1 },
    { id: "water_corner_cl", sx: 0, sy: 2, weight: 1 },
    { id: "water_corner_bl", sx: 0, sy: 3, weight: 1 },

    { id: "water_dirtcorner_tl", sx: 0, sy: 5, weight: 1 },
    { id: "water_dirtcorner_bl", sx: 3, sy: 5, weight: 1 },

  //R
    { id: "water_corner_tr", sx: 2, sy: 1, weight: 1 },
    { id: "water_corner_br", sx: 2, sy: 3, weight: 1 },
  
    { id: "water_corner_cr", sx: 2, sy: 2, weight: 1 },
    { id: "water_dirtcorner_tr", sx: 1, sy: 5, weight: 1 },
    { id: "water_dirtcorner_br", sx: 2, sy: 5, weight: 1 },
  
  //C
    { id: "water_corner_tc", sx: 1, sy: 1, weight: 1 },
    { id: "water_corner_bc", sx: 1, sy: 3, weight: 1 },
  


  //River tiles
    //U D
    { id: "river_entrance_d", sx: 3, sy: 2, weight: 1 },
    { id: "river_d", sx: 3, sy: 3, weight: 1},
    { id: "river_ending_d", sx: 5, sy: 1, weight: 1 },

    { id: "river_entrance_u", sx: 3, sy: 4, weight: 1 },
    { id: "river_ending_u", sx: 5, sy: 0, weight: 1 },

    //C
    { id: "river_rl", sx: 1, sy: 4, weight:1 },

    //R
    { id: "river_ending_r", sx: 6, sy: 0, weight: 1 },
    { id: "river_entrance_r", sx: 0, sy: 4, weight: 1 },
    { id: "river_tr", sx: 4, sy: 0, weight: 1 },
    { id: "river_br", sx: 4, sy: 1, weight: 1 },

    //L
    { id: "river_bl", sx: 3, sy: 1, weight: 1 },
    { id: "river_ending_l", sx: 6, sy: 1, weight: 1 },
    { id: "river_tl", sx: 3, sy: 0, weight: 1 },
    { id: "river_entrance_l", sx: 2, sy: 4, weight: 1 },

];