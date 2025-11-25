<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;

class DatabaseMetricsService extends ServiceProvider
{
    public function boot(): void
    {
        DB::listen(function ($query) {
            $prometheus = app(PrometheusService::class);
            
            // Count database queries
            $prometheus->incrementDatabaseQuery(
                $this->getTableFromSql($query->sql),
                $this->getOperationType($query->sql)
            );
            
            // Track query duration
            $prometheus->observeDatabaseQueryDuration(
                $this->getTableFromSql($query->sql),
                $query->time / 1000 // Convert ms to seconds
            );
        });
    }
    
    private function getTableFromSql(string $sql): string
    {
        // Extract table name from SQL
        if (preg_match('/(?:from|into|update|join)\s+[`"]?(\w+)[`"]?/i', $sql, $matches)) {
            return $matches[1];
        }
        return 'unknown';
    }
    
    private function getOperationType(string $sql): string
    {
        $sql = strtolower(trim($sql));
        if (str_starts_with($sql, 'select')) return 'select';
        if (str_starts_with($sql, 'insert')) return 'insert';
        if (str_starts_with($sql, 'update')) return 'update';
        if (str_starts_with($sql, 'delete')) return 'delete';
        return 'other';
    }
}