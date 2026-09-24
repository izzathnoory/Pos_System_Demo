import React from 'react';
import { useSystemStore } from '../context/SystemStoreContext';
import { Button } from '../components/common/Button';
import { HardDrive, Download } from 'lucide-react';

export const BackupSecurityPage: React.FC = () => {
  const { backupLogs, createManualBackup } = useSystemStore();

  const handleDownloadBackup = (filename: string) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify({ backupFile: filename, timestamp: new Date().toISOString(), status: 'valid' })
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-bold text-slate-800 text-base sm:text-lg">Database Backup & Security Audit</h2>
          <p className="text-xs text-slate-500">System backup archives, export data dumps & security logs</p>
        </div>

        <Button
          variant="primary"
          icon={<HardDrive className="w-4 h-4" />}
          onClick={createManualBackup}
          className="w-full sm:w-auto"
        >
          Create Manual Backup
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 font-bold text-slate-800 text-sm">
          Backup History Log ({backupLogs.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Backup Filename</th>
                <th className="p-4">Type</th>
                <th className="p-4">File Size</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {backupLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-4 text-slate-500">{log.timestamp}</td>
                  <td className="p-4 font-mono font-bold text-slate-800">{log.filename}</td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold text-[11px]">
                      {log.type}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{log.size}</td>
                  <td className="p-4">
                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-semibold text-[11px]">
                      {log.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDownloadBackup(log.filename)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Download Backup JSON"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
