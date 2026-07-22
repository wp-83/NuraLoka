import ConfirmProvider from '@components/Common/ConfirmProvider';
import Flash from '@components/Common/Flash';
import AdminFooter from '@components/Layouts/Admin/Footer';
import AdminHeader from '@components/Layouts/Admin/Header';
import AdminSidebar from '@components/Layouts/Admin/Sidebar';
import { FlashContext } from '@js/Contexts/FlashContext';
import { useTranslation } from '@js/i18n';

import { Head, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

export default function AdminLayout({
    pageTitle = '',
    content,
}) {
    const { flash } = usePage().props;
    const { t } = useTranslation();

    const [isCollapsed, setIsCollapsed] =
        useState(false);

    const [isMobileOpen, setIsMobileOpen] =
        useState(false);

    // Flash state mirrors MainLayout so an admin page can raise a client-side
    // notification through useFlash() exactly like a user-facing page. Admin
    // pages could previously only ever show a message that came back from the
    // server, which is why some client-side actions ended up silent.
    const [currentFlash, setCurrentFlash] = useState({
        type: flash?.type ?? null,
        message: flash?.message ?? null,
        id: flash?.type && flash?.message ? Date.now() : 0,
    });

    useEffect(() => {
        if (flash?.type && flash?.message) {
            setCurrentFlash({
                type: flash.type,
                message: flash.message,
                id: Date.now(),
            });
        }
    }, [flash?.type, flash?.message]);

    // The id forces Flash to remount, so its animation replays on every call.
    const showFlash = useCallback((type, message) => {
        setCurrentFlash({ type, message, id: Date.now() });
    }, []);

    const clearFlash = () => {
        setCurrentFlash({ type: null, message: null, id: 0 });

        if (flash) {
            flash.type = null;
            flash.message = null;
        }
    };

    const currentYear = new Date().getFullYear();

    // pageTitle may be a translation key or plain text — see the same note in
    // MainLayout.
    const resolvedTitle = pageTitle ? t(pageTitle) : '';

    const title =
        `NuraLoka Admin${
            resolvedTitle ? ` | ${resolvedTitle}` : ''
        }`;

    return (
        <>
            <Head>
                <title>{title}</title>
            </Head>

            <FlashContext.Provider value={showFlash}>
                <ConfirmProvider>
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

                    {currentFlash.type && currentFlash.message && (
                        <Flash
                            key={currentFlash.id}
                            type={currentFlash.type}
                            message={currentFlash.message}
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
                </ConfirmProvider>
            </FlashContext.Provider>
        </>
    );
}
