'use client';

import { UPSERT_RELATIONSHIPS } from '@/lib/graphql/relationship/mutations';
import { useMutation } from '@apollo/client';

export const useUpsertRelationships = () => {
  return useMutation(UPSERT_RELATIONSHIPS);
};
