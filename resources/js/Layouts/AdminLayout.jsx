import Flash from '@components/Common/Flash';
import AdminFooter from '@components/Layouts/Admin/Footer';
import AdminHeader from '@components/Layouts/Admin/Header';
import AdminSidebar from '@components/Layouts/Admin/Sidebar';

import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AdminLayout({
    pageTitle = '',
    content,
}) {
    const { flash } = usePage().props;

    const [isCollapsed, setIsCollapsed] =
        useState(false);

    const [isMobileOpen, setIsMobileOpen] =
        useState(false);

    const [, forceRender] = useState(0);

    /*
    |--------------------------------------------------------------------------
    | Clear Flash
    |--------------------------------------------------------------------------
    */

    const clearFlash = () => {
        flash.type = null;
        flash.message = null;

        forceRender(
            (previous) => previous + 1
        );
    };

    const currentYear =
        new Date().getFullYear();

    const title =
        `NuraLoka Admin${
            pageTitle ? ` | ${pageTitle}` : ''
        }`;

    return (
        <>
            <Head>
                <title>{title}</title>
            </Head>

            <AdminSidebar
                isCollapsed={isCollapsed}
                isMobileOpen={isMobileOpen}
                onToggleCollapsed={() =>
                    setIsCollapsed(
                        (previous) => !previous
                    )
                }
                onCloseMobile={() =>
                    setIsMobileOpen(false)
                }
            />

            {flash?.type && flash?.message && (
                <Flash
                    type={flash.type}
                    message={flash.message}
                    onClose={clearFlash}
                />
            )}

            <div
                className={`
                    flex min-h-screen flex-col
                    bg-gray-10
                    font-body
                    transition-all duration-300
                    ${
                        isCollapsed
                            ? 'md:ml-20'
                            : 'md:ml-64 lg:ml-72'
                    }
                `}
            >
                <AdminHeader
                    onOpenMobile={() =>
                        setIsMobileOpen(true)
                    }
                />

                <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
                    {content}
                </main>

                <AdminFooter
                    year={currentYear}
                />
            </div>
        </>
    );
}
