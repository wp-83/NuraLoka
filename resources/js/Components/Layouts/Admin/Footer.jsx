import { useTranslation } from '@js/i18n';

export default function AdminFooter({ year }) {
    const { t } = useTranslation();

    return (
        <footer className="shrink-0 bg-white px-4 py-2 text-center shadow-[0_-4px_6px_-1px_rgb(0_0_0/0.1),0_-2px_4px_-2px_rgb(0_0_0/0.1)]">
            <p className="text-body text-primary-100 font-body">©{year} <span className="nuraloka-text"><span className="nura">Nura</span><span className="loka">Loka</span></span>. {t('admin.footer.copyright')}</p>
        </footer>
    );
}
