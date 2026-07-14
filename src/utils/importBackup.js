export function importBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const backup = JSON.parse(reader.result);

        if (backup.app !== "DealPass") {
          throw new Error("This is not a DealPass backup.");
        }

        if (!Array.isArray(backup.deals)) {
          throw new Error("Invalid backup file.");
        }

        resolve(backup);

      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = reject;

    reader.readAsText(file);
  });
}