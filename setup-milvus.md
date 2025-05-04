# Setting Up Milvus for Your Project

Milvus is a vector database used for embedding storage and similarity search. There are two ways to use Milvus:

## Option 1: Use Zilliz Cloud (Managed Service)

1. Sign up for an account at [Zilliz Cloud](https://cloud.zilliz.com/)
2. Create a new instance (they offer a free tier with limitations)
3. Set your environment variables:

```
MILVUS_HOST=https://your-instance-id.api.gcp-us-west1.zillizcloud.com
MILVUS_TOKEN=your-api-key
```

Note: Zilliz Cloud requires usage-based pricing for production use, but they offer a free tier for development.

## Option 2: Run Milvus Locally with Docker

For development, you can run Milvus locally using Docker:

1. Make sure Docker and Docker Compose are installed on your system
2. Create a `docker-compose.yml` file with the following content:

```yaml
version: '3.5'

services:
  etcd:
    container_name: milvus-etcd
    image: quay.io/coreos/etcd:v3.5.0
    environment:
      - ETCD_AUTO_COMPACTION_MODE=revision
      - ETCD_AUTO_COMPACTION_RETENTION=1000
      - ETCD_QUOTA_BACKEND_BYTES=4294967296
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/etcd:/etcd
    command: etcd -advertise-client-urls=http://127.0.0.1:2379 -listen-client-urls http://0.0.0.0:2379 --data-dir /etcd

  minio:
    container_name: milvus-minio
    image: minio/minio:RELEASE.2020-12-03T00-03-10Z
    environment:
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/minio:/minio_data
    command: minio server /minio_data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  standalone:
    container_name: milvus-standalone
    image: milvusdb/milvus:v2.2.11
    command: ["milvus", "run", "standalone"]
    environment:
      ETCD_ENDPOINTS: etcd:2379
      MINIO_ADDRESS: minio:9000
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/milvus:/var/lib/milvus
    ports:
      - "19530:19530"
    depends_on:
      - "etcd"
      - "minio"

networks:
  default:
    name: milvus
```

3. Run Milvus using Docker Compose:

```bash
docker-compose up -d
```

4. Set your environment variables:

```
MILVUS_HOST=localhost
MILVUS_PORT=19530
```

## Development without Milvus

Our application is configured to work even without Milvus by using mock functions that simulate the Milvus functionality. This allows you to develop locally without needing to run Milvus.

Keep in mind that vector search capabilities will be limited in this mode, but the rest of the application will work normally.

## Troubleshooting

1. If you see errors related to the `address` property being missing, check that your environment variables are set correctly.
2. If you're using Zilliz Cloud and see authorization errors, verify your API key.
3. If you're running locally and can't connect, ensure the Milvus container is running: `docker ps | grep milvus` 