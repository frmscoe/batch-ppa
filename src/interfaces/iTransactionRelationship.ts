export interface TransactionRelationship {
  from: string;
  to: string;
  TxTp: string;
  MsgId: string;
  CreDtTm: string;
  Amt?: number;
  Ccy?: string;
  PmtInfId: string;
  EndToEndId: string;
  lat?: string;
  long?: string;
  TxSts?: string;
}
