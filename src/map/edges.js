export const EDGES = {
  grass: {
    up: [
      "grass",
      "grass1",
      "grass2",
      "river_br",
      "river_bl",
      "water_corner_bl",
      "water_corner_bc",
      "water_corner_br",
      "river_rl",
      "river_ending_d",
      "river_ending_r",
      "river_ending_l"
    ],
    down: [
      "grass",
      "grass1",
      "grass2",
      "river_tl",
      "river_tr",
      "water_corner_tl",
      "water_corner_tr",
      "water_corner_tc",
      "river_rl",
      "river_ending_u",
      "river_ending_r",
      "river_ending_l"
    ],
    left: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tr",
      "water_corner_cr",
      "water_corner_br",
      "river_tr",
      "river_br",
      "river_d",
      "river_ending_u",
      "river_ending_d",
      "river_ending_r"
    ],
    right: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tl",
      "water_corner_cl",
      "water_corner_bl",
      "river_tl",
      "river_bl",
      "river_d",
      "river_ending_u",
      "river_ending_d",
      "river_ending_l"
    ]
  },
  grass1: {
    up: [
      "grass",
      "grass1",
      "grass2",
      "river_br",
      "river_bl",
      "water_corner_bl",
      "water_corner_bc",
      "water_corner_br",
      "river_rl",
      "river_ending_d",
      "river_ending_r",
      "river_ending_l"
    ],
    down: [
      "grass",
      "grass1",
      "grass2",
      "river_tl",
      "river_tr",
      "water_corner_tl",
      "water_corner_tr",
      "water_corner_tc",
      "river_rl",
      "river_ending_u",
      "river_ending_r",
      "river_ending_l"
    ],
    left: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tr",
      "water_corner_cr",
      "water_corner_br",
      "river_tr",
      "river_br",
      "river_d",
      "river_ending_u",
      "river_ending_d",
      "river_ending_r"
    ],
    right: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tl",
      "water_corner_cl",
      "water_corner_bl",
      "river_tl",
      "river_bl",
      "river_d",
      "river_ending_u",
      "river_ending_d",
      "river_ending_l"
    ]
  },
  grass2: {
    up: [
      "grass",
      "grass1",
      "grass2",
      "river_br",
      "river_bl",
      "water_corner_bl",
      "water_corner_bc",
      "water_corner_br",
      "river_rl",
      "river_ending_d",
      "river_ending_r",
      "river_ending_l"
    ],
    down: [
      "grass",
      "grass1",
      "grass2",
      "river_tl",
      "river_tr",
      "water_corner_tl",
      "water_corner_tr",
      "water_corner_tc",
      "river_rl",
      "river_ending_u",
      "river_ending_r",
      "river_ending_l"
    ],
    left: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tr",
      "water_corner_cr",
      "water_corner_br",
      "river_tr",
      "river_br",
      "river_d",
      "river_ending_u",
      "river_ending_d",
      "river_ending_r"
    ],
    right: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tl",
      "water_corner_cl",
      "water_corner_bl",
      "river_tl",
      "river_bl",
      "river_d",
      "river_ending_u",
      "river_ending_d",
      "river_ending_l"
    ]
  },
  water: {
    up: [
      "water",
      "water_corner_tc",
      "river_entrance_u",
      "water_dirtcorner_tl",
      "water_dirtcorner_tr"
    ],
    down: [
      "water",
      "water_corner_bc",
      "river_entrance_d",
      "water_dirtcorner_bl",
      "water_dirtcorner_br"
    ],
    left: [
      "water",
      "water_corner_cl",
      "water_dirtcorner_bl",
      "river_entrance_l",
      "water_dirtcorner_tl"
    ],
    right: [
      "water",
      "water_corner_cr",
      "water_dirtcorner_br",
      "river_entrance_r",
      "water_dirtcorner_tr"
    ]
  },
  water_corner_tl: {
    up: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_bl",
      "water_corner_bc",
      "water_corner_br",
      "river_bl",
      "river_br",
      "river_rl",
      "river_ending_d",
      "river_ending_r",
    ],
    down: [
      "water_corner_cl",
      "water_corner_bl"
    ],
    left: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tr",
      "water_corner_cr",
      "water_corner_br",
      "river_tr",
      "river_br",
      "river_d",
      "river_ending_u",
      "river_ending_d",
      "river_ending_r"
    ],
    right: [
      "water_corner_tc",
      "water_corner_tr",
      "river_ending_l"
    ]
  },
  water_corner_tc: {
    up: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_bl",
      "water_corner_bc",
      "water_corner_br",
      "river_bl",
      "river_br",
      "river_rl",
      "river_ending_d",
      "river_ending_r",
      "river_ending_l"
    ],
    down: [
      "water",
      "water_corner_bc",
      "river_entrance_d",
      "water_dirtcorner_br",
      "water_dirtcorner_bl"
    ],
    left: [
      "water_corner_tl"
    ],
    right: [
      "water_corner_tr"
    ]
  },
  water_corner_tr: {
    up: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_bl",
      "water_corner_bc",
      "water_corner_br",
      "river_bl",
      "river_br",
      "river_rl",
      "river_ending_d",
      "river_ending_l",
      "river_ending_r",
    ],
    down: [
      "water_corner_cr",
      "water_corner_br"
    ],
    left: [
      "water_corner_tc",
      "water_corner_tl"
    ],
    right: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tl",
      "water_corner_cl",
      "water_corner_bl",
      "river_tl",
      "river_bl",
      "river_d",
      "river_ending_u",
      "river_ending_d"
    ]
  },
  water_corner_cl: {
    up: [
      "water_corner_cl",
      "water_corner_tl"
    ],
    down: [
      "water_corner_cl",
      "water_corner_bl"
    ],
    left: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tr",
      "water_corner_cr",
      "water_corner_br",
      "river_tr",
      "river_br",
      "river_d",
      "river_ending_u",
      "river_ending_d",
      "river_ending_r"
    ],
    right: [
      "water",
      "water_corner_cr",
      "river_entrance_r",
      "water_dirtcorner_tr",
      "water_dirtcorner_br",
      "river_ending_l"
    ]
  },
  water_corner_cr: {
    up: [
      "water_corner_cr",
      "water_corner_tr"
    ],
    down: [
      "water_corner_cr",
      "water_corner_br"
    ],
    left: [
      "water",
      "water_corner_cl",
      "river_entrance_l",
      "water_dirtcorner_tl",
      "water_dirtcorner_bl"
    ],
    right: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tl",
      "water_corner_cl",
      "water_corner_bl",
      "river_tl",
      "river_bl",
      "river_d",
      "river_ending_u",
      "river_ending_d"
    ]
  },
  water_corner_bl: {
    up: [
      "water_corner_cl",
      "water_corner_tl"
    ],
    down: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tl",
      "water_corner_tc",
      "water_corner_tr",
      "river_tl",
      "river_tr",
      "river_rl",
      "river_ending_u",
      "river_ending_r",
      "river_ending_l"
    ],
    left: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tr",
      "water_corner_cr",
      "water_corner_br",
      "river_tr",
      "river_br",
      "river_d",
      "river_ending_u",
      "river_ending_d",
      "river_ending_r"
    ],
    right: [
      "water_corner_bc",
      "water_corner_br",
      "river_ending_l"
    ]
  },
  water_corner_bc: {
    up: [
      "water",
      "water_corner_tc",
      "river_entrance_u",
      "water_dirtcorner_tr",
      "water_dirtcorner_tl"
    ],
    down: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tl",
      "water_corner_tc",
      "water_corner_tr",
      "river_tl",
      "river_tr",
      "river_rl",
      "river_ending_u",
      "river_ending_r",
      "river_ending_l"
    ],
    left: [
      "water_corner_bl"
    ],
    right: [
      "water_corner_br"
    ]
  },
  water_corner_br: {
    up: [
      "water_corner_cr",
      "water_corner_tr"
    ],
    down: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tl",
      "water_corner_tc",
      "water_corner_tr",
      "river_tl",
      "river_tr",
      "river_rl",
      "river_ending_u",
      "river_ending_r",
      "river_ending_l"
    ],
    left: [
      "water_corner_bc",
      "water_corner_bl"
    ],
    right: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tl",
      "water_corner_cl",
      "water_corner_bl",
      "river_tl",
      "river_bl",
      "river_d",
      "river_ending_u",
      "river_ending_d"
    ]
  },
  river_tl: {
    up: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_bl",
      "water_corner_bc",
      "water_corner_br",
      "river_bl",
      "river_br",
      "river_rl",
      "river_ending_d",
      "river_ending_r",
      "river_ending_l"
    ],
    down: [
      "river_bl",
      "river_br",
      "river_d",
      "river_entrance_u",
      "river_ending_d"
    ],
    left: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tr",
      "water_corner_cr",
      "water_corner_br",
      "river_tr",
      "river_br",
      "river_d",
      "river_ending_u",
      "river_ending_d",
      "river_ending_r"
    ],
    right: [
      "river_tr",
      "river_br",
      "river_rl",
      "river_entrance_l",
      "river_ending_r"
    ]
  },
  river_tr: {
    up: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_bl",
      "water_corner_bc",
      "water_corner_br",
      "river_bl",
      "river_br",
      "river_rl",
      "river_ending_d",
      "river_ending_r",
      "river_ending_l"
    ],
    down: [
      "river_bl",
      "river_br",
      "river_d",
      "river_entrance_u",
      "river_ending_d"
    ],
    left: [
      "river_tl",
      "river_bl",
      "river_rl",
      "river_entrance_r",
      "river_ending_l"
    ],
    right: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tl",
      "water_corner_cl",
      "water_corner_bl",
      "river_tl",
      "river_bl",
      "river_d",
      "river_ending_u",
      "river_ending_d"
    ]
  },
  river_bl: {
    up: [
      "river_tl",
      "river_tr",
      "river_d",
      "river_entrance_d"
    ],
    down: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tl",
      "water_corner_tc",
      "water_corner_tr",
      "river_tl",
      "river_tr",
      "river_rl",
      "river_ending_u",
      "river_ending_r",
      "river_ending_l"
    ],
    left: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tr",
      "water_corner_cr",
      "water_corner_br",
      "river_tr",
      "river_br",
      "river_d",
      "river_ending_u",
      "river_ending_d",
      "river_ending_r"
    ],
    right: [
      "river_tr",
      "river_br",
      "river_rl",
      "river_entrance_l",
      "river_ending_r"
    ]
  },
  river_br: {
    up: [
      "river_tl",
      "river_tr",
      "river_d",
      "river_entrance_d"
    ],
    down: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tl",
      "water_corner_tc",
      "water_corner_tr",
      "river_tl",
      "river_tr",
      "river_rl",
      "river_ending_u",
      "river_ending_r",
      "river_ending_l"
    ],
    left: [
      "river_tl",
      "river_bl",
      "river_rl",
      "river_entrance_r"
    ],
    right: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tl",
      "water_corner_cl",
      "water_corner_bl",
      "river_tl",
      "river_bl",
      "river_d",
      "river_ending_u",
      "river_ending_d"
    ]
  },
  river_entrance_d: {
    up: [
      "water",
      "water_corner_tc",
      "river_entrance_u",
      "water_dirtcorner_tr",
      "water_dirtcorner_tl"
    ],
    down: [
      "river_bl",
      "river_br",
      "river_d",
      "river_entrance_u",
      "river_ending_d"
    ],
    left: [
      "water_dirtcorner_br"
    ],
    right: [
      "water_dirtcorner_bl"
    ]
  },
  river_entrance_u: {
    up: [
      "river_tl",
      "river_tr",
      "river_d",
      "river_entrance_d",
      "river_ending_u"
    ],
    down: [
      "water",
      "water_corner_bc",
      "river_entrance_d",
      "water_dirtcorner_br",
      "water_dirtcorner_bl"
    ],
    left: [
  "water_dirtcorner_tr",
  "water_corner_tc",
  "water_corner_bc",
  "water",
  "grass",
  "grass1",
  "grass2"
],
right: [
  "water_dirtcorner_tl",
  "water_corner_tc",
  "water_corner_bc",
  "water",
  "grass",
  "grass1",
  "grass2"
]

  },
  river_d: {
    up: [
      "river_tl",
      "river_tr",
      "river_d",
      "river_entrance_d",
      "river_ending_u"
    ],
    down: [
      "river_bl",
      "river_br",
      "river_d",
      "river_entrance_u",
      "river_ending_d"
    ],
    left: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tr",
      "water_corner_cr",
      "water_corner_br",
      "river_tr",
      "river_br",
      "river_ending_u",
      "river_ending_d"
    ],
    right: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tl",
      "water_corner_cl",
      "water_corner_bl",
      "river_tl",
      "river_bl",
      "river_ending_u",
      "river_ending_d"
    ]
  },
  river_rl: {
    up: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_bl",
      "water_corner_bc",
      "water_corner_br",
      "river_bl",
      "river_br",
      "river_ending_d",
      "river_ending_r",
      "river_ending_l"
    ],
    down: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tl",
      "water_corner_tc",
      "water_corner_tr",
      "river_tl",
      "river_tr",
      "river_ending_u",
      "river_ending_r",
      "river_ending_l"
    ],
    left: [
      "river_tl",
      "river_bl",
      "river_entrance_r",
      "river_ending_l"
    ],
    right: [
      "river_tr",
      "river_br",
      "river_entrance_l",
      "river_ending_r"
    ]
  },
  river_entrance_r: {
    up: [
      "water_dirtcorner_br"
    ],
    down: [
      "water_dirtcorner_tr"
    ],
    left: [
      "water",
      "water_corner_cl",
      "river_entrance_l",
      "water_dirtcorner_tl",
      "water_dirtcorner_bl"
    ],
    right: [
      "river_entrance_l",
      "river_rl",
      "river_tr",
      "river_br"
    ]
  },
  river_entrance_l: {
    up: [
      "water_dirtcorner_bl"
    ],
    down: [
      "water_dirtcorner_tl"
    ],
    left: [
      "river_entrance_r",
      "river_rl",
      "river_tl",
      "river_bl"
    ],
    right: [
      "water",
      "water_corner_cr",
      "river_entrance_r",
      "water_dirtcorner_tr",
      "water_dirtcorner_br"
    ]
  },
  water_dirtcorner_tl: {
    up: [
      "water_dirtcorner_bl",
      "river_entrance_l"
    ],
    down: [
      "water",
      "water_corner_bc",
      "river_entrance_d",
      "water_dirtcorner_br",
      "water_dirtcorner_bl"
    ],
    left: [
      "water_dirtcorner_tr",
      "river_entrance_u"
    ],
    right: [
      "water",
      "water_corner_cr",
      "river_entrance_r",
      "water_dirtcorner_tr",
      "water_dirtcorner_br"
    ]
  },
  water_dirtcorner_tr: {
    up: [
      "water_dirtcorner_br",
      "river_entrance_r"
    ],
    down: [
      "water",
      "water_corner_bc",
      "river_entrance_d",
      "water_dirtcorner_br",
      "water_dirtcorner_bl"
    ],
    left: [
      "water",
      "water_corner_cl",
      "river_entrance_l",
      "water_dirtcorner_tl",
      "water_dirtcorner_bl"
    ],
    right: [
      "water_dirtcorner_tl",
      "river_entrance_u"
    ]
  },
  water_dirtcorner_bl: {
    up: [
      "water",
      "water_corner_tc",
      "river_entrance_u",
      "water_dirtcorner_tr",
      "water_dirtcorner_tl"
    ],
    down: [
      "water_dirtcorner_tl",
      "river_entrance_l"
    ],
    left: [
      "water_dirtcorner_br",
      "river_entrance_d"
    ],
    right: [
      "water",
      "water_corner_cr",
      "river_entrance_r",
      "water_dirtcorner_tr",
      "water_dirtcorner_br"
    ]
  },
  water_dirtcorner_br: {
    up: [
      "water",
      "water_corner_tc",
      "river_entrance_u",
      "water_dirtcorner_tr",
      "water_dirtcorner_tl"
    ],
    down: [
      "water_dirtcorner_tr",
      "river_entrance_r"
    ],
    left: [
      "water",
      "water_corner_cl",
      "river_entrance_l",
      "water_dirtcorner_tl",
      "water_dirtcorner_bl"
    ],
    right: [
      "water_dirtcorner_bl",
      "river_entrance_d"
    ]
  },
  river_ending_u: {
    up: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_bl",
      "water_corner_bc",
      "water_corner_br",
      "river_bl",
      "river_br",
      "river_rl",
      "river_ending_r",
      "river_ending_l"
    ],
    down: [
      "river_d",
      "river_entrance_u"
    ],
    left: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tr",
      "water_corner_cr",
      "water_corner_br",
      "river_tr",
      "river_ending_r",
      "river_br",
      "river_d"
    ],
    right: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tl",
      "water_corner_cl",
      "water_corner_bl",
      "river_tl",
      "river_bl",
      "river_d"
    ]
  },
  river_ending_d: {
    up: [
      "river_d",
      "river_entrance_d",
      "river_tr",
      "river_tl"
    ],
    down: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tl",
      "water_corner_tc",
      "water_corner_tr",
      "river_tl",
      "river_tr",
      "river_rl",
      "river_ending_r",
      "river_ending_l"
    ],
    left: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tr",
      "water_corner_cr",
      "water_corner_br",
      "river_tr",
      "river_ending_r",
      "river_br",
      "river_d"
    ],
    right: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tl",
      "water_corner_cl",
      "water_corner_bl",
      "river_tl",
      "river_bl",
      "river_d"
    ]
  },
  river_ending_r: {
    up: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_bl",
      "water_corner_bc",
      "water_corner_br",
      "river_bl",
      "river_br",
      "river_rl",
      "river_ending_d"
    ],
    down: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tl",
      "water_corner_tc",
      "water_corner_tr",
      "river_tl",
      "river_tr",
      "river_rl",
      "river_ending_u",
    ],
    left: [
      "river_rl",
      "river_bl",
      "river_tl"
    ],
    right: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tl",
      "water_corner_cl",
      "water_corner_bl",
      "river_tl",
      "river_bl",
      "river_d",
      "river_ending_d",
      "river_ending_u"
    ]
  },
  river_ending_l: {
    up: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_bl",
      "water_corner_bc",
      "water_corner_br",
      "river_bl",
      "river_br",
      "river_rl",
      "river_ending_d"
    ],
    down: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tl",
      "water_corner_tc",
      "water_corner_tr",
      "river_tr",
      "river_rl",
      "river_ending_u"
    ],
    right: [
      "river_rl",
      "river_tr"
    ],
    left: [
      "grass",
      "grass1",
      "grass2",
      "water_corner_tr",
      "water_corner_cr",
      "water_corner_br",
      "river_d"
    ]
  }
};
