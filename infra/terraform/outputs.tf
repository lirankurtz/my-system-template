output "database_host" {
  description = "Cloud SQL database host"
  value       = google_sql_database_instance.main.public_ip_address
}

output "database_connection_name" {
  description = "Cloud SQL connection name (project:region:instance)"
  value       = google_sql_database_instance.main.connection_name
}

output "database_url" {
  description = "Postgres connection string"
  value       = "postgresql://${google_sql_user.app_user.name}:${random_password.db_password.result}@${google_sql_database_instance.main.public_ip_address}:5432/${google_sql_database.app_db.name}"
  sensitive   = true
}

output "database_user" {
  description = "Database user"
  value       = google_sql_user.app_user.name
}

output "database_password" {
  description = "Database password"
  value       = random_password.db_password.result
  sensitive   = true
}

output "database_name" {
  description = "Database name"
  value       = google_sql_database.app_db.name
}

# TODO: Create service account in Phase 2 (requires elevated IAM permissions)
# output "cloud_run_service_account_email" {
#   description = "Service account email for Cloud Run"
#   value       = google_service_account.cloud_run.email
# }
