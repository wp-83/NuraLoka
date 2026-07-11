import { useState } from "react";
import AdminSidebar from "@components/Layouts/Admin/Sidebar";
import AdminHeader from "@components/Layouts/Admin/Header";
import AdminFooter from "@components/Layouts/Admin/Footer";
import { Head } from "@inertiajs/react";

export default function AdminLayout({ pageTitle = '', content }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const currentYear = new Date().getFullYear();
    const title = `NuraLoka Admin${pageTitle ? ` | ${pageTitle}` : ''}`;

    return (
        <>
            <Head>
                <title>{title}</title>
            </Head>

            <div className="min-h-screen bg-gray-10 font-body">
                <AdminSidebar
                    isCollapsed={isCollapsed}
                    isMobileOpen={isMobileOpen}
                    onToggleCollapsed={() => setIsCollapsed((previous) => !previous)}
                    onCloseMobile={() => setIsMobileOpen(false)}
                />

                <div
                    className={`
                        flex min-h-screen flex-col
                        transition-all duration-300
                        ${isCollapsed ? "md:ml-20" : "md:ml-64 lg:ml-72"}
                    `}
                >
                    <AdminHeader onOpenMobile={() => setIsMobileOpen(true)} />

                    <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
                        {content}
                    </main>

                    <AdminFooter year={currentYear} />
                </div>
            </div>
        </>
    );
}
