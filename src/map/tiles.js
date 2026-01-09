// src/map/tiles.js
import { EDGES } from "./edges";

export const TILE_SIZE = 64;

export const TILES = [
  /* =========================
     GRASS
  ========================= */

  {
    id: "grass_center1",
    terrain: "grass",
    sx: 1,
    sy: 1,
    edges: {
      up: EDGES.GRASS,
      down: EDGES.GRASS,
      left: EDGES.GRASS,
      right: EDGES.GRASS,
    },
    weight: 8,
  },
  {
    id: "grass_center2",
    terrain: "grass",
    sx: 3,
    sy: 2,
    edges: {
      up: EDGES.GRASS,
      down: EDGES.GRASS,
      left: EDGES.GRASS,
      right: EDGES.GRASS,
    },
    weight: 8,
  },
  {
    id: "grass_center3",
    terrain: "grass",
    sx: 4,
    sy: 2,
    edges: {
      up: EDGES.GRASS,
      down: EDGES.GRASS,
      left: EDGES.GRASS,
      right: EDGES.GRASS,
    },
    weight: 8,
  },
  {
    id: "grass_top_left",
    terrain: "grass",
    sx: 0,
    sy: 0,
    edges: {
      up: EDGES.DIRT,
      down: EDGES.DIRTROADLEFT,
      left: EDGES.DIRT,
      right: EDGES.DIRTROADUP,
    },
    weight: 8,
  },
  {
    id: "grass_top_center",
    terrain: "grass",
    sx: 1,
    sy: 0,
    edges: {
      up: EDGES.DIRT,
      down: EDGES.GRASS,
      left: EDGES.DIRTROADUP,
      right: EDGES.DIRTROADUP,
    },
    weight: 8,
  },
  {
    id: "grass_top_right",
    terrain: "grass",
    sx: 0,
    sy: 2,
    edges: {
      up: EDGES.DIRT,
      down: EDGES.DIRTROADRIGHT,
      left: EDGES.DIRTROADUP,
      right: EDGES.DIRT,
    },
    weight: 8,
  },
  {
    id: "grass_center_left",
    terrain: "grass",
    sx: 0,
    sy: 1,
    edges: {
      up: EDGES.DIRTROADLEFT,
      down: EDGES.DIRTROADLEFT,
      left: EDGES.DIRT,
      right: EDGES.GRASS,
    },
    weight: 8,
  },
  {
    id: "grass_center_right",
    terrain: "grass",
    sx: 2,
    sy: 1,
    edges: {
      up: EDGES.DIRTROADRIGHT,
      down: EDGES.DIRTROADRIGHT,
      left: EDGES.GRASS,
      right: EDGES.DIRT,
    },
    weight: 8,
  },
  {
    id: "grass_bottom_left",
    terrain: "grass",
    sx: 0,
    sy: 2,
    edges: {
      up: EDGES.DIRTROADLEFT,
      down: EDGES.DIRT,
      left: EDGES.DIRT,
      right: EDGES.DIRTROADDOWN,
    },
    weight: 8,
  },
  {
    id: "grass_bottom_center",
    terrain: "grass",
    sx: 1,
    sy: 2,
    edges: {
      up: EDGES.GRASS,
      down: EDGES.DIRT,
      left: EDGES.DIRTROADDOWN,
      right: EDGES.DIRTROADDOWN,
    },
    weight: 8,
  },
  {
    id: "grass_bottom_right",
    terrain: "grass",
    sx: 2,
    sy: 2,
    edges: {
      up: EDGES.DIRTROADRIGHT,
      down: EDGES.DIRT,
      left: EDGES.DIRTROADDOWN,
      right: EDGES.DIRT,
    },
    weight: 8,
  },

  /* =========================
     DIRT
  ========================= */

  {
    id: "dirt_center",
    terrain: "dirt",
    sx: 6,
    sy: 1,
    edges: {
      up: EDGES.DIRT,
      down: EDGES.DIRT,
      left: EDGES.DIRT,
      right: EDGES.DIRT,
    },
    weight: 8,
  },

  /* =========================
     WATER
  ========================= */
  {
    id: "water_center",
    terrain: "water",
    sx: 0,
    sy: 8,
    edges: {
      up: EDGES.WATER,
      down: EDGES.WATER,
      left: EDGES.WATER,
      right: EDGES.WATER,
    },
    weight: 8,
  }
];
