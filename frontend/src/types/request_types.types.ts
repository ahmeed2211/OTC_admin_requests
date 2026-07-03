// src/types/request_type.types.ts

export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  FILE = 'file',
}

export interface RequestTypeField {
  id: string;
  fieldName: string;
  fieldType: FieldType;
  isRequired: boolean;
  description: string;
  requestTypeId: string;
}

export interface RequestType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  fields: RequestTypeField[];
}

export interface CreateFieldDto {
  fieldName: string;
  fieldType: FieldType;
  isRequired: boolean;
  description?: string;
}

export interface CreateRequestTypeDto {
  name: string;
  description?: string;
  fields: CreateFieldDto[];
}

export interface UpdateRequestTypeDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}