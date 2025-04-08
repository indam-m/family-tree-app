import { gql } from '@apollo/client';

export const GET_HEALTH = gql`
  query {
    __typename
  }
`;

// Query to get all people with basic details
export const GET_PEOPLE = gql`
  query GetPeople {
    people {
      id
      firstName
      lastName
      nickName
      gender
      birthDate
      birthPlace
      isDeceased
    }
  }
`;

// Query to get a person by ID with detailed information
export const GET_PERSON_BY_ID = gql`
  query GetPersonById($id: Int!) {
    person(id: $id) {
      id
      firstName
      lastName
      nickName
      gender
      birthDate
      birthPlace
      isDeceased
      deathDate
      deathPlace
      notes
      imageUrl
      createdAt
      updatedAt
      createdBy
      updatedBy
    }
  }
`;

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

export const TEST = gql`
  query {
    relationships {
      id
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

export const GET_EVERYTHING = gql`
  query GetEverything {
    people {
      id
      firstName
      lastName
      nickName
      gender
      birthDate
      birthPlace
      isDeceased
      deathDate
      deathPlace
      imageUrl
      notes

      relationshipsAsPersonOne {
        id
        personOneId
        personTwoId
        personTwo {
          id
          firstName
        }
        parentChildren {
          id
          childId
          isAdopted
        }
        isMarried
        marriageDate
        marriagePlace
        isDivorced
      }

      relationshipsAsPersonTwo {
        id
        personOneId
        personTwoId
        personOne {
          id
          firstName
        }
        parentChildren {
          id
          childId
          isAdopted
        }
        isMarried
        marriageDate
        marriagePlace
        isDivorced
      }

      parentChildRelations {
        id
        parentOneId
        parentTwoId
        relationship {
          id
          isMarried
          marriageDate
          marriagePlace
          isDivorced
          parentChildren {
            id
            childId
            isAdopted
          }
        }
      }

      parentChildOfChildren {
        id
        parentOneId
        parentTwoId
        childId
        isAdopted
      }
    }
  }
`;
