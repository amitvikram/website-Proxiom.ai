<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Get JSON input
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON data');
    }

    // Validate required fields
    $required_fields = ['fullName', 'email', 'company', 'jobTitle', 'companySize', 'useCase'];
    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }

    // Sanitize data
    $sanitized_data = [
        'timestamp' => date('Y-m-d H:i:s'),
        'fullName' => filter_var($data['fullName'], FILTER_SANITIZE_STRING),
        'email' => filter_var($data['email'], FILTER_SANITIZE_EMAIL),
        'company' => filter_var($data['company'], FILTER_SANITIZE_STRING),
        'jobTitle' => filter_var($data['jobTitle'], FILTER_SANITIZE_STRING),
        'companySize' => filter_var($data['companySize'], FILTER_SANITIZE_STRING),
        'useCase' => filter_var($data['useCase'], FILTER_SANITIZE_STRING),
        'painPoints' => isset($data['painPoints']) ? filter_var($data['painPoints'], FILTER_SANITIZE_STRING) : '',
        'phone' => isset($data['phone']) ? filter_var($data['phone'], FILTER_SANITIZE_STRING) : '',
        'source' => isset($data['source']) ? filter_var($data['source'], FILTER_SANITIZE_STRING) : '',
        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ];

    // Validate email format
    if (!filter_var($sanitized_data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }

    // CSV file path
    $csv_file = 'leads.csv';

    // Check if file exists, if not create with headers
    $file_exists = file_exists($csv_file);

    $file_handle = fopen($csv_file, 'a');
    if (!$file_handle) {
        throw new Exception('Unable to open CSV file for writing');
    }

    // Lock file for writing
    if (!flock($file_handle, LOCK_EX)) {
        fclose($file_handle);
        throw new Exception('Unable to lock CSV file');
    }

    // Write headers if file is new
    if (!$file_exists || filesize($csv_file) === 0) {
        $headers = [
            'Timestamp',
            'Full Name',
            'Email',
            'Company',
            'Job Title',
            'Company Size',
            'Use Case',
            'Pain Points',
            'Phone',
            'Source',
            'IP Address',
            'User Agent'
        ];
        fputcsv($file_handle, $headers);
    }

    // Write data to CSV
    $csv_row = [
        $sanitized_data['timestamp'],
        $sanitized_data['fullName'],
        $sanitized_data['email'],
        $sanitized_data['company'],
        $sanitized_data['jobTitle'],
        $sanitized_data['companySize'],
        $sanitized_data['useCase'],
        $sanitized_data['painPoints'],
        $sanitized_data['phone'],
        $sanitized_data['source'],
        $sanitized_data['ip_address'],
        $sanitized_data['user_agent']
    ];

    if (!fputcsv($file_handle, $csv_row)) {
        throw new Exception('Failed to write data to CSV');
    }

    // Release file lock and close
    flock($file_handle, LOCK_UN);
    fclose($file_handle);

    // Log successful submission (optional)
    error_log("New early access request: " . $sanitized_data['email'] . " from " . $sanitized_data['company']);

    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Form submitted successfully',
        'lead_id' => uniqid('lead_', true)
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
    error_log("Form submission error: " . $e->getMessage());
}
?>
