import { gql } from '@apollo/client';

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
    }
  }
`;

export const GET_EVERYTHING = gql`
  query GetEverything($rootId: Int!) {
    people(rootId: $rootId) {
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

export const SEARCH_PEOPLE = gql`
  query SearchPeople($search: String!, $excludeIds: [Int]) {
    searchPeople(search: $search, excludeIds: $excludeIds) {
      id
      firstName
      lastName
      nickName
    }
  }
`;
