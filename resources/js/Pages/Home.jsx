import '@css/Init.css';
import { Link } from '@inertiajs/react';
import NewsSection from '@js/Components/NewsSection';

export default function Home({ latestNews }){
    return (
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {/* Uji Coba Tombol */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <button className='btn-primary'>button label</button>
                <button className='btn-secondary'>button label</button>
                <button className='btn-error'>button label</button>
                <button className='btn-warning'>button label</button>
                <button className='btn-success'>button label</button>
                <button className='btn-info'>button label</button>
                <button className='btn-gray'>button label</button>
                <button className='btn-inactive'>button label</button>

                <Link href={route('logout')} method='POST' as="button" className='btn-primary'>
                    Logout
                </Link>
            </div>

            {/* Section Berita (Wawasan Wisata Hari Ini) */}
            <NewsSection latestNews={latestNews} />
        </div>
    );
};
