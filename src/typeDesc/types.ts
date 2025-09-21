import { type LookupId } from './desc';

export type TypeDesc = {
  name: string;
  lookupId: LookupId;
  classifiedType: ClassifiedType;
  complexDesc?: any;
};

export type ClassifiedType =
  | 'MultiAddressId32'
  | 'AccountId32'
  | 'CompactU128'
  | 'CompactU32'
  | 'U8'
  | 'U16'
  | 'U32'
  | 'U64'
  | 'U128'
  | 'Bytes'
  | 'Bool'
  | 'FixedBytes'
  | 'VecFixed'
  | 'Enum'
  | 'Struct'
  | 'Option'
  | 'BoundedVec'
  | 'Vec'
  | 'Unsupported';
