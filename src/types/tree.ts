export interface TreeItem {
  midXPosition: number;
  midYPosition: number;
  person: Person;
}

export interface TreeData {
  treeItems: TreeItem[];
  treeLines: TreeLine[];
  itemWidth: number;
  itemHeight: number;
  itemMargin: number;
  mostLeft: number;
  mostTop: number;
}

export interface TreeLine {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  isDotted: boolean;
  color: string;
  hoverMessage: string;
  onClick: () => void;
}

export interface Person {
  id: number;
  firstName: string;
  lastName: string;
  nickName: string;
  gender: string;
  birthDate: string;
  birthPlace: string;
  isDeceased: boolean;
  deceasedDate?: string;
  deceasedPlace?: string;
  note?: string;
  parentChildRelations?: ParentChild[];
  relationshipsAsPersonOne?: Relationship[];
  relationshipsAsPersonTwo?: Relationship[];
  parentChildOfChildren?: ParentChild[];
}

export interface ParentChild {
  parentOne?: Person;
  parentTwo?: Person;
  child?: Person;
  parentOneId: number;
  parentTwoId: number;
  childId: number;
  relationshipId?: number;
  relationship?: Relationship;
  isAdopted: boolean;
  isFoster: boolean;
  isBiological: boolean;
}

export interface Relationship {
  personOne?: Person;
  personTwo?: Person;
  personOneId: number;
  personTwoId: number;
  isMarried: boolean;
  isDivorced: boolean;
  isSeparated: boolean;
  isCohabiting: boolean;
  isEngaged: boolean;
  isInRelationship: boolean;
  note?: string;
  marriageDate?: string;
  marriagePlace?: string;
  parentChildren?: ParentChild[];
}
