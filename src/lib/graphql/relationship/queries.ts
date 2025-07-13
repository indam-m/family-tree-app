import { gql } from '@apollo/client';

// Query to get all relationships
export const GET_RELATIONSHIPS = gql`
  query GetRelationships {
    relationships {
      id
      personOneId
      personTwoId
      isMarried
      isDivorced
    }
  }
`;

// Query to get a specific relationship by ID
export const GET_RELATIONSHIP_BY_ID = gql`
  query GetRelationshipById($id: Int!) {
    relationship(id: $id) {
      id
      personOneId
      personTwoId
      type
      isMarried
      isDivorced
      createdAt
      updatedAt
      createdBy
      updatedBy
    }
  }
`;
