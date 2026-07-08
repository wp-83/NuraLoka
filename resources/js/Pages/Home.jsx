import '@css/Init.css';
import { Link } from '@inertiajs/react';
import Button from '@components/Forms/Button';
import NewsSection from '@js/Components/NewsSection';

export default function Home({ latestNews }){
    return (
        <div className="flex flex-col gap-8 p-4 sm:p-8">
            <section className="flex flex-col gap-4 rounded-2xl border border-primary-30 bg-white/80 p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold text-primary-100 sm:text-xl">Demo Tombol Responsif</h2>
                    <p className="text-sm text-gray-70">Tombol kini memakai komponen reusable dengan kelas Tailwind dan tetap mempertahankan desain sebelumnya.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="primary" size="btn-md">Primary</Button>
                    <Button variant="secondary" size="btn-md">Secondary</Button>
                    <Button variant="error" size="btn-md">Error</Button>
                    <Button variant="warning" size="btn-md">Warning</Button>
                    <Button variant="success" size="btn-md">Success</Button>
                    <Button variant="info" size="btn-md">Info</Button>
                    <Button variant="gray" size="btn-md">Gray</Button>
                    <Button variant="white" size="btn-md">White</Button>
                    <Button variant="inactive" size="btn-md" disabled>Inactive</Button>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Button variant="primary" size="btn-lg" fullWidth className="sm:w-auto">Tombol Penuh di Mobile</Button>
                    <Button as={Link} href={route('logout')} method="POST" variant="secondary" size="btn-md" fullWidth className="w-full sm:w-auto">
                        Logout
                    </Button>
                </div>
            </section>

            <NewsSection latestNews={latestNews} />
        </div>
    );
};
