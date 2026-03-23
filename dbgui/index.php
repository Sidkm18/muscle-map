<?php

declare(strict_types=1);

require_once __DIR__ . '/../backend/src/bootstrap.php';

$db = mm_db();
$databaseName = getenv('DB_DATABASE') ?: 'muscle_map';

$tables = [];
$tableCounts = [];
$selectedTable = null;
$rows = [];
$columns = [];

$tableResult = $db->query('SHOW TABLES');
while ($tableName = $tableResult->fetchColumn()) {
    $tables[] = $tableName;
}

foreach ($tables as $tableName) {
    $countStmt = $db->query('SELECT COUNT(*) FROM `' . str_replace('`', '``', $tableName) . '`');
    $tableCounts[$tableName] = (int) $countStmt->fetchColumn();
}

$requestedTable = isset($_GET['table']) ? (string) $_GET['table'] : '';
if ($requestedTable !== '' && in_array($requestedTable, $tables, true)) {
    $selectedTable = $requestedTable;
} elseif (!empty($tables)) {
    $selectedTable = $tables[0];
}

if ($selectedTable !== null) {
    $safeTable = str_replace('`', '``', $selectedTable);
    $dataStmt = $db->query('SELECT * FROM `' . $safeTable . '` LIMIT 100');
    $rows = $dataStmt->fetchAll();
    $columns = !empty($rows) ? array_keys($rows[0]) : [];

    if (empty($columns)) {
        $columnStmt = $db->query('SHOW COLUMNS FROM `' . $safeTable . '`');
        while ($column = $columnStmt->fetch()) {
            $columns[] = $column['Field'];
        }
    }
}
?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MuscleMap DB Viewer</title>
    <style>
      :root {
        --bg: #091109;
        --panel: rgba(15, 22, 13, 0.9);
        --panel-strong: #10180f;
        --line: rgba(197, 255, 47, 0.2);
        --text: #edf1e4;
        --muted: #9ca690;
        --accent: #c5ff2f;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(197, 255, 47, 0.12), transparent 28%),
          radial-gradient(circle at bottom right, rgba(61, 220, 151, 0.1), transparent 22%),
          var(--bg);
      }

      .layout {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 280px minmax(0, 1fr);
      }

      .sidebar,
      .content {
        padding: 24px;
      }

      .sidebar {
        border-right: 1px solid var(--line);
        background: rgba(0, 0, 0, 0.18);
      }

      .brand {
        font-size: 1.4rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--accent);
        margin: 0 0 10px;
      }

      .meta {
        color: var(--muted);
        margin: 0 0 22px;
      }

      .table-list {
        display: grid;
        gap: 10px;
      }

      .table-link {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 14px;
        border: 1px solid var(--line);
        border-radius: 14px;
        color: inherit;
        text-decoration: none;
        background: var(--panel);
      }

      .table-link.active {
        border-color: rgba(197, 255, 47, 0.5);
        box-shadow: 0 0 0 1px rgba(197, 255, 47, 0.18);
      }

      .count {
        color: var(--accent);
        font-weight: 700;
      }

      .card {
        border: 1px solid var(--line);
        border-radius: 18px;
        background: var(--panel);
        overflow: hidden;
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 18px 20px;
        background: var(--panel-strong);
        border-bottom: 1px solid var(--line);
      }

      .card-title {
        margin: 0;
        font-size: 1.5rem;
      }

      .table-wrap {
        overflow: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        padding: 12px 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        text-align: left;
        vertical-align: top;
        font-size: 0.95rem;
      }

      th {
        position: sticky;
        top: 0;
        background: #11180f;
        color: var(--accent);
      }

      td {
        color: #dfe5d2;
        max-width: 280px;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .empty {
        padding: 28px 20px;
        color: var(--muted);
      }

      @media (max-width: 900px) {
        .layout {
          grid-template-columns: 1fr;
        }

        .sidebar {
          border-right: 0;
          border-bottom: 1px solid var(--line);
        }
      }
    </style>
  </head>
  <body>
    <div class="layout">
      <aside class="sidebar">
        <h1 class="brand">MuscleMap DB</h1>
        <p class="meta">Database: <?= htmlspecialchars($databaseName, ENT_QUOTES, 'UTF-8') ?><br>Host: 127.0.0.1:3307</p>

        <nav class="table-list">
          <?php foreach ($tables as $tableName): ?>
            <a
              class="table-link<?= $tableName === $selectedTable ? ' active' : '' ?>"
              href="?table=<?= urlencode($tableName) ?>"
            >
              <span><?= htmlspecialchars($tableName, ENT_QUOTES, 'UTF-8') ?></span>
              <span class="count"><?= $tableCounts[$tableName] ?? 0 ?></span>
            </a>
          <?php endforeach; ?>
        </nav>
      </aside>

      <main class="content">
        <section class="card">
          <div class="card-header">
            <div>
              <p class="meta" style="margin:0 0 6px;">Showing up to 100 rows</p>
              <h2 class="card-title"><?= htmlspecialchars((string) $selectedTable, ENT_QUOTES, 'UTF-8') ?></h2>
            </div>
            <div class="count"><?= $selectedTable !== null ? ($tableCounts[$selectedTable] ?? 0) : 0 ?> rows</div>
          </div>

          <?php if ($selectedTable === null): ?>
            <div class="empty">No tables found.</div>
          <?php elseif (empty($columns)): ?>
            <div class="empty">Table exists but has no columns to display.</div>
          <?php else: ?>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <?php foreach ($columns as $column): ?>
                      <th><?= htmlspecialchars((string) $column, ENT_QUOTES, 'UTF-8') ?></th>
                    <?php endforeach; ?>
                  </tr>
                </thead>
                <tbody>
                  <?php if (empty($rows)): ?>
                    <tr>
                      <td colspan="<?= count($columns) ?>">No rows in this table.</td>
                    </tr>
                  <?php else: ?>
                    <?php foreach ($rows as $row): ?>
                      <tr>
                        <?php foreach ($columns as $column): ?>
                          <td><?= htmlspecialchars((string) ($row[$column] ?? ''), ENT_QUOTES, 'UTF-8') ?></td>
                        <?php endforeach; ?>
                      </tr>
                    <?php endforeach; ?>
                  <?php endif; ?>
                </tbody>
              </table>
            </div>
          <?php endif; ?>
        </section>
      </main>
    </div>
  </body>
</html>
