export interface RequestCreatedEvent {
  requestId: string;
  requestNumber: number;
  agentEmail: string;
  agentName: string;
  requestTypeName: string;
  fromDate: Date;
  toDate: Date;
}

export interface RequestStatusUpdatedEvent {
  requestId: string;
  requestNumber: number;
  agentEmail: string;
  agentName: string;
  requestTypeName: string;
  newStatus: string;
  adminComment?: string;
}

export interface RequestConfirmedEvent {
  requestId: string;
  requestNumber: number;
  agentEmail: string;
  agentName: string;
  requestTypeName: string;
}