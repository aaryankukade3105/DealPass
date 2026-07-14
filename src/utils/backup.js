export function downloadBackup(account, deals) {
  const backup = {
    version: 1,
    app: "DealPass",
    exported_at: new Date().toISOString(),
    account,
    deals,
  };

  const json = JSON.stringify(backup, null, 2);

  const blob = new Blob([json], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  const today = new Date().toISOString().split("T")[0];

  link.href = url;
  link.download = `DealPass_Backup_${today}.dealpass`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}