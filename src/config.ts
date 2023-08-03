/* eslint-disable @typescript-eslint/no-non-null-assertion */
// config settings, env variables
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env file into process.env if it exists. This is convenient for running locally.
dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

export interface IConfig {
  env: string;
  functionName: string;
  port: number;
  verifyReports: string;
  delay: number;
  apm: {
    secretToken: string;
    serviceName: string;
    url: string;
    active: string;
  };
  db: {
    pseudonymsdb: string;
    pseudonymscollection: string;
    transactionhistorydb: string;
    transactionhistory_pain001_collection: string;
    transactionhistory_pain013_collection: string;
    transactionhistory_pacs008_collection: string;
    transactionhistory_pacs002_collection: string;
    password: string;
    url: string;
    user: string;
  };
  cacheTTL: number;
  cert: string;
  tmsEndpoint: string;
  logstash: {
    host: string;
    port: number;
  };
  redis: {
    auth: string;
    db: number;
    host: string;
    port: number;
  };
  data: {
    type: string;
  };
}

export const configuration: IConfig = {
  apm: {
    serviceName: process.env.APM_SERVICE_NAME as string,
    url: process.env.APM_URL as string,
    secretToken: process.env.APM_SECRET_TOKEN as string,
    active: process.env.APM_ACTIVE as string,
  },
  cacheTTL: parseInt(process.env.CACHE_TTL!, 10),
  cert: process.env.CERT_PATH as string,
  tmsEndpoint: process.env.TMS_ENDPOINT as string,
  verifyReports: process.env.VERIFY_REPORTS as string,
  delay: parseInt(process.env.DELAY!, 0),
  db: {
    pseudonymsdb: process.env.PSEUDONYMS_DATABASE as string,
    pseudonymscollection: process.env.PSEUDONYMS_COLLECTION as string,
    transactionhistorydb: process.env.TRANSACTIONHISTORY_DATABASE as string,
    transactionhistory_pain001_collection: process.env
      .TRANSACTIONHISTORY_PAIN001_COLLECTION as string,
    transactionhistory_pain013_collection: process.env
      .TRANSACTIONHISTORY_PAIN013_COLLECTION as string,
    transactionhistory_pacs008_collection: process.env
      .TRANSACTIONHISTORY_PACS008_COLLECTION as string,
    transactionhistory_pacs002_collection: process.env
      .TRANSACTIONHISTORY_PACS002_COLLECTION as string,
    password: process.env.DATABASE_PASSWORD as string,
    url: process.env.DATABASE_URL as string,
    user: process.env.DATABASE_USER as string,
  },
  env: process.env.NODE_ENV as string,
  functionName: process.env.FUNCTION_NAME as string,
  logstash: {
    host: process.env.LOGSTASH_HOST as string,
    port: parseInt(process.env.LOGSTASH_PORT!, 10),
  },
  port: parseInt(process.env.PORT!, 10) || 3000,
  redis: {
    auth: process.env.REDIS_AUTH as string,
    db: parseInt(process.env.REDIS_DB!, 10) || 0,
    host: process.env.REDIS_HOST as string,
    port: parseInt(process.env.REDIS_PORT!, 10),
  },
  data: {
    type: process.env.DATA_TYPE as string,
  },
};
