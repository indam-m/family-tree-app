'use client';
import { useEffect, useState } from 'react';
import {
  gender,
  defaultTreeConfig,
  DEFAULT_TREE_LINE,
  treeItemPosition,
} from '@/constants/person';
import { Person, Relationship, TreeItem, TreeLine } from '@/types/tree';

const peopleData: Person[] = [
  {
    id: 1,
    firstName: 'Indam Muhammad',
    lastName: 'Hery',
    nickName: 'Indam',
    gender: gender.MALE,
    birthDate: '1994-05-31',
    birthPlace: 'Bandung',
    isDeceased: false,
    childrenIDs: [],
    parentAId: 3,
    parentBId: 4,
  },
  {
    id: 2,
    firstName: 'Ilham',
    lastName: 'Muhammad',
    nickName: 'Ilham',
    gender: gender.MALE,
    birthDate: '1991-10-20',
    birthPlace: 'Bandung',
    isDeceased: false,
    childrenIDs: [],
    parentAId: 3,
    parentBId: 4,
  },
  {
    id: 3,
    firstName: 'Hery',
    lastName: 'Purwanto',
    nickName: 'Hery',
    gender: gender.MALE,
    birthDate: '1958-08-04',
    birthPlace: 'Mojokerto',
    isDeceased: false,
    childrenIDs: [],
    parentAId: 0,
    parentBId: 0,
  },
  {
    id: 4,
    firstName: 'Dewi',
    lastName: 'Rinakanti',
    nickName: 'Dewi',
    gender: gender.FEMALE,
    birthDate: '1966-01-03',
    birthPlace: 'Bandung',
    isDeceased: false,
    childrenIDs: [5],
    parentAId: 0,
    parentBId: 0,
  },
  {
    id: 5,
    firstName: 'Hertry',
    lastName: 'Purwanto',
    nickName: 'Hery',
    gender: gender.MALE,
    birthDate: '1958-08-04',
    birthPlace: 'Mojokerto',
    isDeceased: false,
    childrenIDs: [6],
    parentAId: 0,
    parentBId: 0,
  },
  {
    id: 6,
    firstName: 'Detrwi',
    lastName: 'Rinakanti',
    nickName: 'Dewi',
    gender: gender.FEMALE,
    birthDate: '1966-01-03',
    birthPlace: 'Bandung',
    isDeceased: false,
    childrenIDs: [],
    parentAId: 0,
    parentBId: 0,
  },
];

const relationshipData: Relationship[] = [
  {
    personOne: peopleData[2],
    personTwo: peopleData[3],
    personOneId: 3,
    personTwoId: 4,
    isMarried: true,
    isDivorced: false,
    isSeparated: false,
    isCohabiting: false,
    isEngaged: false,
    isInRelationship: true,
    childrenIds: [1, 2],
  },
];

export const useTransformedTreeData = (personId: number) => {
  const [treeItems, setTreeItems] = useState<TreeItem[]>([]);
  const [treeLines, setTreeLines] = useState<TreeLine[]>([]);

  const personDict: { [id: number]: Person } = peopleData.reduce(
    (acc, person) => {
      acc[person.id] = person;
      return acc;
    },
    {} as { [id: number]: Person },
  );

  const fetchRelationships = (personId: number, partnerIdToExclude: number) => {
    return relationshipData.filter(
      (relationship) =>
        (relationship.personOneId === personId &&
          relationship.personTwoId !== partnerIdToExclude) ||
        (relationship.personTwoId === personId &&
          relationship.personOneId !== partnerIdToExclude),
    );
  };

  const generateTreeItem = (
    personId: number,
    depth: number,
    currentMidX: number,
    currentMidY: number,
    position: string,
    traceRelationship: boolean = true,
    traceParents: boolean = false,
    partnerIdToExclude: number,
  ) => {
    const person = personDict[personId];
    let treeItem: TreeItem = {
      person: person,
      midXPosition: currentMidX,
      midYPosition: currentMidY,
    };
    let localMidX = currentMidX;
    const localMidY = currentMidY;

    if (traceParents) {
      // have both parents data
      if (person.parentAId !== 0 && person.parentBId !== 0) {
        const parentAItem = generateTreeItem(
          person.parentAId,
          depth + 1,
          localMidX,
          localMidY,
          treeItemPosition.LEFT,
          true,
          false,
          person.parentBId,
        );
        localMidX = parentAItem.midX;

        // Generating children
        const relationshipItem = relationshipData.find(
          (relationship) =>
            (relationship.personOneId === person.parentAId &&
              relationship.personTwoId === person.parentBId) ||
            (relationship.personOneId === person.parentBId &&
              relationship.personTwoId === person.parentAId),
        );
        if (relationshipItem?.childrenIds.length === 1) {
          localMidX +=
            (defaultTreeConfig.ITEM_MARGIN_X + defaultTreeConfig.ITEM_WIDTH) /
            2;
        }
        const {
          mostLeft,
          mostRight,
          localMidX: _localMidX,
        } = processChildren(
          relationshipItem?.childrenIds || [],
          depth,
          localMidX,
          localMidY +
            defaultTreeConfig.ITEM_HEIGHT +
            defaultTreeConfig.ITEM_MARGIN_Y,
        );

        localMidX = _localMidX;
        if (relationshipItem?.childrenIds.length === 1) {
          localMidX +=
            (defaultTreeConfig.ITEM_MARGIN_X + defaultTreeConfig.ITEM_WIDTH) /
            2;
        }

        const topLine =
          getChildMidTop(localMidY) -
          (defaultTreeConfig.ITEM_HEIGHT + defaultTreeConfig.ITEM_MARGIN_Y) / 2;
        const midPosition = (mostLeft + mostRight) / 2;

        // Generating Parent B
        const parentBItem = generateTreeItem(
          person.parentBId,
          depth + 1,
          midPosition +
            (defaultTreeConfig.ITEM_WIDTH + defaultTreeConfig.ITEM_MARGIN_X) /
              2,
          localMidY,
          treeItemPosition.RIGHT,
          true,
          false,
          person.parentAId,
        );
        localMidX = parentBItem.midX;

        setTreeLines((prevLines) => [
          ...prevLines,
          {
            ...DEFAULT_TREE_LINE,
            left: mostLeft,
            right: mostRight,
            top: topLine,
            bottom: topLine,
          },
          {
            ...DEFAULT_TREE_LINE,
            left: midPosition,
            right: midPosition,
            top: localMidY,
            bottom:
              localMidY +
              (defaultTreeConfig.ITEM_HEIGHT +
                defaultTreeConfig.ITEM_MARGIN_Y) /
                2,
          },
          {
            ...DEFAULT_TREE_LINE,
            left:
              parentAItem.treeItem.midXPosition +
              defaultTreeConfig.ITEM_WIDTH / 2,
            right:
              parentBItem.treeItem.midXPosition -
              defaultTreeConfig.ITEM_WIDTH / 2,
            top: localMidY,
            bottom: localMidY,
          },
        ]);
      } else if (person.parentAId !== 0 || person.parentBId !== 0) {
        // have only parent data
        const parentId = person.parentAId || person.parentBId;
        return generateTreeItem(
          parentId,
          depth + 1,
          localMidX,
          localMidY,
          position,
          traceRelationship,
          false,
          0,
        );
      }
    }

    const proceed =
      !traceParents || (person.parentAId === 0 && person.parentBId === 0);
    if (depth > 1 && proceed) {
      const childMidTop = getChildMidTop(localMidY);

      let relationships = [] as Relationship[];
      const leftRelationships: Relationship[] = [];
      const rightRelationships: Relationship[] = [];

      const leftPartnerTreeItems: {
        treeItem: TreeItem;
        relationship: Relationship;
      }[] = [];
      const rightPartnerTreeItems: {
        treeItem: TreeItem;
        relationship: Relationship;
      }[] = [];
      let selfMidXPosition = currentMidX;

      if (traceRelationship) {
        relationships = fetchRelationships(personId, partnerIdToExclude);
        relationships.forEach((relationship, index) => {
          if (
            position === treeItemPosition.LEFT ||
            (position === treeItemPosition.CENTER &&
              relationships.length === 1 &&
              person.gender !== gender.MALE) ||
            (relationships.length > 1 && index < relationships.length / 2)
          ) {
            leftRelationships.push(relationship);
          } else {
            rightRelationships.push(relationship);
          }
        });

        // Left relationships generating
        leftRelationships.forEach((relationship) => {
          const partnerId =
            relationship.personOneId === personId
              ? relationship.personTwoId
              : relationship.personOneId;

          const partnerItem = generateTreeItem(
            partnerId,
            depth,
            localMidX,
            localMidY,
            treeItemPosition.LEFT,
            false,
            false,
            0,
          );
          leftPartnerTreeItems.push({
            treeItem: partnerItem.treeItem,
            relationship,
          });
          localMidX = partnerItem.midX;

          if (relationship.childrenIds.length > 0) {
            if (relationship.childrenIds.length === 1) {
              localMidX +=
                (defaultTreeConfig.ITEM_MARGIN_X +
                  defaultTreeConfig.ITEM_WIDTH) /
                2;
            }
            const {
              mostLeft,
              mostRight,
              localMidX: _localMidX,
            } = processChildren(
              relationship.childrenIds,
              depth,
              localMidX,
              childMidTop,
            );
            localMidX = _localMidX;
            const topLine =
              childMidTop -
              (defaultTreeConfig.ITEM_HEIGHT / 2 +
                defaultTreeConfig.ITEM_MARGIN_Y / 2);
            const midPosition = (mostLeft + mostRight) / 2;
            setTreeLines((prevLines) => [
              ...prevLines,
              {
                ...DEFAULT_TREE_LINE,
                left: mostLeft,
                right: mostRight,
                top: topLine,
                bottom: topLine,
              },
              {
                ...DEFAULT_TREE_LINE,
                left: midPosition,
                right: midPosition,
                top: localMidY,
                bottom:
                  localMidY +
                  (defaultTreeConfig.ITEM_HEIGHT +
                    defaultTreeConfig.ITEM_MARGIN_Y) /
                    2,
              },
            ]);
            if (
              leftRelationships.length === 1 &&
              rightRelationships.length === 0
            ) {
              selfMidXPosition =
                midPosition +
                (defaultTreeConfig.ITEM_WIDTH +
                  defaultTreeConfig.ITEM_MARGIN_X) /
                  2;
            }
          }
        });
      }

      // If having personal children
      if (person.childrenIDs.length > 0) {
        if (position === treeItemPosition.RIGHT) {
          localMidX +=
            defaultTreeConfig.ITEM_WIDTH + defaultTreeConfig.ITEM_MARGIN_X;
        }

        const {
          mostLeft,
          mostRight,
          localMidX: _localMidX,
        } = processChildren(person.childrenIDs, depth, localMidX, childMidTop);
        localMidX = _localMidX;

        let midXPosition = (mostLeft + mostRight) / 2;
        if (position === treeItemPosition.LEFT) {
          midXPosition =
            mostRight +
            defaultTreeConfig.ITEM_WIDTH +
            defaultTreeConfig.ITEM_MARGIN_X / 2;
        } else if (position === treeItemPosition.RIGHT) {
          midXPosition =
            mostLeft -
            (defaultTreeConfig.ITEM_WIDTH +
              defaultTreeConfig.ITEM_MARGIN_X / 2);
        }

        if (traceRelationship && position !== treeItemPosition.RIGHT) {
          selfMidXPosition = midXPosition;
        } else if (position === treeItemPosition.LEFT) {
          selfMidXPosition =
            mostRight +
            defaultTreeConfig.ITEM_WIDTH +
            defaultTreeConfig.ITEM_MARGIN_X;
          localMidX = selfMidXPosition;
        }

        const topLine =
          childMidTop -
          (defaultTreeConfig.ITEM_HEIGHT + defaultTreeConfig.ITEM_MARGIN_Y) / 2;
        const midPosition = (mostLeft + mostRight) / 2;
        const midBottomLine =
          localMidY +
          (defaultTreeConfig.ITEM_HEIGHT + defaultTreeConfig.ITEM_MARGIN_Y) / 2;
        setTreeLines((prevLines) => [
          ...prevLines,
          {
            ...DEFAULT_TREE_LINE,
            left: mostLeft,
            right: mostRight,
            top: topLine,
            bottom: topLine,
          },
          {
            ...DEFAULT_TREE_LINE,
            left: midPosition,
            right: midPosition,
            top:
              localMidY +
              defaultTreeConfig.ITEM_HEIGHT / 2 +
              defaultTreeConfig.ITEM_MARGIN_Y / 4,
            bottom: midBottomLine,
          },
          {
            ...DEFAULT_TREE_LINE,
            left: selfMidXPosition,
            right: selfMidXPosition,
            top: localMidY + defaultTreeConfig.ITEM_HEIGHT / 2,
            bottom:
              localMidY +
              defaultTreeConfig.ITEM_HEIGHT / 2 +
              defaultTreeConfig.ITEM_MARGIN_Y / 4,
          },
          ...(selfMidXPosition !== midPosition
            ? [
                {
                  ...DEFAULT_TREE_LINE,
                  left: selfMidXPosition,
                  right: midPosition,
                  top:
                    localMidY +
                    defaultTreeConfig.ITEM_HEIGHT / 2 +
                    defaultTreeConfig.ITEM_MARGIN_Y / 4,
                  bottom:
                    localMidY +
                    defaultTreeConfig.ITEM_HEIGHT / 2 +
                    defaultTreeConfig.ITEM_MARGIN_Y / 4,
                },
              ]
            : []),
        ]);
      }

      treeItem = {
        ...treeItem,
        midXPosition: selfMidXPosition,
      };

      // Right relationships generating
      if (traceRelationship) {
        rightRelationships.forEach((relationship) => {
          const partnerId =
            relationship.personOneId === personId
              ? relationship.personTwoId
              : relationship.personOneId;
          let partnerMidXPosition = localMidX;

          if (relationship.childrenIds.length > 0) {
            if (relationship.childrenIds.length === 1) {
              localMidX +=
                (defaultTreeConfig.ITEM_MARGIN_X +
                  defaultTreeConfig.ITEM_WIDTH) /
                2;
            }
            const {
              mostLeft,
              mostRight,
              localMidX: _localMidX,
            } = processChildren(
              relationship.childrenIds,
              depth,
              localMidX,
              childMidTop,
            );
            localMidX = _localMidX;
            const topLine =
              childMidTop -
              (defaultTreeConfig.ITEM_HEIGHT / 2 +
                defaultTreeConfig.ITEM_MARGIN_Y / 2);
            const midPosition = (mostLeft + mostRight) / 2;
            setTreeLines((prevLines) => [
              ...prevLines,
              {
                ...DEFAULT_TREE_LINE,
                left: mostLeft,
                right: mostRight,
                top: topLine,
                bottom: topLine,
              },
              {
                ...DEFAULT_TREE_LINE,
                left: midPosition,
                right: midPosition,
                bottom:
                  localMidY +
                  defaultTreeConfig.ITEM_HEIGHT / 2 +
                  defaultTreeConfig.ITEM_MARGIN_Y / 2,
                top: localMidY,
              },
            ]);
            if (
              leftRelationships.length === 0 &&
              rightRelationships.length === 1 &&
              person.childrenIDs.length === 0
            ) {
              selfMidXPosition =
                midPosition -
                (defaultTreeConfig.ITEM_WIDTH +
                  defaultTreeConfig.ITEM_MARGIN_X) /
                  2;
            }
            partnerMidXPosition =
              midPosition +
              (defaultTreeConfig.ITEM_WIDTH + defaultTreeConfig.ITEM_MARGIN_X) /
                2;
          }

          const partnerItem = generateTreeItem(
            partnerId,
            depth,
            partnerMidXPosition,
            localMidY,
            treeItemPosition.RIGHT,
            false,
            false,
            0,
          );
          rightPartnerTreeItems.push({
            treeItem: partnerItem.treeItem,
            relationship,
          });
          treeItem = {
            ...treeItem,
            midXPosition: selfMidXPosition,
          };
        });

        // Generating relationship lines
        leftPartnerTreeItems.forEach((partnerTreeItem) => {
          setTreeLines((prevLines) => [
            ...prevLines,
            {
              ...DEFAULT_TREE_LINE,
              ...(partnerTreeItem.relationship.isDivorced && {
                isDotted: true,
              }),
              ...(partnerTreeItem.relationship.isMarried &&
                !partnerTreeItem.relationship.isDivorced && { width: 4 }),
              left:
                partnerTreeItem.treeItem.midXPosition +
                defaultTreeConfig.ITEM_WIDTH / 2,
              right: treeItem.midXPosition - defaultTreeConfig.ITEM_WIDTH / 2,
              top: treeItem.midYPosition,
              bottom: treeItem.midYPosition,
            },
          ]);
        });
        rightPartnerTreeItems.forEach((partnerTreeItem) => {
          setTreeLines((prevLines) => [
            ...prevLines,
            {
              ...DEFAULT_TREE_LINE,
              ...(partnerTreeItem.relationship.isDivorced && {
                isDotted: true,
              }),
              ...(partnerTreeItem.relationship.isMarried &&
                !partnerTreeItem.relationship.isDivorced && { width: 4 }),
              right:
                partnerTreeItem.treeItem.midXPosition -
                defaultTreeConfig.ITEM_WIDTH / 2,
              left: treeItem.midXPosition + defaultTreeConfig.ITEM_WIDTH / 2,
              top: treeItem.midYPosition,
              bottom: treeItem.midYPosition,
            },
          ]);
        });
      }
    }
    if (proceed) {
      setTreeItems((prevItems) => [...prevItems, treeItem]);
    }
    return {
      treeItem,
      midX:
        localMidX +
        (position !== treeItemPosition.LEFT
          ? defaultTreeConfig.ITEM_WIDTH + defaultTreeConfig.ITEM_MARGIN_X
          : 0),
    };
  };

  const processChildren = (
    childrenIds: number[],
    depth: number,
    currentMidX: number,
    localMidY: number,
  ) => {
    let localMidX = currentMidX;
    let mostLeft = 0,
      mostRight = 0;
    childrenIds.forEach((childId, index) => {
      const childItem = generateTreeItem(
        childId,
        depth - 1,
        localMidX,
        localMidY,
        treeItemPosition.CENTER,
        true,
        false,
        0,
      );
      if (index === 0) {
        mostLeft = childItem.treeItem.midXPosition;
      }
      if (index === childrenIds.length - 1) {
        mostRight = childItem.treeItem.midXPosition;
      }
      setTreeLines((prevLines) => [
        ...prevLines,
        {
          ...DEFAULT_TREE_LINE,
          left: childItem.treeItem.midXPosition,
          right: childItem.treeItem.midXPosition,
          top:
            localMidY -
            (defaultTreeConfig.ITEM_HEIGHT / 2 +
              defaultTreeConfig.ITEM_MARGIN_Y / 2),
          bottom: localMidY - defaultTreeConfig.ITEM_HEIGHT / 2,
        },
      ]);
      localMidX = childItem.midX;
    });
    return { mostLeft, mostRight, localMidX, localMidY };
  };

  const getChildMidTop = (currentMidY: number): number => {
    return (
      currentMidY +
      defaultTreeConfig.ITEM_HEIGHT +
      defaultTreeConfig.ITEM_MARGIN_Y
    );
  };

  useEffect(() => {
    setTreeItems([]);
    setTreeLines([]);
    generateTreeItem(
      personId,
      defaultTreeConfig.SUCCESSOR_DEPTH,
      defaultTreeConfig.ITEM_MARGIN_X + defaultTreeConfig.ITEM_WIDTH,
      defaultTreeConfig.ITEM_MARGIN_Y + defaultTreeConfig.ITEM_HEIGHT,
      treeItemPosition.CENTER,
      true,
      true,
      0,
    );
  }, [personId]);

  return { treeItems, treeLines };
};
