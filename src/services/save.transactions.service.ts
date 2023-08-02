import apm from 'elastic-apm-node';
import { databaseManager, loggerService, server } from '.';
import { Pain001 } from '../classes/pain.001.001.11';
import { Pacs008 } from '../classes/pacs.008.001.10';
import { Pain013 } from '../classes/pain.013.001.09';
import { type DataCache } from '../classes/data-cache';
import { configuration } from '../config';
import { type TransactionRelationship } from '../interfaces/iTransactionRelationship';
import { cacheDatabaseClient } from './services-container';

const calculateDuration = (startTime: bigint): number => {
  const endTime = process.hrtime.bigint();
  return Number(endTime - startTime);
};

export const handleTransaction = async (transaction: unknown): Promise<void> => {
  const transObject = transaction as Pain001 | Pain013 | Pacs008 ;
  switch (transObject.TxTp) {
    case 'pain.001.001.11':
      await handlePain001(transObject as Pain001);
      break;

    case 'pain.013.001.09':
      await handlePain013(transObject as Pain013);
      break;

    case 'pacs.008.001.10':
      await handlePacs008(transObject as Pacs008);
      break;

    default:
      break;
  }
};

const handlePain001 = async (transaction: Pain001): Promise<void> => {
  loggerService.log('Start - Handle transaction data');
  const span = apm.startSpan('Handle transaction data');
  const startTime = process.hrtime.bigint();

  transaction.EndToEndId = transaction.CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.PmtId.EndToEndId;
  transaction.DebtorAcctId = transaction.CstmrCdtTrfInitn.PmtInf.DbtrAcct.Id.Othr.Id;
  transaction.CreditorAcctId = transaction.CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.CdtrAcct.Id.Othr.Id;
  transaction.CreDtTm = transaction.CstmrCdtTrfInitn.GrpHdr.CreDtTm;

  const Amt = transaction.CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.Amt.InstdAmt.Amt.Amt;
  const Ccy = transaction.CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.Amt.InstdAmt.Amt.Ccy;
  const creditorAcctId = transaction.CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.CdtrAcct.Id.Othr.Id;
  const creditorId = transaction.CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.Cdtr.Id?.PrvtId.Othr.Id;
  const CreDtTm = transaction.CstmrCdtTrfInitn.GrpHdr.CreDtTm;
  const debtorAcctId = transaction.CstmrCdtTrfInitn.PmtInf.DbtrAcct.Id.Othr.Id;
  const debtorId = transaction.CstmrCdtTrfInitn.PmtInf.Dbtr.Id?.PrvtId.Othr.Id;
  const EndToEndId = transaction.CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.PmtId.EndToEndId;
  const lat = transaction.CstmrCdtTrfInitn.SplmtryData.Envlp.Doc.InitgPty.Glctn.Lat;
  const long = transaction.CstmrCdtTrfInitn.SplmtryData.Envlp.Doc.InitgPty.Glctn.Long;
  const MsgId = transaction.CstmrCdtTrfInitn.GrpHdr.MsgId;
  const PmtInfId = transaction.CstmrCdtTrfInitn.PmtInf.PmtInfId;
  const TxTp = transaction.TxTp;

  const transactionRelationship: TransactionRelationship = {
    from: `accounts/${debtorAcctId}`,
    to: `accounts/${creditorAcctId}`,
    Amt,
    Ccy,
    CreDtTm,
    EndToEndId,
    lat,
    long,
    MsgId,
    PmtInfId,
    TxTp,
  };

  const dataCache: DataCache = {
    cdtrId: creditorId,
    dbtrId: debtorId,
    cdtrAcctId: creditorAcctId,
    dbtrAcctId: debtorAcctId,
  };

  try {
    await Promise.all([
      cacheDatabaseClient.saveTransactionHistory(
        transaction,
        configuration.db.transactionhistory_pain001_collection,
        `pain001_${transaction.EndToEndId}`,
      ),
      cacheDatabaseClient.addAccount(debtorAcctId),
      cacheDatabaseClient.addAccount(creditorAcctId),
      cacheDatabaseClient.addEntity(creditorId, CreDtTm),
      cacheDatabaseClient.addEntity(debtorId, CreDtTm),
      databaseManager.setJson(transaction.EndToEndId, JSON.stringify(dataCache), 150),
    ]);

    await Promise.all([
      cacheDatabaseClient.saveTransactionRelationship(transactionRelationship),
      cacheDatabaseClient.addAccountHolder(creditorId, creditorAcctId, CreDtTm),
      cacheDatabaseClient.addAccountHolder(debtorId, debtorAcctId, CreDtTm),
    ]);
  } catch (err) {
    loggerService.log(JSON.stringify(err));
    throw err;
  }

  // Notify CRSP
  server.handleResponse({ transaction, DataCache: dataCache, metaData: { prcgTmDP: calculateDuration(startTime) } });
  loggerService.log('Transaction send to CRSP service');

  span?.end();
  loggerService.log('END - Handle transaction data');
};

const handlePain013 = async (transaction: Pain013): Promise<void> => {
  loggerService.log('Start - Handle transaction data');
  const span = apm.startSpan('Handle transaction data');
  const startTime = process.hrtime.bigint();

  transaction.EndToEndId = transaction.CdtrPmtActvtnReq.PmtInf.CdtTrfTxInf.PmtId.EndToEndId;

  const Amt = transaction.CdtrPmtActvtnReq.PmtInf.CdtTrfTxInf.Amt.InstdAmt.Amt.Amt;
  const Ccy = transaction.CdtrPmtActvtnReq.PmtInf.CdtTrfTxInf.Amt.InstdAmt.Amt.Ccy;
  const CreDtTm = transaction.CdtrPmtActvtnReq.GrpHdr.CreDtTm;
  const EndToEndId = transaction.CdtrPmtActvtnReq.PmtInf.CdtTrfTxInf.PmtId.EndToEndId;
  const MsgId = transaction.CdtrPmtActvtnReq.GrpHdr.MsgId;
  const PmtInfId = transaction.CdtrPmtActvtnReq.PmtInf.PmtInfId;
  const TxTp = transaction.TxTp;

  const creditorAcctId = transaction.CdtrPmtActvtnReq.PmtInf.CdtTrfTxInf.CdtrAcct.Id.Othr.Id;
  const debtorAcctId = transaction.CdtrPmtActvtnReq.PmtInf.DbtrAcct.Id.Othr.Id;

  const transactionRelationship: TransactionRelationship = {
    from: `accounts/${creditorAcctId}`,
    to: `accounts/${debtorAcctId}`,
    Amt,
    Ccy,
    CreDtTm,
    EndToEndId,
    MsgId,
    PmtInfId,
    TxTp,
  };

  let dataCache;
  try {
    const dataCacheJSON = await databaseManager.getJson(transaction.EndToEndId);
    dataCache = JSON.parse(dataCacheJSON) as DataCache;
  } catch (ex) {
    loggerService.log(`Could not retrieve data cache for : ${transaction.EndToEndId} from redis. Proceeding with Arango Call.`);
    dataCache = await rebuildCache(transaction.EndToEndId);
  }

  transaction._key = MsgId;

  try {
    await Promise.all([
      cacheDatabaseClient.saveTransactionHistory(
        transaction,
        configuration.db.transactionhistory_pain013_collection,
        `pain013_${transaction.EndToEndId}`,
      ),
      cacheDatabaseClient.addAccount(debtorAcctId),
      cacheDatabaseClient.addAccount(creditorAcctId),
    ]);

    await cacheDatabaseClient.saveTransactionRelationship(transactionRelationship);
  } catch (err) {
    loggerService.log(JSON.stringify(err));
    throw err;
  }

  // Notify CRSP
  server.handleResponse({ transaction, DataCache: dataCache, metaData: { prcgTmDP: calculateDuration(startTime) } });
  loggerService.log('Transaction send to CRSP service');

  span?.end();
  loggerService.log('END - Handle transaction data');
};

const handlePacs008 = async (transaction: Pacs008): Promise<void> => {
  loggerService.log('Start - Handle transaction data');
  const span = apm.startSpan('Handle transaction data');
  const startTime = process.hrtime.bigint();

  transaction.EndToEndId = transaction.FIToFICstmrCdt.CdtTrfTxInf.PmtId.EndToEndId;
  transaction.DebtorAcctId = transaction.FIToFICstmrCdt.CdtTrfTxInf.DbtrAcct.Id.Othr.Id;
  transaction.CreditorAcctId = transaction.FIToFICstmrCdt.CdtTrfTxInf.CdtrAcct.Id.Othr.Id;
  transaction.CreDtTm = transaction.FIToFICstmrCdt.GrpHdr.CreDtTm;

  const Amt = transaction.FIToFICstmrCdt.CdtTrfTxInf.InstdAmt.Amt.Amt;
  const Ccy = transaction.FIToFICstmrCdt.CdtTrfTxInf.InstdAmt.Amt.Ccy;
  const CreDtTm = transaction.FIToFICstmrCdt.GrpHdr.CreDtTm;
  const EndToEndId = transaction.FIToFICstmrCdt.CdtTrfTxInf.PmtId.EndToEndId;
  const MsgId = transaction.FIToFICstmrCdt.GrpHdr.MsgId;
  const PmtInfId = transaction.FIToFICstmrCdt.CdtTrfTxInf.PmtId.InstrId;
  const TxTp = transaction.TxTp;

  const debtorAcctId = transaction.FIToFICstmrCdt.CdtTrfTxInf.DbtrAcct.Id.Othr.Id;
  const creditorAcctId = transaction.FIToFICstmrCdt.CdtTrfTxInf.CdtrAcct.Id.Othr.Id;

  const transactionRelationship: TransactionRelationship = {
    from: `accounts/${debtorAcctId}`,
    to: `accounts/${creditorAcctId}`,
    Amt,
    Ccy,
    CreDtTm,
    EndToEndId,
    MsgId,
    PmtInfId,
    TxTp,
  };

  let dataCache;
  try {
    const dataCacheJSON = await databaseManager.getJson(transaction.EndToEndId);
    dataCache = JSON.parse(dataCacheJSON) as DataCache;
  } catch (ex) {
    loggerService.log(`Could not retrieve data cache for : ${transaction.EndToEndId} from redis. Proceeding with Arango Call.`);
    dataCache = await rebuildCache(transaction.EndToEndId);
  }

  try {
    await Promise.all([
      cacheDatabaseClient.saveTransactionHistory(
        transaction,
        configuration.db.transactionhistory_pacs008_collection,
        `pacs008_${transaction.EndToEndId}`,
      ),
      cacheDatabaseClient.addAccount(debtorAcctId),
      cacheDatabaseClient.addAccount(creditorAcctId),
    ]);

    await cacheDatabaseClient.saveTransactionRelationship(transactionRelationship);
  } catch (err) {
    loggerService.log(JSON.stringify(err));
    throw err;
  }

  // Notify CRSP
  server.handleResponse({ transaction, DataCache: dataCache, metaData: { prcgTmDP: calculateDuration(startTime) } });
  loggerService.log('Transaction send to CRSP service');
  span?.end();
};


export const rebuildCache = async (endToEndId: string): Promise<DataCache | undefined> => {
  const currentPain001 = (await databaseManager.getTransactionPain001(endToEndId)) as [Pain001[]];
  if (!currentPain001 || !currentPain001[0] || !currentPain001[0][0]) {
    loggerService.error('Could not find pain001 transaction to rebuild dataCache with');
    return undefined;
  }
  const dataCache: DataCache = {
    cdtrId: currentPain001[0][0].CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.Cdtr.Id?.PrvtId.Othr.Id,
    dbtrId: currentPain001[0][0].CstmrCdtTrfInitn.PmtInf.Dbtr.Id?.PrvtId.Othr.Id,
    cdtrAcctId: currentPain001[0][0].CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.CdtrAcct.Id.Othr.Id,
    dbtrAcctId: currentPain001[0][0].CstmrCdtTrfInitn.PmtInf.DbtrAcct.Id.Othr.Id,
  };
  await databaseManager.setJson(endToEndId, JSON.stringify(dataCache), 150);

  return dataCache;
};
