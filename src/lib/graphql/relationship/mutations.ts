import { gql } from '@apollo/client';

export const UPSERT_RELATIONSHIPS = gql`
  mutation UpsertRelationships($relationships: [CreateRelationshipInput!]!) {
    upsertRelationships(relationships: $relationships) {
      id
      personOneId
      personTwoId
      isMarried
      isDivorced
      isSeparated
      isEngaged
      isCohabitated
      isTogether
      marriageDate
      marriagePlace
      divorcedDate
      divorcedPlace
      engagementDate
      engagementPlace
      cohabitationDate
      cohabitationPlace
      togetherDate
      togetherPlace
      notes
      createdAt
      updatedAt
      createdBy
      updatedBy
    }
  }
`;
