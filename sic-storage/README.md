# SeaweedFS Local Dev

This folder contains a local SeaweedFS setup with an S3-compatible endpoint.

## Start

```powershell
docker compose up -d
```

## Endpoints

- Master UI: `http://localhost:9333`
- Filer HTTP endpoint: `http://localhost:8081`
- S3 endpoint: `http://localhost:8888`

## Default S3 Credentials

- Access Key: `seaweedfs`
- Secret Key: `seaweedfs-secret`

## Auto-created Buckets

When the stack starts, these buckets are created automatically:

- `uploads`
- `documents`
- `public-files`

## Manage Files With MinIO Client

Set an alias:

```powershell
mc alias set local http://localhost:8888 seaweedfs seaweedfs-secret
```

List buckets:

```powershell
mc ls local
```

Upload a file:

```powershell
mc cp .\test.txt local\uploads
```

List files in a bucket:

```powershell
mc ls local/uploads
```

Download a file:

```powershell
mc cp local/uploads/test.txt .\test.txt
```

Delete a file:

```powershell
mc rm local/uploads/test.txt
```

## Manage Files With AWS CLI

Create a bucket:

```powershell
aws --endpoint-url http://localhost:8888 s3 mb s3://uploads
```

Upload a file:

```powershell
aws --endpoint-url http://localhost:8888 s3 cp .\test.txt s3://uploads/test.txt
```

List files:

```powershell
aws --endpoint-url http://localhost:8888 s3 ls s3://uploads
```
