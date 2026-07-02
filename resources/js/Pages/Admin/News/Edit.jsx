import { Link, Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FaArrowLeft, FaUpload } from 'react-icons/fa';
import '@css/Init.css';
import '@css/Admin/News.css';

export default function Edit({ newsItem }) {
    // Helper to format datetime string for datetime-local input
    const formatDateTimeLocal = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        
        // Return string matching YYYY-MM-DDTHH:MM
        const pad = (num) => String(num).padStart(2, '0');
        const year = d.getFullYear();
        const month = pad(d.getMonth() + 1);
        const day = pad(d.getDate());
        const hours = pad(d.getHours());
        const minutes = pad(d.getMinutes());
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const [previewUrl, setPreviewUrl] = useState(newsItem.thumbnail || null);

    const { data, setData, post, processing, errors } = useForm({
        title: newsItem.title || '',
        content: newsItem.content || '',
        publish_date: formatDateTimeLocal(newsItem.publish_date),
        thumbnail: null, // Holds the newly selected file if uploaded
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setData('thumbnail', file);
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(newsItem.thumbnail || null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Post request to the update route (explicit POST route defined in web.php)
        post(route('admin.news.update', newsItem.id));
    };

    return (
        <>
            <Head>
                <title>Admin | Edit Wawasan Wisata</title>
            </Head>

            <div className="admin-form-container">
                {/* Back button */}
                <div className="back-navigation" style={{ marginBottom: '2rem' }}>
                    <Link href={route('admin.news.index')} className="back-to-home-link">
                        <FaArrowLeft className="mr-2" style={{ fontSize: '0.9rem' }} /> Kembali ke Dashboard
                    </Link>
                </div>

                <div className="admin-form-card">
                    <h2 className="admin-form-title">Edit Wawasan Wisata</h2>

                    <form onSubmit={handleSubmit} className="admin-crud-form">
                        {/* Title field */}
                        <div className="input-group">
                            <label htmlFor="title"><b>Judul Berita / Artikel</b></label>
                            <div className={`input-wrapper ${errors.title ? 'input-error' : ''}`}>
                                <input
                                    id="title"
                                    type="text"
                                    placeholder="Tulis judul artikel yang menarik..."
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    required
                                />
                            </div>
                            {errors.title && <span className="error-message">{errors.title}</span>}
                        </div>

                        {/* Publish Date field */}
                        <div className="input-group" style={{ marginTop: '1.5rem' }}>
                            <label htmlFor="publish_date"><b>Tanggal Publikasi</b></label>
                            <div className={`input-wrapper ${errors.publish_date ? 'input-error' : ''}`} style={{ paddingBlock: '0.5rem', paddingInline: '1rem' }}>
                                <input
                                    id="publish_date"
                                    type="datetime-local"
                                    value={data.publish_date}
                                    onChange={(e) => setData('publish_date', e.target.value)}
                                    required
                                    style={{ padding: '0', border: 'none' }}
                                />
                            </div>
                            {errors.publish_date && <span className="error-message">{errors.publish_date}</span>}
                        </div>

                        {/* Thumbnail Upload section */}
                        <div className="input-group" style={{ marginTop: '1.5rem' }}>
                            <label><b>Gambar Thumbnail</b></label>
                            <div className="thumbnail-upload-section">
                                <div className="thumbnail-preview-box">
                                    {previewUrl ? (
                                        <img 
                                            src={previewUrl} 
                                            alt="Thumbnail Preview" 
                                            onError={(e) => {
                                                e.target.src = '/images/defaults/image.png';
                                            }}
                                        />
                                    ) : (
                                        <div className="no-preview">Belum ada gambar</div>
                                    )}
                                </div>
                                <div className="file-input-wrapper">
                                    <div className={`select-wrapper ${errors.thumbnail ? 'input-error' : ''}`} style={{ padding: '0', display: 'flex', alignItems: 'center' }}>
                                        <label htmlFor="thumbnail-file" className="btn-white" style={{ border: 'none', margin: '0', borderRadius: '0', paddingBlock: '0.6rem', paddingInline: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-small)' }}>
                                            <FaUpload /> Pilih File Baru
                                        </label>
                                        <input
                                            id="thumbnail-file"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            style={{ display: 'none' }}
                                        />
                                        <span style={{ paddingInline: '1rem', fontSize: 'var(--text-small)', color: 'var(--gray-70)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {data.thumbnail ? data.thumbnail.name : 'Menggunakan gambar saat ini'}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: 'var(--text-micro)', color: 'var(--gray-50)', marginTop: '0.5rem' }}>
                                        Biarkan kosong jika tidak ingin mengganti gambar thumbnail. Maksimal file 2MB.
                                    </span>
                                </div>
                            </div>
                            {errors.thumbnail && <span className="error-message" style={{ marginTop: '0.5rem' }}>{errors.thumbnail}</span>}
                        </div>

                        {/* Content text area */}
                        <div className="input-group" style={{ marginTop: '1.5rem' }}>
                            <label htmlFor="content"><b>Konten / Isi Artikel</b></label>
                            <div className={`textarea-wrapper ${errors.content ? 'input-error' : ''}`}>
                                <textarea
                                    id="content"
                                    placeholder="Tulis seluruh isi artikel wawasan wisata di sini..."
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    required
                                ></textarea>
                            </div>
                            {errors.content && <span className="error-message">{errors.content}</span>}
                        </div>

                        {/* Actions */}
                        <div className="form-actions">
                            <Link 
                                href={route('admin.news.index')} 
                                className="btn-white btn-link-cancel"
                                disabled={processing}
                            >
                                Batal
                            </Link>
                            <button 
                                type="submit" 
                                className="btn-success"
                                disabled={processing}
                            >
                                {processing ? 'Memperbarui...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
