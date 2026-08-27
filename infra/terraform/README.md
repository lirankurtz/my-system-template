# Terraform Infrastructure

This directory contains all GCP infrastructure as code for the application.

## Setup

1. **Initialize Terraform:**
   ```bash
   cd infra/terraform
   terraform init
   ```

2. **Create GCS bucket for state** (one-time):
   ```bash
   gsutil mb gs://my-system-template-tf-state
   ```

3. **Authenticate with GCP:**
   ```bash
   gcloud auth application-default login
   ```

4. **Plan the infrastructure:**
   ```bash
   terraform plan
   ```

5. **Apply the infrastructure:**
   ```bash
   terraform apply
   ```

## Outputs

After applying, Terraform will output:
- `database_connection_name`: Cloud SQL connection string
- `database_url`: Full Postgres connection URL (sensitive)
- `cloud_run_service_account_email`: Service account for Cloud Run

Copy these to your `.env` files:
```bash
# From terraform output:
DATABASE_URL=$(terraform output -raw database_url)

# Update ../api/.env
sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" ../apps/api/.env
```

## Service Account

The Terraform service account is already configured with the necessary permissions:
- Compute Admin
- Cloud SQL Admin
- Service Account User

## Resources Created

- **Cloud SQL Postgres 15** instance with automated backups
- **Service Account** for Cloud Run deployments
- **Database** and user for the application

## Next Steps (Agent 2 & 4)

After Terraform completes:
1. Agent 2 can connect the API to the database
2. Agent 4 can build the frontend

The infrastructure is ready for containerization and Cloud Run deployment.
