import {
    IAnalyticsMeta,
    IEdges,
    IFilterSubType,
    INodeMeta,
    INodeMetaAssociationInfo,
    IRecommenedAnalytics,
  } from './interface';
  const test_analytics: Array<IRecommenedAnalytics> = require('./test-analytics.json');
  const opptt: Array<INodeMetaAssociationInfo> = require('./optimized.json');
  const fJson: Array<IFilterSubType> = require('./filterMap.json');
  
  function fetchMetaNodesData(
    ids: Array<string>,
    optimizedHierarchy: Array<INodeMetaAssociationInfo>
  ): Array<INodeMetaAssociationInfo> {
    const returningNodes = ids.reduce(
      (nodesMetaData: Array<INodeMetaAssociationInfo>, currentId: string) => {
        const metaNodeInHierarchy: INodeMetaAssociationInfo | undefined =
          optimizedHierarchy.find(
            (hierarchyItem: INodeMetaAssociationInfo) =>
              hierarchyItem.id === currentId
          );
        if (metaNodeInHierarchy) {
          nodesMetaData.push(metaNodeInHierarchy);
        }
        return nodesMetaData;
      },
      [] as Array<INodeMetaAssociationInfo>
    );
    return returningNodes;
  }
  /**
   *
   * @param arrayToBeOperated Array from which unique elements are needed!! Works only for primitive data types.
   * @returns A unique list of the type supplied to it.
   */
  function getUniqueList<Type>(arrayToBeOperated: Array<Type>): Array<Type> {
    return arrayToBeOperated.filter(
      (item: Type, index: number, origArray: Array<Type>) =>
        origArray.indexOf(item) === index
    );
  }
  
  function filterUsingCompatibleAssetType(
    analyticsMetaPipeline: Array<IAnalyticsMeta>,
    trainAssetId: Array<INodeMetaAssociationInfo>,
    fetchedFilteredNodeTypes: Map<string, Array<string>>,
    optimizedHierarchy: Array<INodeMetaAssociationInfo>
  ) {
    const modifiedAnalytics: Array<IRecommenedAnalytics> =
      analyticsMetaPipeline.reduce(
        (
          firstIteration: Array<IRecommenedAnalytics>,
          analyticMeta: IAnalyticsMeta
        ) => {
          const getCompatibleAssetType: Array<INodeMetaAssociationInfo> =
            trainAssetId.reduce(
              (
                finalCompatibleAssetsWithinEachTrain: Array<INodeMetaAssociationInfo>,
                currentTrainData: INodeMetaAssociationInfo
              ) => {
                const currentEdgesOfTrain: Array<INodeMetaAssociationInfo> =
                  fetchMetaNodesData(
                    currentTrainData.edges.map((edge: IEdges) => edge.targetid),
                    optimizedHierarchy
                  ).map((nodeData: INodeMeta) => ({
                    ...nodeData,
                    trainId: currentTrainData.id,
                  }));
                const eachCompatibleAssetList: Array<INodeMetaAssociationInfo> =
                  analyticMeta.info.compatibleAssetTypes.length
                    ? analyticMeta.info.compatibleAssetTypes.reduce(
                        (
                          compatibleAssets: Array<INodeMetaAssociationInfo>,
                          currentAssetTypeInAnalyticsMeta: string
                        ) => {
                          if (currentAssetTypeInAnalyticsMeta === '*') {
                            return [...compatibleAssets, ...currentEdgesOfTrain];
                          } else if (
                            currentEdgesOfTrain.filter(
                              (nodeData: INodeMetaAssociationInfo) =>
                                nodeData.type === currentAssetTypeInAnalyticsMeta
                            ).length
                          ) {
                            return [
                              ...compatibleAssets,
                              ...currentEdgesOfTrain.filter(
                                (nodeData: INodeMetaAssociationInfo) =>
                                  nodeData.type ===
                                  currentAssetTypeInAnalyticsMeta
                              ),
                            ];
                          } else if (
                            fetchedFilteredNodeTypes.has(
                              currentAssetTypeInAnalyticsMeta
                            ) &&
                            fetchedFilteredNodeTypes.get(
                              currentAssetTypeInAnalyticsMeta
                            )?.length
                          ) {
                            const filteredNode = currentEdgesOfTrain.filter(
                              (nodeItem: INodeMetaAssociationInfo) =>
                                fetchedFilteredNodeTypes
                                  .get(currentAssetTypeInAnalyticsMeta)
                                  ?.includes(nodeItem.type)
                            );
                            return [...compatibleAssets, ...filteredNode];
                          }
                          return [...compatibleAssets];
                        },
                        [] as Array<INodeMetaAssociationInfo>
                      )
                    : [{ ...currentTrainData, trainId: currentTrainData.id }];
  
                return [
                  ...finalCompatibleAssetsWithinEachTrain,
                  ...eachCompatibleAssetList,
                ];
              },
              [] as Array<INodeMetaAssociationInfo>
            );
          return [
            ...firstIteration,
            {
              ...analyticMeta,
              applicableAtNode: getCompatibleAssetType,
            } as IRecommenedAnalytics,
          ];
        },
        [] as Array<IRecommenedAnalytics>
      );
    return modifiedAnalytics;
  }
  
  const filterMap: Map<string, Array<string>> = fJson.reduce(
    (acc: Map<string, Array<string>>, curr: IFilterSubType) => {
      acc.set(curr.baseType, curr.subTypes);
      return acc;
    },
    new Map()
  );
  
  function getFlatArrayTillLeaf(
    nodes: Array<INodeMetaAssociationInfo>,
    optimizedHierarchy: Array<INodeMetaAssociationInfo>,
    flatTillLeafNode: Array<INodeMetaAssociationInfo> = new Array<INodeMetaAssociationInfo>(),
    assetId: string | undefined = undefined,
    trainId: string | undefined = undefined
  ): Array<INodeMetaAssociationInfo> {
    return nodes.reduce(
      (acc: Array<INodeMetaAssociationInfo>, curr: INodeMetaAssociationInfo) => {
        if (curr.edges.length) {
          return [
            {
              ...curr,
              assetId: assetId ?? curr.id,
              trainId: trainId ?? curr.trainId,
            },
            ...getFlatArrayTillLeaf(
              fetchMetaNodesData(
                curr.edges.map((edgeItem: IEdges) => edgeItem.targetid),
                optimizedHierarchy
              ),
              optimizedHierarchy,
              [...acc],
              assetId ?? curr.id,
              trainId ?? curr.trainId
            ),
          ];
        }
        return [
          ...acc,
          {
            ...curr,
            assetId: assetId ?? curr.id,
            trainId: trainId ?? curr.trainId,
          },
        ];
      },
      flatTillLeafNode
    );
  }
  
  function finalToCall(analyticsApplicableAtAssociated: Array<IRecommenedAnalytics>, optimizedHierarchy: Array<INodeMetaAssociationInfo>) { 
    const analyticsApplicableAt: Array<IRecommenedAnalytics> =
      analyticsApplicableAtAssociated.reduce(
        (
          appliedAtFinalArray: Array<IRecommenedAnalytics>,
          currentAnalyticsItem: IRecommenedAnalytics
        ) => {
          const perAnalyticsNodes: Array<INodeMetaAssociationInfo> =
            currentAnalyticsItem.info.appliedAt.reduce(
              (
                finalApplicableNode: Array<INodeMetaAssociationInfo>,
                currentAppliedAt: string
              ) => {
                const allLeafNode: Array<INodeMetaAssociationInfo> =
                  getFlatArrayTillLeaf(
                    currentAnalyticsItem.applicableAtNode,
                    optimizedHierarchy
                  );
  
                if (
                  allLeafNode.filter(
                    (nodeItem: INodeMetaAssociationInfo) =>
                      nodeItem.type === currentAppliedAt
                  ).length
                ) {
                  const filteredNode: Array<INodeMetaAssociationInfo> =
                    allLeafNode.filter(
                      (nodeItem: INodeMetaAssociationInfo) =>
                        nodeItem.type === currentAppliedAt
                    );
                  return [...finalApplicableNode, ...filteredNode];
                } else if (filterMap.get(currentAppliedAt)?.length) {
                  const filteredNode = allLeafNode.filter(
                    (nodeItem: INodeMetaAssociationInfo) =>
                      filterMap.get(currentAppliedAt)?.includes(nodeItem.type)
                  );
                  return [...finalApplicableNode, ...filteredNode];
                }
                return finalApplicableNode;
              },
              [] as Array<INodeMetaAssociationInfo>
            );
          return [
            ...appliedAtFinalArray,
            {
              ...currentAnalyticsItem,
              applicableAtNode: [...perAnalyticsNodes],
            } as IRecommenedAnalytics,
          ];
        },
        [] as Array<IRecommenedAnalytics>
      );
    return analyticsApplicableAt;
  }
  

// Enter the APM train id on which the logic should run;
const uniqueApmTrainIds: Array<string> = getUniqueList([
    '63625b1d-e5bf-4062-88a2-c839e6065d8e',
    '6a872b6d-8c92-4edf-a2df-0359b0d16a50',
  ]) 

const firstLevelCompatibleAssetFilter: Array<IRecommenedAnalytics> = filterUsingCompatibleAssetType(
    test_analytics,
    fetchMetaNodesData(
      uniqueApmTrainIds,
      opptt
    ),
    filterMap,
    opptt
  );

console.log('firstLevelCompatibleAssetFilter: ', firstLevelCompatibleAssetFilter);


const finalFilteredRecommendedAnalytics: Array<IRecommenedAnalytics> = finalToCall(firstLevelCompatibleAssetFilter, opptt);

console.log('filterUsingCompatibleAssetType: ', finalFilteredRecommendedAnalytics);

  