import React, { useEffect, useState } from 'react';
import JSZip from 'jszip';
import {
    parseIdml,
    uploadXliffToCrowdin,
    fetchCrowdinProjects,
    listIdmlStorage,
    saveIdmlStorage,
    deleteIdmlStorage,
    triggerReconstruct
} from '../../services/api';
import type { CrowdinProject } from '../../../shared/types';
import type { XliffEntry, IdmlStorageRecord } from '../../../shared/types';

type UploadStatus = 'idle' | 'parsing' | 'ready' | 'uploading' | 'done' | 'error';

export function FileUpload() {

    // === Project / language selection ===
    const [projects, setProjects] = useState<CrowdinProject[]>([]);
    const [selectedProject, setSelectedProject] = useState<CrowdinProject | null>(null);
    const [targetLanguage, setTargetLanguage] = useState('');

    // === Upload flow ===
    const [idmlFile, setIdmlFile] = useState<File | null>(null);
    const [zipBlob, setZipBlob] = useState<Blob | null>(null);
    const [xliffEntries, setXliffEntries] = useState<XliffEntry[]>([]);
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // === Storage list ===
    const [storageRecords, setStorageRecords] = useState<IdmlStorageRecord[]>([]);
    const [reconstructingIds, setReconstructingIds] = useState<Set<number>>(new Set());
    const [rowErrors, setRowErrors] = useState<Record<number, string>>({});

    useEffect(() => {
        fetchCrowdinProjects()
            .then(setProjects)
            .catch(e => console.error('Could not load Crowdin projects:', e));
        refreshStorage();
    }, []);

    function refreshStorage() {
        listIdmlStorage()
            .then(setStorageRecords)
            .catch(e => console.error('Could not load storage records:', e));
    }

    // ── File selected → parse IDML ──────────────────────────────────────────
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        setIdmlFile(file);
        setUploadStatus('parsing');
        setErrorMsg(null);
        setXliffEntries([]);

        try {
            const zip = await parseIdml(file);
            setZipBlob(zip);

            const loaded = await JSZip.loadAsync(zip);
            const entries: XliffEntry[] = await Promise.all(
                Object.entries(loaded.files)
                    .filter(([name, entry]) => !entry.dir && name.endsWith('.xliff'))
                    .map(async ([name, entry]) => ({
                        originalName: name,
                        displayName: name,
                        content: await entry.async('blob'),
                    }))
            );

            setXliffEntries(entries);
            setUploadStatus('ready');
        } catch (e) {
            setErrorMsg(e instanceof Error ? e.message : 'Unknown error during parse');
            setUploadStatus('error');
        }
    };

    // ── Upload XLIFFs to Crowdin, then save record to DB ───────────────────
    const handleCrowdinUpload = async () => {
        if (!idmlFile || !zipBlob || !selectedProject || !targetLanguage) return;

        setUploadStatus('uploading');
        const crowdinFileIds: number[] = [];

        try {
            for (const entry of xliffEntries) {
                const { crowdinFileId } = await uploadXliffToCrowdin(
                    entry.displayName,
                    entry.content,
                    String(selectedProject.id)
                );
                crowdinFileIds.push(crowdinFileId);
            }

            await saveIdmlStorage(
                idmlFile,
                zipBlob,
                String(selectedProject.id),
                selectedProject.name,
                targetLanguage,
                crowdinFileIds
            );

            setUploadStatus('done');
            setXliffEntries([]);
            setIdmlFile(null);
            setZipBlob(null);
            refreshStorage();
        } catch (e) {
            setErrorMsg(e instanceof Error ? e.message : 'Upload failed');
            setUploadStatus('error');
        }
    };

    // ── Reconstruct a stored record ─────────────────────────────────────────
    const handleReconstruct = async (record: IdmlStorageRecord) => {
        setReconstructingIds(prev => new Set(prev).add(record.id));
        setRowErrors(prev => { const next = { ...prev }; delete next[record.id]; return next; });

        try {
            await triggerReconstruct(record.id);
            refreshStorage();
            if (confirm(`Reconstruction of "${record.fileName}" complete! Download now?`)) {
                window.location.href = `/api/idml/storage/${record.id}/download`;
            }
        } catch (e) {
            setRowErrors(prev => ({
                ...prev,
                [record.id]: e instanceof Error ? e.message : 'Reconstruction failed',
            }));
        } finally {
            setReconstructingIds(prev => {
                const next = new Set(prev);
                next.delete(record.id);
                return next;
            });
        }
    };

    // ── Delete a stored record ──────────────────────────────────────────────
    const handleDelete = async (record: IdmlStorageRecord) => {
        if (!confirm(`Delete "${record.fileName}" (${record.crowdinProjectName}, ${record.targetLanguage})? This cannot be undone.`)) return;
        try {
            await deleteIdmlStorage(record.id);
            refreshStorage();
        } catch (e) {
            alert(`Delete failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
    };

    const canUpload = selectedProject && targetLanguage && uploadStatus === 'ready' && xliffEntries.length > 0;

    return (
        <div style={{ padding: '1rem', maxWidth: 900 }}>

            {/* ── Project + language selectors ── */}
            <h3>IDML Upload & Reconstruction</h3>

            <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    Crowdin Project
                    <select
                        value={selectedProject?.id ?? ''}
                        onChange={e => {
                            const proj = projects.find(p => p.id === Number(e.target.value)) ?? null;
                            setSelectedProject(proj);
                            setTargetLanguage('');
                        }}
                    >
                        <option value=''>— select project —</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    Target Language
                    <select
                        value={targetLanguage}
                        onChange={e => setTargetLanguage(e.target.value)}
                        disabled={!selectedProject}
                    >
                        <option value=''>— select language —</option>
                        {selectedProject?.targetLanguages.map(l => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                    </select>
                </label>
            </div>

            {/* ── File input ── */}
            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 'fit-content' }}>
                    Upload IDML File
                    <input type='file' accept='.idml' onChange={handleFileChange} />
                </label>
            </div>

            {uploadStatus === 'parsing' && <p>Parsing IDML…</p>}
            {uploadStatus === 'uploading' && <p>Uploading to Crowdin…</p>}
            {uploadStatus === 'done' && <p style={{ color: 'green' }}>Upload complete — record saved.</p>}
            {uploadStatus === 'error' && <p style={{ color: 'red' }}>{errorMsg}</p>}

            {/* ── XLIFF rename list ── */}
            {uploadStatus === 'ready' && xliffEntries.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <h4>Extracted XLIFF Files</h4>
                    <p style={{ fontSize: '0.875rem', color: '#666' }}>
                        Rename files if needed before uploading.
                    </p>
                    {xliffEntries.map((entry, i) => (
                        <div key={entry.originalName} style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'center' }}>
                            <span style={{ color: '#888', fontSize: '0.875rem', minWidth: 220 }}>{entry.originalName}</span>
                            <span>→</span>
                            <input
                                value={entry.displayName}
                                style={{ width: 260 }}
                                onChange={e => setXliffEntries(prev =>
                                    prev.map((item, idx) =>
                                        idx === i ? { ...item, displayName: e.target.value } : item
                                    )
                                )}
                            />
                        </div>
                    ))}
                    <button
                        onClick={handleCrowdinUpload}
                        disabled={!canUpload}
                        style={{ marginTop: 8 }}
                    >
                        Upload to Crowdin &amp; Save
                    </button>
                    {!selectedProject || !targetLanguage
                        ? <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: 8 }}>
                            Select a project and language above first.
                          </span>
                        : null
                    }
                </div>
            )}

            {/* ── Storage records table ── */}
            <h4 style={{ marginTop: 32 }}>Stored Files</h4>
            {storageRecords.length === 0
                ? <p style={{ color: '#888' }}>No files stored yet.</p>
                : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
                                <th style={{ padding: '6px 8px' }}>File</th>
                                <th style={{ padding: '6px 8px' }}>Project</th>
                                <th style={{ padding: '6px 8px' }}>Language</th>
                                <th style={{ padding: '6px 8px' }}>Status</th>
                                <th style={{ padding: '6px 8px' }}>Created</th>
                                <th style={{ padding: '6px 8px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {storageRecords.map(record => {
                                const isReconstructing = reconstructingIds.has(record.id);
                                const rowError = rowErrors[record.id];
                                return (
                                    <tr key={record.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '6px 8px' }}>{record.fileName}</td>
                                        <td style={{ padding: '6px 8px' }}>{record.crowdinProjectName ?? '—'}</td>
                                        <td style={{ padding: '6px 8px' }}>{record.targetLanguage ?? '—'}</td>
                                        <td style={{ padding: '6px 8px' }}>
                                            {isReconstructing
                                                ? <span style={{ color: '#888' }}>Reconstructing…</span>
                                                : record.status === 'complete'
                                                    ? <span style={{ color: 'green' }}>Complete</span>
                                                    : <span style={{ color: '#b07000' }}>Pending</span>
                                            }
                                            {rowError && <div style={{ color: 'red', fontSize: '0.75rem' }}>{rowError}</div>}
                                        </td>
                                        <td style={{ padding: '6px 8px' }}>
                                            {new Date(record.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '6px 8px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            {record.status === 'pending' && (
                                                <button
                                                    onClick={() => handleReconstruct(record)}
                                                    disabled={isReconstructing}
                                                >
                                                    Reconstruct
                                                </button>
                                            )}
                                            {record.status === 'complete' && (
                                                <a
                                                    href={`/api/idml/storage/${record.id}/download`}
                                                    download
                                                >
                                                    <button>Download</button>
                                                </a>
                                            )}
                                            <button
                                                onClick={() => handleDelete(record)}
                                                style={{ color: 'red' }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )
            }
        </div>
    );
}
