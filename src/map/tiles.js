// src/map/tiles.js
import { EDGES } from "./edges";

export const TILE_SIZE = 16;

export const TILES = [
  /* =========================
     GRASS
  ========================= */

  {
    id: "grass_center",
    terrain: "grass",
    sx: 0,
    sy: 0,
    edges: {
      up: EDGES.GRASS,
      down: EDGES.GRASS,
      left: EDGES.GRASS,
      right: EDGES.GRASS,
    },
    weight: 8,
  },

  {
    id: "grass_snow_north",
    terrain: "grass",
    sx: 1,
    sy: 0,
    edges: {
      up: EDGES.SNOW,
      down: EDGES.GRASS,
      left: EDGES.GRASS,
      right: EDGES.GRASS,
    },
    weight: 2,
  },

  {
    id: "grass_dirt_north",
    terrain: "grass",
    sx: 2,
    sy: 0,
    edges: {
      up: EDGES.DIRT,
      down: EDGES.GRASS,
      left: EDGES.GRASS,
      right: EDGES.GRASS,
    },
    weight: 2,
  },

  /* =========================
     SNOW
  ========================= */

  {
    id: "snow_center",
    terrain: "snow",
    sx: 0,
    sy: 1,
    edges: {
      up: EDGES.SNOW,
      down: EDGES.SNOW,
      left: EDGES.SNOW,
      right: EDGES.SNOW,
    },
    weight: 6,
  },

  {
    id: "snow_grass_south",
    terrain: "snow",
    sx: 1,
    sy: 1,
    edges: {
      up: EDGES.SNOW,
      down: EDGES.GRASS,
      left: EDGES.SNOW,
      right: EDGES.SNOW,
    },
    weight: 2,
  },

  {
    id: "snow_stone_south",
    terrain: "snow",
    sx: 2,
    sy: 1,
    edges: {
      up: EDGES.SNOW,
      down: EDGES.STONE,
      left: EDGES.SNOW,
      right: EDGES.SNOW,
    },
    weight: 1,
  },

  /* =========================
     DIRT
  ========================= */

  {
    id: "dirt_center",
    terrain: "dirt",
    sx: 0,
    sy: 2,
    edges: {
      up: EDGES.DIRT,
      down: EDGES.DIRT,
      left: EDGES.DIRT,
      right: EDGES.DIRT,
    },
    weight: 6,
  },

  {
    id: "dirt_grass_south",
    terrain: "dirt",
    sx: 1,
    sy: 2,
    edges: {
      up: EDGES.DIRT,
      down: EDGES.GRASS,
      left: EDGES.DIRT,
      right: EDGES.DIRT,
    },
    weight: 2,
  },

  /* =========================
     WATER
  ========================= */

  {
    id: "water_center",
    terrain: "water",
    sx: 0,
    sy: 3,
    edges: {
      up: EDGES.WATER,
      down: EDGES.WATER,
      left: EDGES.WATER,
      right: EDGES.WATER,
    },
    weight: 4,
  },

  {
    id: "water_grass_north",
    terrain: "water",
    sx: 1,
    sy: 3,
    edges: {
      up: EDGES.GRASS,
      down: EDGES.WATER,
      left: EDGES.WATER,
      right: EDGES.WATER,
    },
    weight: 1,
  },

  /* =========================
     STONE
  ========================= */

  {
    id: "stone_center",
    terrain: "stone",
    sx: 0,
    sy: 4,
    edges: {
      up: EDGES.STONE,
      down: EDGES.STONE,
      left: EDGES.STONE,
      right: EDGES.STONE,
    },
    weight: 3,
  },
];
