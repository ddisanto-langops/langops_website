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

/**
 * Strips characters that are prohibited in filenames across Windows/Unix
 * and by the Crowdin API: \ / : * ? " < > | and ASCII control characters.
 * Also collapses runs of whitespace and trims the result.
 */
function sanitizeFileName(name: string): string {
    return name
        .replace(/[\x00-\x1f\\/:|*?"<>]/g, '')  // strip prohibited chars
        .replace(/\s+/g, ' ')                      // collapse whitespace
        .trim();
}

export function FileUpload() {

    // === Project / language selection ===
    const [projects, setProjects] = useState<CrowdinProject[]>([]);
    const [langNameMap, setLangNameMap] = useState<Record<string, string>>({});
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
            .then(data => {
                const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
                setProjects(sorted);
                // Build a flat id→name map from all projects' target language lists
                const map: Record<string, string> = {};
                for (const proj of sorted) {
                    for (const lang of proj.targetLanguages) {
                        map[lang.id] = lang.name;
                    }
                }
                setLangNameMap(map);
            })
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
                    .map(async ([name, entry]) => {
                        const blob = await entry.async('blob');

                        // Parse XLIFF XML to extract the first few source segments as a tooltip
                        let summary: string | undefined;
                        try {
                            const text = await entry.async('text');
                            const doc = new DOMParser().parseFromString(text, 'application/xml');
                            const segments = Array.from(doc.querySelectorAll('source'))
                                .map(el => el.textContent?.trim())
                                .filter((s): s is string => !!s && s.length > 0)
                                .slice(0, 6)
                                .join('\n');
                            if (segments) summary = segments;
                        } catch {
                            // tooltip is best-effort; don't block the upload flow
                        }

                        return { originalName: name, displayName: name, content: blob, summary };
                    })
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
                const fileName = sanitizeFileName(
                    entry.displayName.endsWith('.xliff')
                        ? entry.displayName
                        : `${entry.displayName}.xliff`
                );
                const { crowdinFileId } = await uploadXliffToCrowdin(
                    fileName,
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
        <div className='idml-page'>

            {/* ── Project + language selectors ── */}
            <h3>IDML Upload & Reconstruction</h3>
            <p className='generic-notice'>
                On this page you can upload an IDML magazine file. It will be parsed and split into individual XLIFF files. <strong>You should rename these files,</strong> then click on "Upload to Crowdin and save." Note that the upload may take some time. <br></br><br></br><strong>When all article translations are fully approved</strong>, click on "Reconstruct" to parse the translated XLIFFs back into an IDML. This may take some time. <br></br><br></br> <strong>Never delete a file from the table below unless the reconstruction was successful.</strong>
            </p>
            <div className='idml-selectors'>
                <label className='idml-selector-label'>
                    Crowdin Project
                    <select
                        className='dashboard-dropdown'
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

                <label className='idml-selector-label'>
                    Target Language
                    <select
                        className='dashboard-dropdown'
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
            <label className='idml-file-label'>
                <strong>Upload IDML File</strong>
                <input type='file' accept='.idml' onChange={handleFileChange} />
            </label>

            {uploadStatus === 'parsing'   && <p className='idml-status-info'>Parsing IDML…</p>}
            {uploadStatus === 'uploading' && <p className='idml-status-info'>Uploading to Crowdin…</p>}
            {uploadStatus === 'done'      && <p className='idml-status-success'>Upload complete — record saved.</p>}
            {uploadStatus === 'error'     && <p className='idml-status-error'>{errorMsg}</p>}

            {/* ── XLIFF rename list ── */}
            {uploadStatus === 'ready' && xliffEntries.length > 0 && (
                <div className='idml-xliff-section'>
                    <h4>Extracted XLIFF Files</h4>
                    <p className='idml-hint'>Rename files before uploading.</p>
                    {xliffEntries.map((entry, i) => (
                        <div key={entry.originalName} className='idml-xliff-row'>
                            <span
                                className='idml-xliff-original'
                                title={entry.summary}
                            >
                                {entry.originalName}
                            </span>
                            <p>{entry.summary}</p>
                            <span>→</span>
                            <input
                                className='idml-xliff-input'
                                value={entry.displayName}
                                onChange={e => setXliffEntries(prev =>
                                    prev.map((item, idx) =>
                                        idx === i ? { ...item, displayName: sanitizeFileName(e.target.value) } : item
                                    )
                                )}
                            />
                        </div>
                    ))}
                    <button
                        className='idml-upload-btn'
                        onClick={handleCrowdinUpload}
                        disabled={!canUpload}
                    >
                        Upload to Crowdin &amp; Save
                    </button>
                    {(!selectedProject || !targetLanguage) && (
                        <span className='idml-hint'>Select a project and language above first.</span>
                    )}
                </div>
            )}

            {/* ── Storage records table ── */}
            <h4 className='idml-storage-title'>Stored Files</h4>
            {storageRecords.length === 0
                ? <p className='idml-empty'>No files stored yet.</p>
                : (
                    <table className='idml-table'>
                        <thead>
                            <tr>
                                <th>File</th>
                                <th>Project</th>
                                <th>Language</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {storageRecords.map(record => {
                                const isReconstructing = reconstructingIds.has(record.id);
                                const rowError = rowErrors[record.id];
                                return (
                                    <tr key={record.id}>
                                        <td>{record.fileName}</td>
                                        <td>{record.crowdinProjectName ?? '—'}</td>
                                        <td>{record.targetLanguage ? (langNameMap[record.targetLanguage] ?? record.targetLanguage) : '—'}</td>
                                        <td>
                                            {isReconstructing
                                                ? <span className='idml-status-reconstructing'>Reconstructing…</span>
                                                : record.status === 'complete'
                                                    ? <span className='idml-status-complete'>Complete</span>
                                                    : <span className='idml-status-pending'>Pending</span>
                                            }
                                            {rowError && <div className='idml-row-error'>{rowError}</div>}
                                        </td>
                                        <td>{new Date(record.createdAt).toLocaleDateString()}</td>
                                        <td className='idml-actions-cell'>
                                            {record.status === 'pending' && (
                                                <button
                                                    className='idml-btn-reconstruct'
                                                    onClick={() => handleReconstruct(record)}
                                                    disabled={isReconstructing}
                                                >
                                                    Reconstruct
                                                </button>
                                            )}
                                            {record.status === 'complete' && (
                                                <a
                                                    className='idml-btn-download'
                                                    href={`/api/idml/storage/${record.id}/download`}
                                                    download
                                                >
                                                    Download
                                                </a>
                                            )}
                                            <button
                                                className='idml-btn-delete'
                                                onClick={() => handleDelete(record)}
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
