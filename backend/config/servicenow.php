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
