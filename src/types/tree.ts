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
  personOneId: number;
  personTwoId: number;
  relationshipId: number;
  parentChildId: number;
  isHalfChildToParent: boolean;
  isHalfParentToChild: boolean;
  isLeftToRightSibling: boolean;
  isMidChildToSingleParent: boolean;
  isRelationship: boolean;
  onClick: () => void;
}

export interface Person extends BasicData {
  firstName: string;
  lastName: string;
  nickName: string;
  gender: string;
  birthDate: string;
  birthPlace: string;
  isDeceased: boolean;
  deathDate?: string;
  deathPlace?: string;
  notes?: string;
  parentChildRelations?: ParentChild[];
  relationshipsAsPersonOne?: Relationship[];
  relationshipsAsPersonTwo?: Relationship[];
  parentChildOfChildren?: ParentChild[];
  imageUrl?: string;
}

export interface ParentChild extends BasicData {
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

export interface Relationship extends BasicData {
  personOne?: Person;
  personTwo?: Person;
  personOneId: number;
  personTwoId: number;
  isMarried: boolean;
  isDivorced: boolean;
  isSeparated: boolean;
  isEngaged: boolean;
  marriageDate?: string;
  marriagePlace?: string;
  isCohabitated: boolean;
  isTogether: boolean;
  divorcedDate?: string;
  divorcedPlace?: string;
  engagementDate?: string;
  engagementPlace?: string;
  cohabitationDate?: string;
  cohabitationPlace?: string;
  togetherDate?: string;
  togetherPlace?: string;
  notes?: string;
  parentChildren?: ParentChild[];
}

export interface BasicData {
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  id: number;
}
