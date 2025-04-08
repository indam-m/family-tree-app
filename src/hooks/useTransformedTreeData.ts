'use client';
import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  gender,
  defaultTreeConfig,
  DEFAULT_TREE_LINE,
  treeItemPosition,
} from '@/constants/person';
import {
  Person,
  ParentChild,
  Relationship,
  TreeItem,
  TreeLine,
} from '@/types/tree';
import { GET_EVERYTHING } from '@/lib/graphql/queries';

export const useTransformedTreeData = (personId: number) => {
  const [treeItems, setTreeItems] = useState<TreeItem[]>([]);
  const [treeLines, setTreeLines] = useState<TreeLine[]>([]);
  const [peopleData, setPeopleData] = useState<Person[]>([]);
  const [personDict, setPersonDict] = useState<{ [id: number]: Person }>({});

  const { data, loading, error } = useQuery(GET_EVERYTHING);

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
    let parentOneId = 0,
      parentTwoId = 0;
    const parentChildRelation =
      person?.parentChildRelations && person?.parentChildRelations[0];
    if (parentChildRelation) {
      parentOneId = parentChildRelation?.parentOneId || 0;
      parentTwoId = parentChildRelation?.parentTwoId || 0;
    }
    let treeItem: TreeItem = {
      person: person,
      midXPosition: currentMidX,
      midYPosition: currentMidY,
    };
    let localMidX = currentMidX;
    const localMidY = currentMidY;

    if (traceParents) {
      // have both parents data
      if (parentOneId !== 0 && parentTwoId !== 0) {
        const parentOneItem = generateTreeItem(
          parentOneId,
          depth + 1,
          localMidX,
          localMidY,
          treeItemPosition.LEFT,
          true,
          false,
          parentTwoId,
        );
        localMidX = parentOneItem.midX;

        // Generating children
        const relationshipItem = (person.parentChildRelations || [])[0]
          ?.relationship;
        if (relationshipItem?.parentChildren?.length === 1) {
          localMidX +=
            (defaultTreeConfig.ITEM_MARGIN_X + defaultTreeConfig.ITEM_WIDTH) /
            2;
        }
        const {
          mostLeft,
          mostRight,
          localMidX: _localMidX,
        } = processChildren(
          relationshipItem?.parentChildren || [],
          depth,
          localMidX,
          localMidY +
            defaultTreeConfig.ITEM_HEIGHT +
            defaultTreeConfig.ITEM_MARGIN_Y,
        );

        localMidX = _localMidX;
        if (relationshipItem?.parentChildren?.length === 1) {
          localMidX +=
            (defaultTreeConfig.ITEM_MARGIN_X + defaultTreeConfig.ITEM_WIDTH) /
            2;
        }

        const topLine =
          getChildMidTop(localMidY) -
          (defaultTreeConfig.ITEM_HEIGHT + defaultTreeConfig.ITEM_MARGIN_Y) / 2;
        const midPosition = (mostLeft + mostRight) / 2;

        // Generating Parent B
        const parentTwoItem = generateTreeItem(
          parentTwoId,
          depth + 1,
          midPosition +
            (defaultTreeConfig.ITEM_WIDTH + defaultTreeConfig.ITEM_MARGIN_X) /
              2,
          localMidY,
          treeItemPosition.RIGHT,
          true,
          false,
          parentOneId,
        );
        localMidX = parentTwoItem.midX;

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
              parentOneItem.treeItem.midXPosition +
              defaultTreeConfig.ITEM_WIDTH / 2,
            right:
              parentTwoItem.treeItem.midXPosition -
              defaultTreeConfig.ITEM_WIDTH / 2,
            top: localMidY,
            bottom: localMidY,
          },
        ]);
      } else if (parentOneId !== 0 || parentTwoId !== 0) {
        // have only parent data
        const parentId = parentOneId || parentTwoId;
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
      !traceParents || (person.parentOneId === 0 && person.parentTwoId === 0);
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
        relationships = (person?.relationshipsAsPersonOne || [])
          .concat(person?.relationshipsAsPersonTwo || [])
          .filter(
            (relationship) =>
              relationship.personOneId !== partnerIdToExclude &&
              relationship.personTwoId !== partnerIdToExclude,
          );
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
          const parentChildren = relationship.parentChildren || [];

          if (parentChildren.length > 0) {
            if (relationship.parentChildren?.length === 1) {
              localMidX +=
                (defaultTreeConfig.ITEM_MARGIN_X +
                  defaultTreeConfig.ITEM_WIDTH) /
                2;
            }
            const {
              mostLeft,
              mostRight,
              localMidX: _localMidX,
            } = processChildren(parentChildren, depth, localMidX, childMidTop);
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
      const personalChildren = person?.parentChildOfChildren || [];
      if (personalChildren.length > 0) {
        if (position === treeItemPosition.RIGHT) {
          localMidX +=
            defaultTreeConfig.ITEM_WIDTH + defaultTreeConfig.ITEM_MARGIN_X;
        }

        const {
          mostLeft,
          mostRight,
          localMidX: _localMidX,
        } = processChildren(
          person.parentChildOfChildren || [],
          depth,
          localMidX,
          childMidTop,
        );
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

          const parentChildren = relationship.parentChildren || [];

          if (parentChildren.length > 0) {
            if (parentChildren.length === 1) {
              localMidX +=
                (defaultTreeConfig.ITEM_MARGIN_X +
                  defaultTreeConfig.ITEM_WIDTH) /
                2;
            }
            const {
              mostLeft,
              mostRight,
              localMidX: _localMidX,
            } = processChildren(parentChildren, depth, localMidX, childMidTop);
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
              personalChildren.length === 0
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
    parentChildrens: ParentChild[],
    depth: number,
    currentMidX: number,
    localMidY: number,
  ) => {
    let localMidX = currentMidX;
    let mostLeft = 0,
      mostRight = 0;
    parentChildrens.forEach((parentChild, index) => {
      const childId = parentChild.childId;
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
      if (index === parentChildrens.length - 1) {
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

  // useEffect
  useEffect(() => {
    if (!loading && !error) {
      setPeopleData(data?.people || []);
    }
  }, [personId, loading, error]);

  useEffect(() => {
    if (peopleData.length > 0) {
      setPersonDict(
        peopleData.reduce(
          (acc: { [id: number]: Person }, person: Person) => {
            acc[person.id] = person;
            return acc;
          },
          {} as { [id: number]: Person },
        ),
      );
    }
  }, [peopleData]);

  useEffect(() => {
    if (personDict[personId]) {
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
    }
  }, [personDict]);

  return { treeItems, treeLines, loading, error };
};
