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

      "water_connectsgrass_bl",
      "water_connectsgrass_br",
      "water_connectsgrass_b",

      "river_connectsgrass_bl",
      "river_connectsgrass_br",
      "river_connectsgrass_tb",

      "river_connectsgrass_tbl",
      "river_connectsgrass_tbr",
      "river_connectsgrass_brl",
    ],
    down: [
      "grass_empty",
      "grass_grass",
      "grass_flower",

      "water_connectsgrass_tl",
      "water_connectsgrass_tr",
      "water_connectsgrass_t",

      "river_connectsgrass_tl",
      "river_connectsgrass_tr",
      "river_connectsgrass_tb",

      "river_connectsgrass_trl",
      "river_connectsgrass_tbr",
      "river_connectsgrass_tbl",
    ],
    left: [
      "grass_empty",
      "grass_grass",
      "grass_flower",

      "water_connectsgrass_br",
      "water_connectsgrass_tr",
      "water_connectsgrass_r",

      "river_connectsgrass_br",
      "river_connectsgrass_tr",
      "river_connectsgrass_lr",

      "river_connectsgrass_trl",
      "river_connectsgrass_brl",
      "river_connectsgrass_tbr",
    ],
    right: [
      "grass_empty",
      "grass_grass",
      "grass_flower",

      "water_connectsgrass_bl",
      "water_connectsgrass_tl",
      "water_connectsgrass_l",

      "river_connectsgrass_bl",
      "river_connectsgrass_tl",
      "river_connectsgrass_lr",

      "river_connectsgrass_trl",
      "river_connectsgrass_brl",
      "river_connectsgrass_tbl",
    ]
  },
  grass_grass: {
    up: [
      "grass_empty",
      "grass_grass",
      "grass_flower",

      "water_connectsgrass_bl",
      "water_connectsgrass_br",
      "water_connectsgrass_b",

      "river_connectsgrass_bl",
      "river_connectsgrass_br",
      "river_connectsgrass_tb",

      "river_connectsgrass_tbl",
      "river_connectsgrass_tbr",
      "river_connectsgrass_brl",
    ],
    down: [
      "grass_empty",
      "grass_grass",
      "grass_flower",

      "water_connectsgrass_tl",
      "water_connectsgrass_tr",
      "water_connectsgrass_t",

      "river_connectsgrass_tl",
      "river_connectsgrass_tr",
      "river_connectsgrass_tb",

      "river_connectsgrass_trl",
      "river_connectsgrass_tbr",
      "river_connectsgrass_tbl",
    ],
    left: [
      "grass_empty",
      "grass_grass",
      "grass_flower",

      "water_connectsgrass_br",
      "water_connectsgrass_tr",
      "water_connectsgrass_r",

      "river_connectsgrass_br",
      "river_connectsgrass_tr",
      "river_connectsgrass_lr",

      "river_connectsgrass_trl",
      "river_connectsgrass_brl",
      "river_connectsgrass_tbr",
    ],
    right: [
      "grass_empty",
      "grass_grass",
      "grass_flower",

      "water_connectsgrass_bl",
      "water_connectsgrass_tl",
      "water_connectsgrass_l",

      "river_connectsgrass_bl",
      "river_connectsgrass_tl",
      "river_connectsgrass_lr",

      "river_connectsgrass_trl",
      "river_connectsgrass_brl",
      "river_connectsgrass_tbl",
    ]
  },
  grass_flower: {
    up: [
      "grass_empty",
      "grass_grass",
      "grass_flower",

      "water_connectsgrass_bl",
      "water_connectsgrass_br",
      "water_connectsgrass_b",

      "river_connectsgrass_bl",
      "river_connectsgrass_br",
      "river_connectsgrass_tb",

      "river_connectsgrass_tbl",
      "river_connectsgrass_tbr",
      "river_connectsgrass_brl",
    ],
    down: [
      "grass_empty",
      "grass_grass",
      "grass_flower",

      "water_connectsgrass_tl",
      "water_connectsgrass_tr",
      "water_connectsgrass_t",

      "river_connectsgrass_tl",
      "river_connectsgrass_tr",
      "river_connectsgrass_tb",

      "river_connectsgrass_trl",
      "river_connectsgrass_tbr",
      "river_connectsgrass_tbl",
    ],
    left: [
      "grass_empty",
      "grass_grass",
      "grass_flower",

      "water_connectsgrass_br",
      "water_connectsgrass_tr",
      "water_connectsgrass_r",

      "river_connectsgrass_br",
      "river_connectsgrass_tr",
      "river_connectsgrass_lr",

      "river_connectsgrass_trl",
      "river_connectsgrass_brl",
      "river_connectsgrass_tbr",
    ],
    right: [
      "grass_empty",
      "grass_grass",
      "grass_flower",

      "water_connectsgrass_bl",
      "water_connectsgrass_tl",
      "water_connectsgrass_l",

      "river_connectsgrass_bl",
      "river_connectsgrass_tl",
      "river_connectsgrass_lr",

      "river_connectsgrass_trl",
      "river_connectsgrass_brl",
      "river_connectsgrass_tbl",
    ]
  },

  //==========================
  // Water Tiles L
  //==========================
  water_connectsgrass_tl: {
    up: 
    [

    ],
    down: 
    [
      "water_connectsgrass_l",
    ],
    left: 
    [
      "water_connectsriver_t"
    ],
    right: 
    [
      "water_connectsgrass_t",
      "water_connectsriver_t",
    ]
  },
  water_connectsgrass_bl: {
    up: 
    [
      "water_connectsgrass_l",
      "water_connectsriver_l",
    ],
    down: 
    [
      
    ],
    left: 
    [
      
    ],
    right: 
    [
      "water_connectsgrass_b",
      "water_connectsriver_b",
    ]
  },
  water_connectsgrass_tl_corner: {
    up: 
    [
      "water_connectsgrass_tl",
      "water_connectsgrass_l",

      "water_connectsriver_l",

      "water_connectsgrass_bl_corner",
    ],
    down: 
    [
      "water_center"
    ],
    left: 
    [
      "water_connectsgrass_tl",
      "water_connectsriver_t",

      "water_connectsgrass_t",

      "water_connectsgrass_tr_corner",
    ],
    right: 
    [
      "water_center"
    ]
  },
  water_connectsgrass_bl_corner: {
    up: 
    [
      "water_center"
    ],
    down: 
    [
      "water_connectsgrass_bl",
      "water_connectsgrass_l",

      "water_connectsriver_l",

      "water_connectsgrass_tl_corner",
    ],
    left: 
    [
      "water_connectsgrass_bl",
      "water_connectsgrass_b",

      "water_connectsriver_b",

      "water_connectsgrass_br_corner",
    ],
    right: 
    [
      "water_center",
    ]
  },

  //==========================
  // Water Tiles R
  //==========================
  water_connectsgrass_tr: {
    up: 
    [
      
    ],
    down: 
    [
      "water_connectsgrass_r",
      "water_connectsriver_r",
    ],
    left: 
    [
      "water_connectsgrass_t",
      "water_connectsriver_t",
    ],
    right: 
    [

    ]
  },
  water_connectsgrass_br: {
    up: 
    [
      "water_connectsgrass_r",
      "water_connectsriver_t",
    ],
    down: 
    [

    ],
    left: 
    [
      "water_connectsgrass_b",
      "water_connectsriver_t",
    ],
    right: 
    [

    ]
  },
  water_connectsgrass_tr_corner: {
    up: 
    [
      "water_connectsgrass_tr",
      "water_connectsgrass_r",

      "water_connectsriver_r",

      "water_connectsgrass_br_corner",
    ],
    down: 
    [
      "water_center"
    ],
    left: 
    [
      "water_center",
    ],
    right: 
    [
      "water_connectsgrass_tr",
      "water_connectsgrass_t",

      "water_connectsriver_t",

      "water_connectsgrass_tl_corner",
    ]
  },
  water_connectsgrass_br_corner: {
    up: 
    [
      "water_center"
    ],
    down: 
    [
      "water_connectsgrass_br",
      "water_connectsgrass_r",

      "water_connectsriver_r",

      "water_connectsgrass_tr_corner",
    ],
    left: 
    [
      "water_center",
    ],
    right: 
    [
      "water_connectsgrass_br",
      "water_connectsgrass_b",

      "water_connectsriver_b",

      "water_connectsgrass_bl_corner",
    ]
  },

  //==========================
  // Water Tiles C
  //==========================
  water_center: {
    up: 
    [
      "water_center",

      "water_connectsgrass_t",
      "water_connectsriver_t",

      "water_connectsgrass_tl_corner",
      "water_connectsgrass_tr_corner",

      "water_connectsriver_t"


    ],
    down: 
    [
      "water_center",

      "water_connectsgrass_b",
      "water_connectsriver_b",

      "water_connectsgrass_br_corner",
      "water_connectsgrass_bl_corner",

      "water_connectsriver_b"
    ],
    left: 
    [
      "water_center",

      "water_connectsgrass_l",
      "water_connectsriver_l",

      "water_connectsgrass_tl_corner",
      "water_connectsgrass_bl_corner",

      "water_connectsriver_l",
    ],
    right: 
    [
      "water_center",

      "water_connectsgrass_r",
      "water_connectsriver_r",

      "water_connectsgrass_tr_corner",
      "water_connectsgrass_br_corner",

      "water_connectsriver_r",
    ]
  },
  water_connectsgrass_l: {
    up: 
    [
      "water_connectsgrass_l",
      "water_connectsriver_l",
    ],
    down: 
    [
      "water_connectsgrass_l",
      "water_connectsriver_l",
    ],
    left: 
    [

    ],
    right: 
    [

    ]
  },
  water_connectsgrass_r: {
    up: 
    [
      "water_connectsgrass_r",
      "water_connectsriver_r",
    ],
    down: 
    [
      "water_connectsgrass_r",
      "water_connectsriver_r",
    ],
    left: 
    [

    ],
    right: 
    [

    ]
  },
  water_connectsgrass_t: {
    up: 
    [

    ],
    down: 
    [

    ],
    left: 
    [
      "water_connectsgrass_t",
      "water_connectsriver_t",
    ],
    right: 
    [
      "water_connectsgrass_t",
      "water_connectsriver_t",
    ]
  },
  water_connectsgrass_b: {
    up: 
    [

    ],
    down: 
    [

    ],
    left: 
    [
      "water_connectsgrass_b",
      "water_connectsriver_b",
    ],
    right: 
    [
      "water_connectsgrass_b",
      "water_connectsriver_b",
    ]
  },

  //==========================
  //River to water connections
  //==========================
  water_connectsriver_l: {
    up: 
    [

    ],
    down: 
    [

    ],
    left: 
    [
      "river_connectsgrass_tb"
    ],
    right: 
    [

    ]
  },
  water_connectsriver_r: {
    up: 
    [

    ],
    down: 
    [

    ],
    left: 
    [

    ],
    right: 
    [
      "river_connectsgrass_tb"
    ]
  },
  water_connectsriver_t: {
    up: 
    [
      "river_connectsgrass_lr"
    ],
    down: 
    [

    ],
    left: 
    [

    ],
    right: 
    [

    ]
  },
  water_connectsriver_b: {
    up: 
    [

    ],
    down: 
    [
      "river_connectsgrass_lr"
    ],
    left: 
    [

    ],
    right: 
    [

    ]
  },

  //==========================
  //River Tiles L
  //==========================
  river_connectsgrass_bl: {
    up: 
    [
      "river_connectsgrass_lr",
    ],
    down: 
    [

    ],
    left: 
    [

    ],
    right: 
    [
      "river_connectsgrass_tb",
    ]
  },
  river_connectsgrass_tl: {
    up: 
    [

    ],
    down: 
    [
      "river_connectsgrass_lr",
    ],
    left: 
    [

    ],
    right: 
    [
      "river_connectsgrass_tb",
    ]
  },

  //==========================
  //River Tiles R
  //==========================
  river_connectsgrass_tr: {
    up: 
    [

    ],
    down: 
    [
      "river_connectsgrass_lr",
    ],
    left: 
    [
      "river_connectsgrass_tb",
    ],
    right: 
    [

    ]
  },
  river_connectsgrass_br: {
    up: 
    [
      "river_connectsgrass_lr"
    ],
    down: 
    [

    ],
    left: 
    [
      "river_connectsgrass_tb"
    ],
    right: 
    [

    ]
  },

  //==========================
  //River Tiles C
  //==========================
  river_connectsgrass_tb: {
    up: 
    [

    ],
    down: 
    [

    ],
    left: 
    [
      "river_connectsgrass_tb",
    ],
    right: 
    [
      "river_connectsgrass_tb",
    ]
  },
  river_connectsgrass_lr: {
    up: 
    [
      "river_connectsgrass_lr",
    ],
    down: 
    [
      "river_connectsgrass_lr",
    ],
    left: 
    [

    ],
    right: 
    [

    ]
  },

  //==========================
  //River Endings
  //==========================
  river_connectsgrass_tbl: {
    up: 
    [

    ],
    down: 
    [

    ],
    left: 
    [

    ],
    right: 
    [
      "river_connectsgrass_tb",
    ]
  },
  river_connectsgrass_tbr: {
    up: 
    [

    ],
    down: 
    [

    ],
    left: 
    [
      "river_connectsgrass_tb",
    ],
    right: 
    [

    ]
  },
  river_connectsgrass_trl: {
    up: 
    [

    ],
    down: 
    [
      "river_connectsgrass_lr",
    ],
    left: 
    [

    ],
    right: 
    [

    ]
  },
  river_connectsgrass_brl: {
    up: 
    [
      "river_connectsgrass_lr",
    ],
    down: 
    [

    ],
    left: 
    [

    ],
    right: 
    [

    ]
  }
};

enforceSymmetry(EDGES);
console.log("Generated EDGES:", EDGES);