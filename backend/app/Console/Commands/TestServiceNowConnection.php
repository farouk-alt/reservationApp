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
        $this->info('???? Test connexion ServiceNow...');

        try {
            $incident = $serviceNow->createIncident([
                'short_description' => 'Test - Connexion Laravel',
                'description' => 'Test incident automatique depuis Laravel',
                'urgency' => 3,
                'impact' => 3,
            ]);

            if ($incident) {
                $this->info('??? Connexion reussie!');
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
                $this->error('??? Echec creation incident');
                return Command::FAILURE;
            }

        } catch (\Exception $e) {
            $this->error('??? Erreur connexion: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
