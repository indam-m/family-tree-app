// This file contains constants related to person data

export const gender = {
  GENDER_MALE: 'male',
  GENDER_FEMALE: 'female',
  GENDER_OTHER: 'other',
};

export const defaultTreeConfig = {
  ITEM_WIDTH: 200,
  ITEM_HEIGHT: 320,
  ITEM_MARGIN_X: 50,
  ITEM_MARGIN_Y: 100,
  ITEM_LINE_WIDTH: 2,
  SUCCESSOR_DEPTH: 3,
  PREDECESSOR_DEPTH: 2,
};

export const treeItemPosition = {
  LEFT: 'left',
  RIGHT: 'right',
  CENTER: 'center',
};

export const DEFAULT_TREE_LINE = {
  isDotted: false,
  width: 2,
  hoverMessage: '',
  color: 'white',
  onClick: () => {},
};
