/**
 * BH Highly Confidential
 * Unpublished Copyright 2022. Baker Hughes
 *
 * NOTICE: All information contained herein is, and remains the property of Baker Hughes, and/or
 * its affiliates. The intellectual and technical concepts contained herein are proprietary to Baker Hughes
 * and/or its affiliates and may be covered by patents, copyrights, and/or trade secrets. Dissemination of this information or
 * reproduction of this material is strictly forbidden unless prior written permission is obtained from Baker Hughes.
 */

export interface IHierarchyMetaResponse {
    totalNodeCount: number;
    isDataAvailable: boolean;
    nextOffSet: number;
    count: number;
    httpStatusCode: number;
    timestamp: number;
    requestId: null | any;
    path: string;
    traceId: null | any;
    data: Array<INodeMeta>;
    errors: any;
  }
  
  export interface INodeMeta {
    id: string;
    name: string;
    group: string;
    type: string;
    class: string;
    cfgseq: string | number;
    properties: object;
    parent: Array<string>;
    edges: Array<IEdges>;
  }
  
  export interface INodeMetaAssociationInfo extends INodeMeta {
    trainId?: string;
    assetId?: string;
  }
  
  export interface IEdges {
    targetid: string;
    edgetype: string;
    properties: {};
  }
  
  export interface IAnalyticsMeta {
    info: IAnalyticsMetaInfoObject;
    id: string;
    name: string;
    displayName: string;
    insightPakVersion: string;
    createdBy: string;
    createdOn: string;
    modifiedBy: string;
    modifiedOn: string;
    inputOutputList: Object;
  }
  
  export interface IAnalyticsMetaInfoObject {
    compatibleAssetTypes: Array<string>;
    desc: string;
    category: string;
    supportedOps: Array<string>;
    image: string;
    version: string;
    appliedAt: Array<string>;
    artifactPath: string;
  }
  
  export interface IAnalyticsMetaAssociatedInfo extends IAnalyticsMeta {
    appliedAt: string;
    trainId: string;
    assetId: string;
  }
  
  export interface IMetaTagData {
    tracePath: string;
    name: string;
    unit: string;
    source: string;
    subUnit: string;
    datatype: string;
    attributes: Array<string>;
    description: string;
  }
  
  export interface IMetaResolvedTagData extends IMetaTagData {
    mappingDetails: IMappingInfo;
  }
  
  export interface IMappingInfo {
    id: string;
    nodeId: string;
    value: string;
    unit: string;
    subUnit: string;
  }
  
  export interface IPostMappingPayload {
    inputs: Array<IMetaResolvedTagData | IMetaTagData>;
    outputs: Array<IMetaResolvedTagData | IMetaTagData>;
  }
  
  export interface IPostMappingExtraInfoPayload extends IPostMappingPayload {
    appliedAt?: string;
    trainId?: string;
    assetId?: string;
    apmTrainId?: string;
    pipelineMetaId?: string;
    analyticsInstanceId?: string;
    id: string;
    analyticsVersion: string;
    mappingSetName: string;
  }
  
  export interface ISaveMappingPayload {
    insightpakInstanceId: string;
    mappingSetName: string;
    mappingData: IPostMappingPayload;
  }
  
  export interface IRecommenedAnalytics extends IAnalyticsMeta {
    applicableAtNode: Array<INodeMeta>;
  }
  
  export interface IFilterSubType {
    baseType: string;
    subTypes: Array<string>;
  }
  