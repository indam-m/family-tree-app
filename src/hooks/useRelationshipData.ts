import { useEffect, useState } from 'react';
import { Relationship } from '@/types/tree';

const relationshipData: Relationship[] = [
  {
    personOneId: 3,
    personTwoId: 4,
    isMarried: true,
    isDivorced: false,
    isSeparated: false,
    isCohabiting: false,
    isEngaged: false,
    isInRelationship: true,
    childrenIds: [],
  },
];

export const useRelationshipData = (personId: number) => {
  const [relationships, setRelationships] = useState<Relationship[]>([]);

  const getRelationshipsByPersonId = (id: number) => {
    return relationshipData.filter(
      (relationship) =>
        relationship.personOneId === id || relationship.personTwoId === id,
    );
  };

  useEffect(() => {
    const filteredRelationships = getRelationshipsByPersonId(personId);
    setRelationships(filteredRelationships);
  }, [personId]);

  return relationships;
};
