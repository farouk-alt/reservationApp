# ========================================
# INSTALLATION SERVICENOW - ADAPTÉ À VOTRE PROJET
# ========================================

Write-Host "`n=== INSTALLATION SERVICENOW ===" -ForegroundColor Cyan
Write-Host "Ajout de ServiceNow dans votre structure existante`n" -ForegroundColor Yellow

# Vérifier que Docker est lancé
Write-Host "[1/6] Verification Docker..." -ForegroundColor Green
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker n'est pas lance. Lancez 'docker-compose up -d' d'abord." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker OK`n" -ForegroundColor Green

# Installer Guzzle
Write-Host "[2/6] Installation Guzzle HTTP Client..." -ForegroundColor Green
docker-compose exec -T backend composer require guzzlehttp/guzzle --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Guzzle installe`n" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur installation Guzzle" -ForegroundColor Red
    exit 1
}

# Créer dossier Commands si nécessaire
Write-Host "[3/6] Verification des dossiers..." -ForegroundColor Green
docker-compose exec -T backend mkdir -p app/Console/Commands 2>$null
Write-Host "✅ Dossiers verifies`n" -ForegroundColor Green

# Créer ServiceNowService.php dans le dossier Services EXISTANT
Write-Host "[4/6] Creation ServiceNowService.php..." -ForegroundColor Green
$serviceContent = @'
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
     * Créer un incident ServiceNow
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
                
                // Informations de version/build (TÂCHE 2 - TERMINÉE)
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
     * Créer une demande de service
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
     * Créer un Change Request pour release (TÂCHE 3 - RAPPORT DE RELEASE)
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
     * Mettre à jour un ticket
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
     * Récupérer un ticket
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
     * Générer rapport de release (TÂCHE 3)
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
        $description .= "Date de déploiement: " . ($releaseData['deployment_date'] ?? now()) . "\n";
        $description .= "Environnement: " . ($releaseData['environment'] ?? config('app.env')) . "\n\n";
        
        if (!empty($releaseData['features'])) {
            $description .= "=== NOUVELLES FONCTIONNALITÉS ===\n";
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
     * Récupérer la version de l'application
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
     * Récupérer le Build ID (commit hash)
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
'@

$serviceContent | docker-compose exec -T backend tee app/Services/ServiceNowService.php > $null
Write-Host "✅ ServiceNowService.php cree dans app/Services/`n" -ForegroundColor Green

# Créer config/servicenow.php
Write-Host "[5/6] Creation config/servicenow.php..." -ForegroundColor Green
$configContent = @'
<?php

return [
    'instance' => env('SERVICENOW_INSTANCE'),
    'username' => env('SERVICENOW_USERNAME'),
    'password' => env('SERVICENOW_PASSWORD'),
    
    'assignment_groups' => [
        'incident' => env('SERVICENOW_INCIDENT_GROUP', 'IT Support'),
        'request' => env('SERVICENOW_REQUEST_GROUP', 'Service Desk'),
        'change' => env('SERVICENOW_CHANGE_GROUP', 'Change Management'),
    ],
    
    'auto_create_incidents' => env('SERVICENOW_AUTO_CREATE_INCIDENTS', false),
    
    'enabled_environments' => explode(',', env('SERVICENOW_ENABLED_ENVS', 'production,staging')),
];
'@

$configContent | docker-compose exec -T backend tee config/servicenow.php > $null
Write-Host "✅ config/servicenow.php cree`n" -ForegroundColor Green

# Créer commande de test
Write-Host "[6/6] Creation commandes Artisan..." -ForegroundColor Green

# Commande 1: Test connexion
$testCommandContent = @'
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ServiceNowService;

class TestServiceNowConnection extends Command
{
    protected $signature = 'servicenow:test';
    protected $description = 'Test ServiceNow connection';

    public function handle(ServiceNowService $serviceNow): int
    {
        $this->info('🔍 Test connexion ServiceNow...');

        try {
            $incident = $serviceNow->createIncident([
                'short_description' => 'Test - Connexion Laravel',
                'description' => 'Test incident automatique depuis Laravel',
                'urgency' => 3,
                'impact' => 3,
            ]);

            if ($incident) {
                $this->info('✅ Connexion reussie!');
                $this->newLine();
                $this->table(
                    ['Champ', 'Valeur'],
                    [
                        ['Numero ticket', $incident['number'] ?? 'N/A'],
                        ['Sys ID', $incident['sys_id'] ?? 'N/A'],
                        ['State', $incident['state'] ?? 'N/A'],
                    ]
                );
                return Command::SUCCESS;
            } else {
                $this->error('❌ Echec creation incident');
                return Command::FAILURE;
            }

        } catch (\Exception $e) {
            $this->error('❌ Erreur connexion: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
'@

$testCommandContent | docker-compose exec -T backend tee app/Console/Commands/TestServiceNowConnection.php > $null

# Commande 2: Créer release
$releaseCommandContent = @'
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ServiceNowService;

class CreateReleaseChange extends Command
{
    protected $signature = 'servicenow:release 
                            {version : Version (ex: 1.2.0)}
                            {--title= : Titre de la release}
                            {--notes= : Chemin fichier release notes}
                            {--risk=Low : Niveau de risque (Low/Medium/High)}';
    
    protected $description = 'Creer un Change Request pour une release';

    public function handle(ServiceNowService $serviceNow): int
    {
        $version = $this->argument('version');
        $title = $this->option('title') ?? "Release {$version}";
        $risk = $this->option('risk');

        $this->info("📝 Creation Change Request pour release {$version}...");

        $releaseNotes = '';
        if ($notesFile = $this->option('notes')) {
            if (file_exists($notesFile)) {
                $releaseNotes = file_get_contents($notesFile);
            } else {
                $this->warn("⚠️  Fichier notes non trouve: {$notesFile}");
            }
        }

        try {
            $change = $serviceNow->generateReleaseReport([
                'version' => $version,
                'title' => $title,
                'risk' => $risk,
                'release_notes' => $releaseNotes,
            ]);

            if ($change) {
                $this->info('✅ Change Request cree!');
                $this->newLine();
                $this->table(
                    ['Champ', 'Valeur'],
                    [
                        ['Change Number', $change['number'] ?? 'N/A'],
                        ['Version', $version],
                        ['Risque', $risk],
                    ]
                );
                return Command::SUCCESS;
            } else {
                $this->error('❌ Echec creation Change Request');
                return Command::FAILURE;
            }

        } catch (\Exception $e) {
            $this->error('❌ Erreur: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
'@

$releaseCommandContent | docker-compose exec -T backend tee app/Console/Commands/CreateReleaseChange.php > $null

Write-Host "✅ Commandes Artisan creees`n" -ForegroundColor Green

# Ajouter configuration .env
Write-Host "[Bonus] Ajout configuration .env..." -ForegroundColor Green

$envConfig = @"

# ========================================
# SERVICENOW CONFIGURATION
# ========================================
SERVICENOW_INSTANCE=https://VOTRE-INSTANCE.service-now.com
SERVICENOW_USERNAME=votre_username
SERVICENOW_PASSWORD=votre_password

# Assignment Groups (optionnel)
SERVICENOW_INCIDENT_GROUP=IT Support
SERVICENOW_REQUEST_GROUP=Service Desk
SERVICENOW_CHANGE_GROUP=Change Management

# Auto-create incidents (true/false)
SERVICENOW_AUTO_CREATE_INCIDENTS=false

# Environnements actifs (séparés par virgule)
SERVICENOW_ENABLED_ENVS=production,staging

# Version application (pour les tickets)
APP_VERSION=1.0.0
BUILD_ID=

"@

Add-Content -Path "backend\.env" -Value $envConfig
Write-Host "✅ Configuration .env ajoutee`n" -ForegroundColor Green

# Résumé
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ INSTALLATION TERMINEE !" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "📂 FICHIERS CREES:" -ForegroundColor Yellow
Write-Host "   ✓ app/Services/ServiceNowService.php" -ForegroundColor Gray
Write-Host "   ✓ config/servicenow.php" -ForegroundColor Gray
Write-Host "   ✓ app/Console/Commands/TestServiceNowConnection.php" -ForegroundColor Gray
Write-Host "   ✓ app/Console/Commands/CreateReleaseChange.php`n" -ForegroundColor Gray

Write-Host "📋 PROCHAINES ETAPES:`n" -ForegroundColor Yellow

Write-Host "1️⃣  CONFIGURER LES CREDENTIALS:" -ForegroundColor White
Write-Host "   Editez backend\.env et remplacez:" -ForegroundColor Gray
Write-Host "   - SERVICENOW_INSTANCE (URL de votre instance)" -ForegroundColor Gray
Write-Host "   - SERVICENOW_USERNAME" -ForegroundColor Gray
Write-Host "   - SERVICENOW_PASSWORD`n" -ForegroundColor Gray

Write-Host "2️⃣  TESTER LA CONNEXION:" -ForegroundColor White
Write-Host "   docker-compose exec backend php artisan servicenow:test`n" -ForegroundColor Cyan

Write-Host "3️⃣  CREER UN RAPPORT DE RELEASE:" -ForegroundColor White
Write-Host "   docker-compose exec backend php artisan servicenow:release 1.0.0 --title='Version initiale'`n" -ForegroundColor Cyan

Write-Host "📚 UTILISATION DANS LE CODE:" -ForegroundColor Yellow
Write-Host @"
   use App\Services\ServiceNowService;
   
   public function exemple(ServiceNowService `$serviceNow) {
       `$ticket = `$serviceNow->createIncident([
           'short_description' => 'Erreur réservation',
           'description' => 'Détails...',
           'urgency' => 2
       ]);
   }
"@ -ForegroundColor Gray

Write-Host "`n✅ Taches ServiceNow:" -ForegroundColor Yellow
Write-Host "   ✓ Integration ServiceNow - TERMINEE" -ForegroundColor Green
Write-Host "   ✓ Ajouter Version/Build ID - TERMINEE" -ForegroundColor Green
Write-Host "   ⏳ Script d'automatisation - EN COURS" -ForegroundColor Cyan
Write-Host "   ⏳ Rapport de release - EN COURS`n" -ForegroundColor Cyan

Write-Host "Besoin d'aide ? Demandez-moi ! 🚀`n" -ForegroundColor Cyan
'@