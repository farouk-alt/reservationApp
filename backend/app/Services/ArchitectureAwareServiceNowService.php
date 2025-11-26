<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ArchitectureAwareServiceNowService
{
    private $instance;
    private $username;
    private $password;

    public function __construct()
    {
        $this->instance = config('servicenow.instance');
        $this->username = config('servicenow.username');
        $this->password = config('servicenow.password');
    }

    /**
     * Record deployment with architecture context
     */
    public function recordArchitectureDeployment(array $deploymentData)
    {
        $architectureInfo = [
            'frontend_technology' => 'React + Nginx',
            'backend_technology' => 'Laravel + PHP-FPM',
            'database_technology' => 'MySQL 8.0',
            'infrastructure_orchestration' => 'Kubernetes',
            'ci_cd_pipeline' => 'Jenkins + ArgoCD + SonarQube',
            'frontend_url' => 'reservation.local',
            'backend_url' => 'reservation.local/api',
            'nginx_service' => 'backend-nginx',
            'php_fpm_service' => 'backend'
        ];

        $data = [
            'u_application_name' => 'Reservation Management System',
            'u_version' => $deploymentData['version'] ?? '1.0.0',
            'u_environment' => $deploymentData['environment'] ?? 'production',
            'u_architecture' => json_encode($architectureInfo),
            'u_deployment_date' => now()->toISOString(),
            'u_deployed_by' => $deploymentData['deployed_by'] ?? 'jenkins',
            'u_ci_cd_tools' => 'Jenkins, SonarQube, ArgoCD',
            'u_container_platform' => 'Docker + Kubernetes',
            'u_infrastructure_as_code' => 'Terraform (MySQL)',
            'u_frontend_component' => 'React + Nginx',
            'u_backend_component' => 'Laravel + PHP-FPM',
            'u_database_component' => 'MySQL 8.0',
            'u_status' => $deploymentData['status'] ?? 'success'
        ];

        try {
            $response = Http::withBasicAuth($this->username, $this->password)
                ->post("https://{$this->instance}.service-now.com/api/now/table/u_devops_deployment", $data);

            Log::info('ServiceNow deployment recorded', [
                'architecture' => 'nginx-php-fpm-separate',
                'status' => $response->status(),
                'environment' => $deploymentData['environment'] ?? 'production'
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('ServiceNow deployment recording failed', [
                'architecture' => 'nginx-php-fpm-separate',
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Create CI for your specific architecture
     */
    public function createArchitectureConfigurationItem()
    {
        $ciData = [
            'name' => 'Reservation Management System',
            'short_description' => 'Nginx + PHP-FPM separated architecture',
            'u_architecture_type' => 'microservices',
            'u_frontend_technology' => 'React + Nginx',
            'u_backend_technology' => 'Laravel + PHP-FPM',
            'u_database_technology' => 'MySQL 8.0',
            'u_infrastructure' => 'Kubernetes + Terraform',
            'u_ci_cd_stack' => 'Jenkins + SonarQube + ArgoCD',
            'u_container_platform' => 'Docker',
            'u_web_server' => 'Nginx',
            'u_application_server' => 'PHP-FPM 8.2',
            'u_deployment_pattern' => 'blue-green',
            'u_monitoring_stack' => 'Prometheus + Grafana',
            'u_operational_status' => '1', // Operational
            'u_environment' => 'production'
        ];

        try {
            $response = Http::withBasicAuth($this->username, $this->password)
                ->post("https://{$this->instance}.service-now.com/api/now/table/cmdb_ci_appl", $ciData);

            if ($response->successful()) {
                Log::info('ServiceNow CI created for architecture', [
                    'architecture' => 'nginx-php-fpm-separate',
                    'ci_sys_id' => $response->json('result.sys_id')
                ]);
                return $response->json('result.sys_id');
            }

            return null;
        } catch (\Exception $e) {
            Log::error('ServiceNow CI creation failed', [
                'architecture' => 'nginx-php-fpm-separate',
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Record infrastructure changes from Terraform
     */
    public function recordTerraformChange(array $changeData)
    {
        $data = [
            'u_change_type' => 'infrastructure',
            'u_tool' => 'Terraform',
            'u_resource_type' => $changeData['resource_type'] ?? 'mysql_database',
            'u_action' => $changeData['action'] ?? 'apply',
            'u_environment' => $changeData['environment'] ?? 'production',
            'u_terraform_version' => $changeData['version'] ?? '1.5.0',
            'u_description' => $changeData['description'] ?? 'MySQL database change via Terraform'
        ];

        try {
            $response = Http::withBasicAuth($this->username, $this->password)
                ->post("https://{$this->instance}.service-now.com/api/now/table/change_request", $data);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('ServiceNow Terraform change recording failed', [
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}