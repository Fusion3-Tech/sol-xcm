export type ArgDesc = {
  name: string;
  rawType: string;
  classifiedType: ArgType;
};

export type ArgType =
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
  | 'EnumUnit'
  | 'EnumData'
  | 'Option'
  | 'Unsupported';
