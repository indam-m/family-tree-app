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
    gender: gender.GENDER_MALE,
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
    gender: gender.GENDER_MALE,
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
    gender: gender.GENDER_MALE,
    birthDate: '1958-08-04',
    birthPlace: 'Mojokerto',
    isDeceased: false,
    childrenIDs: [5, 6],
    parentAId: 0,
    parentBId: 0,
  },
  {
    id: 4,
    firstName: 'Dewi',
    lastName: 'Rinakanti',
    nickName: 'Dewi',
    gender: gender.GENDER_FEMALE,
    birthDate: '1966-01-03',
    birthPlace: 'Bandung',
    isDeceased: false,
    childrenIDs: [],
    parentAId: 0,
    parentBId: 0,
  },
  {
    id: 5,
    firstName: 'Hertry',
    lastName: 'Purwanto',
    nickName: 'Hery',
    gender: gender.GENDER_MALE,
    birthDate: '1958-08-04',
    birthPlace: 'Mojokerto',
    isDeceased: false,
    childrenIDs: [],
    parentAId: 0,
    parentBId: 0,
  },
  {
    id: 6,
    firstName: 'Detrwi',
    lastName: 'Rinakanti',
    nickName: 'Dewi',
    gender: gender.GENDER_FEMALE,
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

  const fetchRelationships = (personId: number) => {
    return relationshipData.filter(
      (relationship) =>
        relationship.personOneId === personId ||
        relationship.personTwoId === personId,
    );
  };

  const generateTreeItem = (
    personId: number,
    depth: number,
    currentLeft: number,
    currentTop: number,
    position: string,
    traceRelationship: boolean = true,
    traceParents: boolean = false,
  ) => {
    const person = personDict[personId];
    let treeItem: TreeItem = {
      person: person,
      midXPosition: currentLeft,
      midYPosition: currentTop,
    };

    if (depth > 1) {
      let localLeft = currentLeft;
      const childMidTop =
        currentTop +
        defaultTreeConfig.ITEM_HEIGHT +
        defaultTreeConfig.ITEM_MARGIN_Y;

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
      let selfMidXPosition = currentLeft;

      if (traceRelationship) {
        relationships = fetchRelationships(personId);
        relationships.forEach((relationship, index) => {
          if (
            (relationships.length === 1 &&
              person.gender !== gender.GENDER_MALE) ||
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
            localLeft,
            currentTop,
            treeItemPosition.LEFT,
            false,
            false,
          );
          leftPartnerTreeItems.push({
            treeItem: partnerItem.treeItem,
            relationship,
          });

          if (relationship.childrenIds.length > 0) {
            const {
              mostLeft,
              mostRight,
              localLeft: _localLeft,
            } = processChildren(
              relationship.childrenIds,
              depth,
              localLeft,
              childMidTop,
            );
            localLeft = _localLeft;
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
                top: currentTop,
                bottom:
                  currentTop +
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
          localLeft +=
            defaultTreeConfig.ITEM_WIDTH + defaultTreeConfig.ITEM_MARGIN_X;
        }

        const {
          mostLeft,
          mostRight,
          localLeft: _localLeft,
        } = processChildren(person.childrenIDs, depth, localLeft, childMidTop);
        localLeft = _localLeft;

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

        if (traceRelationship) {
          selfMidXPosition = midXPosition;
        }
        const topLine =
          childMidTop -
          (defaultTreeConfig.ITEM_HEIGHT + defaultTreeConfig.ITEM_MARGIN_Y) / 2;
        const midPosition = (mostLeft + mostRight) / 2;
        const midBottomLine =
          currentTop +
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
              currentTop +
              defaultTreeConfig.ITEM_HEIGHT / 2 +
              defaultTreeConfig.ITEM_MARGIN_Y / 4,
            bottom: midBottomLine,
          },
          {
            ...DEFAULT_TREE_LINE,
            left: selfMidXPosition,
            right: selfMidXPosition,
            top: currentTop + defaultTreeConfig.ITEM_HEIGHT / 2,
            bottom:
              currentTop +
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
                    currentTop +
                    defaultTreeConfig.ITEM_HEIGHT / 2 +
                    defaultTreeConfig.ITEM_MARGIN_Y / 4,
                  bottom:
                    currentTop +
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
          let partnerMidXPosition = localLeft;

          if (relationship.childrenIds.length > 0) {
            const {
              mostLeft,
              mostRight,
              localLeft: _localLeft,
            } = processChildren(
              relationship.childrenIds,
              depth,
              localLeft,
              childMidTop,
            );
            localLeft = _localLeft;
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
                  currentTop +
                  defaultTreeConfig.ITEM_HEIGHT / 2 +
                  defaultTreeConfig.ITEM_MARGIN_Y / 2,
                top: currentTop,
              },
            ]);
            if (
              leftRelationships.length === 0 &&
              rightRelationships.length === 1 &&
              person.childrenIDs.length === 0
            ) {
              selfMidXPosition =
                midPosition -
                (defaultTreeConfig.ITEM_WIDTH / 2 +
                  defaultTreeConfig.ITEM_MARGIN_X / 2);
            }
            partnerMidXPosition =
              midPosition +
              (defaultTreeConfig.ITEM_WIDTH / 2 +
                defaultTreeConfig.ITEM_MARGIN_X / 2);
          }

          const partnerItem = generateTreeItem(
            partnerId,
            depth,
            partnerMidXPosition,
            currentTop,
            treeItemPosition.RIGHT,
            false,
            false,
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
    setTreeItems((prevItems) => [...prevItems, treeItem]);
    return {
      treeItem,
      left:
        currentLeft +
        defaultTreeConfig.ITEM_WIDTH +
        defaultTreeConfig.ITEM_MARGIN_X,
    };
  };

  const processChildren = (
    childrenIds: number[],
    depth: number,
    currentLeft: number,
    currentTop: number,
  ) => {
    let localLeft = currentLeft;
    let mostLeft = 0,
      mostRight = 0;
    childrenIds.forEach((childId, index) => {
      const childItem = generateTreeItem(
        childId,
        depth - 1,
        localLeft,
        currentTop,
        treeItemPosition.CENTER,
        true,
        false,
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
            currentTop -
            (defaultTreeConfig.ITEM_HEIGHT / 2 +
              defaultTreeConfig.ITEM_MARGIN_Y / 2),
          bottom: currentTop - defaultTreeConfig.ITEM_HEIGHT / 2,
        },
      ]);
      localLeft = childItem.left;
    });
    return { mostLeft, mostRight, localLeft };
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
    );
  }, [personId]);

  return { treeItems, treeLines };
};
