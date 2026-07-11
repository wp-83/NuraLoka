import { Link, router } from '@inertiajs/react';
import Button from '@components/Forms/Button';
import NewsSection from '@components/Features/NewsSection';
import MainLayout from '../Layouts/MainLayout';

export default function Home({ latestNews }){
    return (
        <div className="flex flex-col gap-8 p-4 sm:p-8">
            <section className="flex flex-col gap-4 rounded-2xl border border-primary-30 bg-white/80 p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold text-primary-100 sm:text-xl">Demo Tombol Responsif</h2>
                    <p className="text-sm text-gray-70">Tombol kini memakai komponen reusable dengan kelas Tailwind dan tetap mempertahankan desain sebelumnya.</p>
                </div>

                <Button
                    type="button"
                    variant="primary"
                    size="btn-md"
                    onClick={() => router.post(route('auth.logout'))}
                >
                    Logout
                </Button>
            </section>

            <NewsSection latestNews={latestNews} />
        </div>
    );
};

Home.layout = (page) => <MainLayout content={page}></MainLayout>
