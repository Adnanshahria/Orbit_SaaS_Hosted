const API_BASE = import.meta.env.VITE_API_URL || '';

export async function uploadToImgBB(file: File): Promise<string> {
    // Convert file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the data:image/xxx;base64, prefix
            resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const token = localStorage.getItem('admin_token');

    const res = await fetch(`${API_BASE}/api/upload-image`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ image: base64 }),
    });

    if (!res.ok) throw new Error('Image upload failed');
    const data = await res.json();
    return data.url;
}
