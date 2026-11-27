export async function downloadFile(name: string, blob: Blob): Promise<void> {
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    const file = new File([blob], name, { type: blob.type });
    // On phones, offer the system share/save sheet when a normal download is not possible.
    const url = URL.createObjectURL(blob);
    try {
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();
    } catch {
        if (nav.canShare && nav.canShare({ files: [file] })) await navigator.share({ files: [file], title: name });
        else throw new Error('Browser menolak unduhan.');
    } finally {
        setTimeout(() => URL.revokeObjectURL(url), 60000);
    }
}
