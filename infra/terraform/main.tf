terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  backend "gcs" {
    bucket = "my-system-template-tf-state"
    prefix = "prod"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Cloud SQL Postgres Instance
resource "google_sql_database_instance" "main" {
  name             = "myapp-db"
  database_version = "POSTGRES_15"
  region           = var.region
  deletion_protection = false

  settings {
    tier              = "db-f1-micro"
    availability_type = "ZONAL"
    disk_type        = "PD_SSD"
    disk_size        = 10

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 7
    }

    ip_configuration {
      require_ssl                = true
      enable_private_path_access = false
      authorized_networks {
        name  = "allow-all"
        value = "0.0.0.0/0"
      }
    }
  }
}

resource "google_sql_database" "app_db" {
  name     = "myapp"
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "app_user" {
  name     = "appuser"
  instance = google_sql_database_instance.main.name
  password = random_password.db_password.result
}

resource "random_password" "db_password" {
  length  = 32
  special = true
}

# Service account for Cloud Run API
resource "google_service_account" "cloud_run" {
  account_id   = "cloud-run-api"
  display_name = "Cloud Run API Service Account"
}

# Cloud Run Service (placeholder - Agent 2 will populate this)
# resource "google_cloud_run_service" "api" {
#   name     = "myapp-api"
#   location = var.region
#   ...
# }
