#!/bin/bash
set -e

# Terraform Infrastructure Setup Script
# This script initializes GCS state bucket and sets up Terraform

PROJECT_ID="my-system-template"
STATE_BUCKET="my-system-template-tf-state"
REGION="us-central1"

echo "=========================================="
echo "Terraform Setup for $PROJECT_ID"
echo "=========================================="

# 1. Create GCS bucket for Terraform state
echo ""
echo "Step 1: Creating GCS bucket for Terraform state..."
if gsutil ls -b gs://$STATE_BUCKET &>/dev/null; then
  echo "✓ Bucket $STATE_BUCKET already exists"
else
  echo "Creating bucket $STATE_BUCKET..."
  gsutil mb -p $PROJECT_ID -l $REGION gs://$STATE_BUCKET
  echo "✓ Bucket created successfully"
fi

# 2. Initialize Terraform
echo ""
echo "Step 2: Initializing Terraform..."
terraform init
echo "✓ Terraform initialized"

# 3. Plan infrastructure
echo ""
echo "Step 3: Planning infrastructure..."
terraform plan -out=tfplan
echo "✓ Plan generated (saved to tfplan)"

# 4. Show plan summary
echo ""
echo "=========================================="
echo "Plan Summary"
echo "=========================================="
terraform show -no-color tfplan

echo ""
echo "Review the plan above. To apply, run:"
echo "  terraform apply tfplan"
echo ""
echo "After applying, outputs will be available via:"
echo "  terraform output -raw database_url"
