export interface PartnerForm {
  id: number | null;
  search: string;
  isMarried: boolean;
  isDivorced: boolean;
  isSeparated: boolean;
  isEngaged: boolean;
  isCohabitated: boolean;
  isTogether: boolean;
  marriageDate: string;
  marriagePlace: string;
  divorcedDate: string;
  divorcedPlace: string;
  engagementDate: string;
  engagementPlace: string;
  cohabitationDate: string;
  cohabitationPlace: string;
  togetherDate: string;
  togetherPlace: string;
  notes: string;
}
