<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;

class ServiceNowService
{
    private Client $client;
    private string $instance;
    private string $username;
    private string $password;

    public function __construct()
    {
        $this->instance = config('servicenow.instance');
        $this->username = config('servicenow.username');
        $this->password = config('servicenow.password');

        $this->client = new Client([
            'base_uri' => $this->instance,
            'auth' => [$this->username, $this->password],
            'headers' => [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
            'verify' => false,
        ]);
    }

    /**
     * Cr??er un incident ServiceNow
     */
    public function createIncident(array $data): ?array
    {
        try {
            $incident = [
                'short_description' => $data['short_description'],
                'description' => $data['description'] ?? '',
                'urgency' => $data['urgency'] ?? 3, // 1=High, 2=Medium, 3=Low
                'impact' => $data['impact'] ?? 3,
                'category' => $data['category'] ?? 'Software',
                'caller_id' => $data['caller_id'] ?? null,
                'assignment_group' => $data['assignment_group'] ?? null,
                
                // Informations de version/build (T??CHE 2 - TERMIN??E)
                'u_version' => $this->getAppVersion(),
                'u_build_id' => $this->getBuildId(),
                'u_environment' => config('app.env'),
                'u_deployed_at' => now()->toIso8601String(),
            ];

            $response = $this->client->post('/api/now/table/incident', [
                'json' => $incident
            ]);

            $result = json_decode($response->getBody()->getContents(), true);
            
            Log::info('ServiceNow incident created', [
                'sys_id' => $result['result']['sys_id'] ?? null,
                'number' => $result['result']['number'] ?? null,
            ]);

            return $result['result'] ?? null;

        } catch (GuzzleException $e) {
            Log::error('ServiceNow incident creation failed', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            return null;
        }
    }

    /**
     * Cr??er une demande de service
     */
    public function createServiceRequest(array $data): ?array
    {
        try {
            $request = [
                'short_description' => $data['short_description'],
                'description' => $data['description'] ?? '',
                'urgency' => $data['urgency'] ?? 3,
                'requested_for' => $data['requested_for'] ?? null,
                'assignment_group' => $data['assignment_group'] ?? null,
                
                // Informations contextuelles
                'u_version' => $this->getAppVersion(),
                'u_build_id' => $this->getBuildId(),
                'u_environment' => config('app.env'),
            ];

            $response = $this->client->post('/api/now/table/sc_request', [
                'json' => $request
            ]);

            $result = json_decode($response->getBody()->getContents(), true);
            
            Log::info('ServiceNow service request created', [
                'sys_id' => $result['result']['sys_id'] ?? null,
                'number' => $result['result']['number'] ?? null,
            ]);

            return $result['result'] ?? null;

        } catch (GuzzleException $e) {
            Log::error('ServiceNow request creation failed', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            return null;
        }
    }

    /**
     * Cr??er un Change Request pour release (T??CHE 3 - RAPPORT DE RELEASE)
     */
    public function createChangeRequest(array $data): ?array
    {
        try {
            $change = [
                'short_description' => $data['short_description'],
                'description' => $data['description'] ?? '',
                'type' => $data['type'] ?? 'Standard', // Standard, Normal, Emergency
                'risk' => $data['risk'] ?? 'Low', // Low, Medium, High
                'impact' => $data['impact'] ?? 3,
                'priority' => $data['priority'] ?? 4,
                'assignment_group' => $data['assignment_group'] ?? null,
                
                // Informations de release
                'u_version' => $data['version'] ?? $this->getAppVersion(),
                'u_build_id' => $data['build_id'] ?? $this->getBuildId(),
                'u_release_notes' => $data['release_notes'] ?? '',
                'u_deployment_date' => $data['deployment_date'] ?? now()->toIso8601String(),
                'u_environment' => $data['environment'] ?? config('app.env'),
            ];

            $response = $this->client->post('/api/now/table/change_request', [
                'json' => $change
            ]);

            $result = json_decode($response->getBody()->getContents(), true);
            
            Log::info('ServiceNow change request created', [
                'sys_id' => $result['result']['sys_id'] ?? null,
                'number' => $result['result']['number'] ?? null,
            ]);

            return $result['result'] ?? null;

        } catch (GuzzleException $e) {
            Log::error('ServiceNow change request creation failed', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            return null;
        }
    }

    /**
     * Mettre ?? jour un ticket
     */
    public function updateTicket(string $table, string $sysId, array $data): ?array
    {
        try {
            $response = $this->client->patch("/api/now/table/{$table}/{$sysId}", [
                'json' => $data
            ]);

            $result = json_decode($response->getBody()->getContents(), true);
            
            Log::info("ServiceNow {$table} updated", [
                'sys_id' => $sysId,
                'data' => $data
            ]);

            return $result['result'] ?? null;

        } catch (GuzzleException $e) {
            Log::error("ServiceNow {$table} update failed", [
                'sys_id' => $sysId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * R??cup??rer un ticket
     */
    public function getTicket(string $table, string $sysId): ?array
    {
        try {
            $response = $this->client->get("/api/now/table/{$table}/{$sysId}");
            $result = json_decode($response->getBody()->getContents(), true);
            
            return $result['result'] ?? null;

        } catch (GuzzleException $e) {
            Log::error("ServiceNow {$table} fetch failed", [
                'sys_id' => $sysId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * G??n??rer rapport de release (T??CHE 3)
     */
    public function generateReleaseReport(array $releaseData): ?array
    {
        $report = [
            'short_description' => "Release {$releaseData['version']} - {$releaseData['title']}",
            'description' => $this->formatReleaseDescription($releaseData),
            'type' => 'Standard',
            'risk' => $releaseData['risk'] ?? 'Low',
            'impact' => 3,
            'version' => $releaseData['version'],
            'build_id' => $releaseData['build_id'] ?? $this->getBuildId(),
            'release_notes' => $releaseData['release_notes'] ?? '',
            'deployment_date' => $releaseData['deployment_date'] ?? now()->toIso8601String(),
            'environment' => $releaseData['environment'] ?? config('app.env'),
        ];

        return $this->createChangeRequest($report);
    }

    /**
     * Formater la description de release
     */
    private function formatReleaseDescription(array $releaseData): string
    {
        $description = "=== RAPPORT DE RELEASE ===\n\n";
        $description .= "Version: {$releaseData['version']}\n";
        $description .= "Build ID: " . ($releaseData['build_id'] ?? $this->getBuildId()) . "\n";
        $description .= "Date de d??ploiement: " . ($releaseData['deployment_date'] ?? now()) . "\n";
        $description .= "Environnement: " . ($releaseData['environment'] ?? config('app.env')) . "\n\n";
        
        if (!empty($releaseData['features'])) {
            $description .= "=== NOUVELLES FONCTIONNALIT??S ===\n";
            foreach ($releaseData['features'] as $feature) {
                $description .= "- {$feature}\n";
            }
            $description .= "\n";
        }
        
        if (!empty($releaseData['bugfixes'])) {
            $description .= "=== CORRECTIONS DE BUGS ===\n";
            foreach ($releaseData['bugfixes'] as $bugfix) {
                $description .= "- {$bugfix}\n";
            }
            $description .= "\n";
        }
        
        if (!empty($releaseData['notes'])) {
            $description .= "=== NOTES ADDITIONNELLES ===\n";
            $description .= $releaseData['notes'] . "\n";
        }
        
        return $description;
    }

    /**
     * R??cup??rer la version de l'application
     */
    private function getAppVersion(): string
    {
        // Option 1: Depuis config
        if (config('app.version')) {
            return config('app.version');
        }

        // Option 2: Depuis fichier version.txt
        $versionFile = base_path('version.txt');
        if (file_exists($versionFile)) {
            return trim(file_get_contents($versionFile));
        }

        // Option 3: Depuis git tag
        try {
            $version = trim(shell_exec('git describe --tags --abbrev=0 2>/dev/null') ?? '');
            if ($version) {
                return $version;
            }
        } catch (\Exception $e) {
            // Ignore
        }

        return 'unknown';
    }

    /**
     * R??cup??rer le Build ID (commit hash)
     */
    private function getBuildId(): string
    {
        // Option 1: Depuis variable d'environnement
        if ($buildId = env('BUILD_ID')) {
            return $buildId;
        }

        // Option 2: Depuis git commit
        try {
            $commit = trim(shell_exec('git rev-parse --short HEAD 2>/dev/null') ?? '');
            if ($commit) {
                return $commit;
            }
        } catch (\Exception $e) {
            // Ignore
        }

        // Option 3: Depuis fichier build.txt
        $buildFile = base_path('build.txt');
        if (file_exists($buildFile)) {
            return trim(file_get_contents($buildFile));
        }

        return 'unknown';
    }
}
