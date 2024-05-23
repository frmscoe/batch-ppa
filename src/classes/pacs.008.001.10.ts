// SPDX-License-Identifier: Apache-2.0

import { type InitgPty, type InitgPtyID } from './pain.001.001.11';

export interface Pacs008 {
  TxTp: string;
  FIToFICstmrCdt: FIToFICstmrCdt;
  EndToEndId: string;
  DebtorAcctId: string;
  CreditorAcctId: string;
  CreDtTm: string;
}

export interface FIToFICstmrCdt {
  GrpHdr: GrpHdr;
  CdtTrfTxInf: CdtTrfTxInf;
  RgltryRptg: RgltryRptg;
  RmtInf: RmtInf;
  SplmtryData: SplmtryData;
}

export interface CdtTrfTxInf {
  PmtId: PmtID;
  IntrBkSttlmAmt: InstdAmtClass;
  InstdAmt: InstdAmtClass;
  ChrgBr: string;
  ChrgsInf: ChrgsInf;
  InitgPty?: InitgPty;
  Dbtr: InitgPty;
  DbtrAcct: TrAcct;
  DbtrAgt?: Agt;
  CdtrAgt?: Agt;
  Cdtr: Cdtr;
  CdtrAcct: TrAcct;
  Purp: Purp;
}

export interface Cdtr {
  Nm: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  Id?: {} | CdtrID | InitgPtyID;
  CtctDtls?: CtctDtls;
}

export interface CtctDtls {
  MobNb: string;
}

export interface CdtrID {
  PrvtId: PrvtID;
}

export interface PrvtID {
  DtAndPlcOfBirth: DtAndPLCOfBirth;
  Othr: Othr;
}

export interface DtAndPLCOfBirth {
  BirthDt: Date;
  CityOfBirth: string;
  CtryOfBirth: string;
}

export interface Othr {
  Id: string;
  SchmeNm: SchmeNm;
}

export interface SchmeNm {
  Prtry: string;
}

export interface TrAcct {
  IBAN?: string;
  Id: CdtrAcctID;
  Nm?: string;
}

export interface CdtrAcctID {
  Othr: Othr;
}

export interface Agt {
  FinInstnId: FinInstnID;
}

export interface FinInstnID {
  ClrSysMmbId: CLRSysMmbID;
}

export interface CLRSysMmbID {
  MmbId: string;
}

export interface ChrgsInf {
  Amt: Amt;
  Agt: Agt;
}

export interface Amt {
  Amt: number;
  Ccy: string;
}

export interface InstdAmtClass {
  Amt: Amt;
}

export interface PmtID {
  InstrId: string;
  EndToEndId: string;
}

export interface Purp {
  Cd: string;
}

export interface GrpHdr {
  MsgId: string;
  CreDtTm: string;
  NbOfTxs: number;
  SttlmInf: SttlmInf;
}

export interface SttlmInf {
  SttlmMtd: string;
}

export interface RgltryRptg {
  Dtls: Dtls;
}

export interface Dtls {
  Tp: string;
  Cd: string;
}

export interface RmtInf {
  Ustrd: string;
}

export interface SplmtryData {
  Envlp: Envlp;
}

export interface Envlp {
  Doc: Doc;
}

export interface Doc {
  Xprtn: string;
}
