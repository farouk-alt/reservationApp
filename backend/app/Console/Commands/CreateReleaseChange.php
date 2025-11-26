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

        $this->info("???? Creation Change Request pour release {$version}...");

        $releaseNotes = '';
        if ($notesFile = $this->option('notes')) {
            if (file_exists($notesFile)) {
                $releaseNotes = file_get_contents($notesFile);
            } else {
                $this->warn("??????  Fichier notes non trouve: {$notesFile}");
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
                $this->info('??? Change Request cree!');
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
                $this->error('??? Echec creation Change Request');
                return Command::FAILURE;
            }

        } catch (\Exception $e) {
            $this->error('??? Erreur: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
