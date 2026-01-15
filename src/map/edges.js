import { enforceSymmetry } from "./symmetry.js";

export const EDGES = {
  //==========================
  //Grass tiles
  //==========================
  grass_empty: {
    up: [
      "grass_empty",
      "grass_grass",
      "grass_flower",
      
    ],
    down: [
      "grass_empty",
      "grass_grass",
      "grass_flower"
    ],
    left: [
      "grass_empty",
      "grass_grass",
      "grass_flower"
    ],
    right: [
      "grass_empty",
      "grass_grass",
      "grass_flower"
    ]
  },
  grass_grass: {
    up: [
      "grass_empty",
      "grass_grass",
      "grass_flower"
    ],
    down: [
      "grass_empty",
      "grass_grass",
      "grass_flower"
    ],
    left: [
      "grass_empty",
      "grass_grass",
      "grass_flower"
    ],
    right: [
      "grass_empty",
      "grass_grass",
      "grass_flower"
    ]
  },
  grass_flower: {
    up: [
      "grass_empty",
      "grass_grass",
      "grass_flower"
    ],
    down: [
      "grass_empty",
      "grass_grass",
      "grass_flower"
    ],
    left: [
      "grass_empty",
      "grass_grass",
      "grass_flower"
    ],
    right: [
      "grass_empty",
      "grass_grass",
      "grass_flower"
    ]
  },

  //==========================
  // Water Tiles L
  //==========================
  water_connectsgrass_tl: {
    up: [],
    down: [],
    left: [],
    right: []
  },
  water_connectsgrass_bl: {
    up: [],
    down: [],
    left: [],
    right: []
  },
  water_connectsgrass_tl_corner: {
    up: [],
    down: [],
    left: [],
    right: []
  },
  water_connectsgrass_bl_corner: {
    up: [],
    down: [],
    left: [],
    right: []
  },

  //==========================
  // Water Tiles R
  //==========================
  water_connectsgrass_tr: {
    up: [],
    down: [],
    left: [],
    right: []
  },
  water_connectsgrass_br: {
    up: [],
    down: [],
    left: [],
    right: []
  },
  water_connectsgrass_tr_corner: {
    up: [],
    down: [],
    left: [],
    right: []
  },
  water_connectsgrass_br_corner: {
    up: [],
    down: [],
    left: [],
    right: []
  },

  //==========================
  // Water Tiles C
  //==========================
  water_center: {
    up: [],
    down: [],
    left: [],
    right: []
  },
  water_connectsgrass_l: {
    up: [],
    down: [],
    left: [],
    right: []
  },
  water_connectsgrass_r: {
    up: [],
    down: [],
    left: [],
    right: []
  },
  water_connectsgrass_t: {
    up: [],
    down: [],
    left: [],
    right: []
  },
  water_connectsgrass_b: {
    up: [],
    down: [],
    left: [],
    right: []
  },

  //==========================
  //River to water connections
  //==========================
  water_connectsriver_l: {
    up: [],
    down: [],
    left: [],
    right: []
  },
  water_connectsriver_r: {
    up: [],
    down: [],
    left: [],
    right: []
  },
  water_connectsriver_t: {
    up: [],
    down: [],
    left: [],
    right: []
  },
  water_connectsriver_b: {
    up: [],
    down: [],
    left: [],
    right: []
  },

  //==========================
  //River Tiles L
  //==========================
  river_connectsgrass_bl: {
    up: [],
    down: [],
    left: [],
    right: []
  },
  river_connectsgrass_tl: {
    up: [],
    down: [],
    left: [],
    right: []
  },

  //==========================
  //River Tiles R
  //==========================
  river_connectsgrass_tr: {
    up: [],
    down: [],
    left: [],
    right: []
  },
  river_connectsgrass_br: {
    up: [],
    down: [],
    left: [],
    right: []
  },

  //==========================
  //River Tiles C
  //==========================
  river_connectsgrass_tb: {
    up: [],
    down: [],
    left: [],
    right: []
  },
  river_connectsgrass_lr: {
    up: [],
    down: [],
    left: [],
    right: []
  },

  //==========================
  //River Endings
  //==========================
  river_connectsgrass_tbl: {
    up: [],
    down: [],
    left: [],
    right: []
  },
  river_connectsgrass_tbr: {
    up: [],
    down: [],
    left: [],
    right: []
  },
  river_connectsgrass_trl: {
    up: [],
    down: [],
    left: [],
    right: []
  },
  river_connectsgrass_brl: {
    up: [],
    down: [],
    left: [],
    right: []
  }
};

enforceSymmetry(EDGES);
console.log("Generated EDGES:", EDGES);