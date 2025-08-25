import { gql } from '@apollo/client';

export const CREATE_PERSON = gql`
  mutation CreatePerson(
    $firstName: String!
    $lastName: String
    $gender: String
    $birthDate: String
    $imageUrl: String
    $notes: String
    $nickName: String
    $birthPlace: String
    $isDeceased: Boolean
    $deathDate: String
    $deathPlace: String
    $parentOneId: Int
    $parentTwoId: Int
    $isAdopted: Boolean
    $createdBy: String!
    $updatedBy: String!
  ) {
    createPerson(
      input: {
        firstName: $firstName
        lastName: $lastName
        gender: $gender
        birthDate: $birthDate
        imageUrl: $imageUrl
        notes: $notes
        nickName: $nickName
        birthPlace: $birthPlace
        isDeceased: $isDeceased
        deathDate: $deathDate
        deathPlace: $deathPlace
        parentOneId: $parentOneId
        parentTwoId: $parentTwoId
        isAdopted: $isAdopted
        createdBy: $createdBy
        updatedBy: $updatedBy
      }
    ) {
      id
      firstName
      lastName
      nickName
      birthDate
    }
  }
`;

export const UPDATE_PERSON = gql`
  mutation UpdatePerson(
    $id: Int!
    $firstName: String!
    $lastName: String
    $nickName: String
    $gender: String
    $birthDate: String
    $birthPlace: String
    $imageUrl: String
    $notes: String
    $isDeceased: Boolean
    $deathDate: String
    $deathPlace: String
    $parentOneId: Int
    $parentTwoId: Int
    $isAdopted: Boolean
    $createdBy: String!
    $updatedBy: String!
  ) {
    updatePerson(
      id: $id
      input: {
        firstName: $firstName
        lastName: $lastName
        gender: $gender
        birthDate: $birthDate
        imageUrl: $imageUrl
        notes: $notes
        nickName: $nickName
        birthPlace: $birthPlace
        isDeceased: $isDeceased
        deathDate: $deathDate
        deathPlace: $deathPlace
        parentOneId: $parentOneId
        parentTwoId: $parentTwoId
        isAdopted: $isAdopted
        createdBy: $createdBy
        updatedBy: $updatedBy
      }
    ) {
      id
      firstName
      lastName
      nickName
      birthDate
    }
  }
`;

export const DELETE_PERSON = gql`
  mutation DeletePerson($id: Int!) {
    deletePerson(id: $id) {
      id
    }
  }
`;
