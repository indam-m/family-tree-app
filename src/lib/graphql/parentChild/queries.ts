import { gql } from '@apollo/client';

// Query to get all parent-child relationships
export const GET_PARENT_CHILD_RELATIONS = gql`
  query GetParentChildRelations {
    parentChildRelations {
      id
      parentOneId
      parentTwoId
      childId
      relationshipId
      isAdopted
      createdBy
      updatedBy
      createdAt
      updatedAt
    }
  }
`;

// Query to get a specific parent-child relationship by ID
export const GET_PARENT_CHILD_RELATION_BY_ID = gql`
  query GetParentChildRelationById($id: Int!) {
    parentChildRelation(id: $id) {
      id
      parentId
      childId
      createdAt
      updatedAt
      createdBy
      updatedBy
    }
  }
`;
