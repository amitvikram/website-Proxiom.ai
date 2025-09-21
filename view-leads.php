<?php
// Simple admin script to view leads from CSV
// In production, add proper authentication!

$csv_file = 'leads.csv';

if (!file_exists($csv_file)) {
    die('<h1>No leads found</h1><p>The CSV file does not exist yet. Submit a form first.</p>');
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sootro Leads - Admin View</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin: 0;
            padding: 20px;
            background: #f8f9fb;
            color: #1a202c;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        h1 {
            color: #1a202c;
            margin-bottom: 20px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            text-align: center;
        }
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #8ba4f5;
        }
        .stat-label {
            color: #4a5568;
            margin-top: 5px;
        }
        .leads-table {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
        }
        th {
            background: #f7fafc;
            font-weight: 600;
            color: #2d3748;
        }
        tr:hover {
            background: #f7fafc;
        }
        .email {
            color: #8ba4f5;
        }
        .company {
            font-weight: 500;
        }
        .timestamp {
            color: #4a5568;
            font-size: 12px;
        }
        .actions {
            margin-bottom: 20px;
        }
        .btn {
            background: #8ba4f5;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin-right: 10px;
        }
        .btn:hover {
            background: #667eea;
        }
        .pain-points {
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            table {
                font-size: 12px;
            }
            th, td {
                padding: 8px 4px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 Sootro Leads Dashboard</h1>

        <?php
        // Read and parse CSV
        $leads = [];
        if (($handle = fopen($csv_file, "r")) !== FALSE) {
            $headers = fgetcsv($handle);
            while (($data = fgetcsv($handle)) !== FALSE) {
                $leads[] = array_combine($headers, $data);
            }
            fclose($handle);
        }

        $total_leads = count($leads);
        $today_leads = 0;
        $this_week_leads = 0;
        $companies = [];
        $use_cases = [];

        foreach ($leads as $lead) {
            $timestamp = strtotime($lead['Timestamp']);
            $today = strtotime('today');
            $week_ago = strtotime('-1 week');

            if ($timestamp >= $today) {
                $today_leads++;
            }
            if ($timestamp >= $week_ago) {
                $this_week_leads++;
            }

            if (!empty($lead['Company'])) {
                $companies[] = $lead['Company'];
            }
            if (!empty($lead['Use Case'])) {
                $use_cases[] = $lead['Use Case'];
            }
        }

        $unique_companies = count(array_unique($companies));
        $top_use_case = array_count_values($use_cases);
        arsort($top_use_case);
        $most_common_use_case = $top_use_case ? array_key_first($top_use_case) : 'N/A';
        ?>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number"><?php echo $total_leads; ?></div>
                <div class="stat-label">Total Leads</div>
            </div>
            <div class="stat-card">
                <div class="stat-number"><?php echo $today_leads; ?></div>
                <div class="stat-label">Today</div>
            </div>
            <div class="stat-card">
                <div class="stat-number"><?php echo $this_week_leads; ?></div>
                <div class="stat-label">This Week</div>
            </div>
            <div class="stat-card">
                <div class="stat-number"><?php echo $unique_companies; ?></div>
                <div class="stat-label">Companies</div>
            </div>
        </div>

        <div class="actions">
            <a href="?download=csv" class="btn">📥 Download CSV</a>
            <a href="?refresh=1" class="btn">🔄 Refresh</a>
            <span style="color: #4a5568; margin-left: 20px;">
                Most common use case: <strong><?php echo htmlspecialchars($most_common_use_case); ?></strong>
            </span>
        </div>

        <?php
        // Handle CSV download
        if (isset($_GET['download']) && $_GET['download'] === 'csv') {
            header('Content-Type: text/csv');
            header('Content-Disposition: attachment; filename="sootro-leads-' . date('Y-m-d') . '.csv"');
            readfile($csv_file);
            exit;
        }
        ?>

        <div class="leads-table">
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Company</th>
                        <th>Job Title</th>
                        <th>Company Size</th>
                        <th>Use Case</th>
                        <th>Pain Points</th>
                        <th>Phone</th>
                        <th>Source</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach (array_reverse($leads) as $lead): ?>
                    <tr>
                        <td class="timestamp"><?php echo date('M j, Y H:i', strtotime($lead['Timestamp'])); ?></td>
                        <td><?php echo htmlspecialchars($lead['Full Name']); ?></td>
                        <td class="email"><?php echo htmlspecialchars($lead['Email']); ?></td>
                        <td class="company"><?php echo htmlspecialchars($lead['Company']); ?></td>
                        <td><?php echo htmlspecialchars($lead['Job Title']); ?></td>
                        <td><?php echo htmlspecialchars($lead['Company Size']); ?></td>
                        <td><?php echo htmlspecialchars($lead['Use Case']); ?></td>
                        <td class="pain-points" title="<?php echo htmlspecialchars($lead['Pain Points']); ?>">
                            <?php echo htmlspecialchars(substr($lead['Pain Points'], 0, 50)) . (strlen($lead['Pain Points']) > 50 ? '...' : ''); ?>
                        </td>
                        <td><?php echo htmlspecialchars($lead['Phone']); ?></td>
                        <td><?php echo htmlspecialchars($lead['Source']); ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

        <?php if (empty($leads)): ?>
            <div style="text-align: center; padding: 40px; color: #4a5568;">
                <h3>No leads yet</h3>
                <p>Submit the form on your website to see leads appear here.</p>
            </div>
        <?php endif; ?>

        <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; color: #856404;">
            <strong>⚠️ Security Notice:</strong> This admin page has no authentication. In production, add proper login protection!
        </div>
    </div>
</body>
</html>