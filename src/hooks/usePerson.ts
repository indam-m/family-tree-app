'use client';

import { useMutation, useQuery, useLazyQuery } from '@apollo/client';
import {
  CREATE_PERSON,
  UPDATE_PERSON,
  DELETE_PERSON,
} from '@/lib/graphql/person/mutations';
import { GET_PERSON_BY_ID, SEARCH_PEOPLE } from '@/lib/graphql/person/queries';

export function useGetPersonById(options: {
  variables: { id: number };
  skip?: boolean;
}) {
  return useQuery(GET_PERSON_BY_ID, options); // Pass options to useQuery
}

export function useCreatePerson() {
  return useMutation(CREATE_PERSON);
}

export function useUpdatePerson() {
  return useMutation(UPDATE_PERSON);
}

export function useDeletePerson() {
  return useMutation(DELETE_PERSON);
}

export function useSearchPeople() {
  return useLazyQuery(SEARCH_PEOPLE); // Pass options to useMutation
}
