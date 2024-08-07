# SPDX-License-Identifier: Apache-2.0
ARG BUILD_IMAGE=node:20-bullseye
ARG RUN_IMAGE=gcr.io/distroless/nodejs20-debian11:nonroot

FROM ${BUILD_IMAGE} AS builder
LABEL stage=build
# TS -> JS stage

WORKDIR /home/app
COPY ./src ./src
COPY ./package*.json ./
COPY ./tsconfig.json ./
COPY .npmrc ./
ARG GH_TOKEN

RUN npm ci --ignore-scripts
RUN npm run build

FROM ${BUILD_IMAGE} AS dep-resolver
LABEL stage=pre-prod
# To filter out dev dependencies from final build

COPY package*.json ./
COPY .npmrc ./
ARG GH_TOKEN
RUN npm ci --omit=dev --ignore-scripts
RUN mkdir uploads

FROM ${RUN_IMAGE} AS run-env
USER nonroot

WORKDIR /home/app
COPY --from=dep-resolver /node_modules ./node_modules
COPY --from=builder /home/app/build ./build
COPY package.json ./
COPY deployment.yaml ./
COPY service.yaml ./
COPY --chown=nonroot:nonroot --from=dep-resolver /uploads ./uploads

#USER root
#RUN chmod 777 uploads
#USER nonroot


# Turn down the verbosity to default level.
ENV NPM_CONFIG_LOGLEVEL warn
ENV mode="http"
ENV upstream_url="http://127.0.0.1:3000"
ENV exec_timeout="10s"
ENV write_timeout="15s"
ENV read_timeout="15s"
ENV prefix_logs="false"
ENV FUNCTION_NAME=ppa-batch-to-tms-rel-1-0-0
ENV NODE_ENV=production
ENV PORT=3000
ENV TMS_ENDPOINT=
ENV VERIFY_REPORTS=false
ENV DELAY=1000
ENV CACHE_TTL=30
ENV CERT_PATH=
ENV REDIS_DB=0
ENV REDIS_AUTH=
ENV REDIS_HOST=
ENV REDIS_PORT=6379
ENV DATA_TYPE=textfile
ENV PSEUDONYMS_DATABASE=pseudonyms
ENV TRANSACTIONHISTORY_DATABASE=transactionHistory
ENV DATABASE_URL=
ENV DATABASE_USER=root
ENV DATABASE_PASSWORD=
ENV PSEUDONYMS_COLLECTION=pseudonyms
ENV TRANSACTIONHISTORY_PAIN001_COLLECTION=transactionHistoryPain001
ENV TRANSACTIONHISTORY_PAIN013_COLLECTION=transactionHistoryPain013
ENV TRANSACTIONHISTORY_PACS008_COLLECTION=transactionHistoryPacs008
ENV TRANSACTIONHISTORY_PACS002_COLLECTION=transactionHistoryPacs002
ENV APM_ACTIVE=true
ENV APM_SERVICE_NAME=ppa-batch-to-tms
ENV APM_URL=http://apm-server.development:8200
ENV APM_SECRET_TOKEN=
ENV LOGSTASH_HOST=logstash.development
ENV LOGSTASH_PORT=8080
ENV MAX_CPU=
ENV STARTUP_TYPE=nats
ENV SERVER_URL=0.0.0.0:4222
ENV PRODUCER_STREAM=
ENV CONSUMER_STREAM=
ENV STREAM_SUBJECT=
ENV ACK_POLICY=Explicit
ENV PRODUCER_STORAGE=File
ENV PRODUCER_RETENTION_POLICY=Workqueue
ENV RETRY=2

# Set healthcheck command
HEALTHCHECK --interval=60s CMD [ -e /tmp/.lock ] || exit 1
EXPOSE 4222

# Execute watchdog command
CMD ["build/index.js"]
