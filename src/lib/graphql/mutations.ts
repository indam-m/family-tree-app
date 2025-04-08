import { gql } from '@apollo/client';

export const CREATE_PERSON = gql`
  mutation CreatePerson($firstName: String!, $lastName: String) {
    createPerson(firstName: $firstName, lastName: $lastName) {
      id
      firstName
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
