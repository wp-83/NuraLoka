import { FiMapPin, FiMail, FiPhone } from "react-icons/fi";
import { FaInstagram, FaYoutube, FaTiktok, FaXTwitter, FaFacebook} from "react-icons/fa6";
import { useTranslation } from "@js/i18n";

export default function Footer() {
    const { t } = useTranslation();
    const year = new Date().getFullYear();

    // CTA maskot dua warna: kata pertama .nura, sisanya .loka (dari footer.mascot_cta).
    const cta = t("footer.mascot_cta");
    const ctaSpace = cta.indexOf(" ");
    const ctaFirst = ctaSpace === -1 ? cta : cta.slice(0, ctaSpace + 1);
    const ctaRest = ctaSpace === -1 ? "" : cta.slice(ctaSpace + 1);

    return (
        <footer
            className="relative overflow-hidden"
            style={{
                backgroundImage: "url('/images/patterns/object.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="absolute inset-0 bg-white/90" />

            <div className="relative container mx-auto px-6 py-10">
                {/* Logo */}
                <div className="flex flex-col items-center text-center">
                    <img
                        src="/images/logo/with-tagline.png"
                        alt="NuraLoka"
                        className="h-24 object-contain"
                    />

                    <p className="mt-3 max-w-sm font-body text-body text-primary-100">
                        <span className="font-bold nuraloka-text">
                            <span className="nura">Nura</span><span className="loka">Loka</span>
                        </span>{" "}
                        {t("footer.tagline")}
                    </p>

                </div>

                {/* Content */}
                <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3">
                    {/* Contact */}
                    <div className="-mb-5 md:mb-0">
                        <h3 className="mb-1 font-heading text-paragraph font-bold text-primary">
                            {t("footer.contact_title")}
                        </h3>

                        <div className="space-y-2 font-body text-small text-primary-85">

                            <div className="flex items-center gap-3">
                                <FiMapPin
                                    className="text-primary"
                                    size={22}
                                />
                                <p className="text-small">
                                    {t("footer.address")}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <a href="mailto:nuraloka.team@gmail.com?subject=Pertanyaan%20tentang%20NuraLoka" target="_blank" className="text-primary flex gap-3">
                                    <FiMail
                                        size={22}
                                        className="text-primary"
                                    />

                                    <span className="text-small">
                                        nuraloka.team@gmail.com
                                    </span>
                                </a>
                            </div>


                            <div className="flex items-center gap-3">
                                <FiPhone
                                    size={22}
                                    className="text-primary"
                                />

                                <span className="text-small">345 333 55</span>
                            </div>
                        </div>
                    </div>

                    {/* Center */}
                    <div className="flex flex-col items-center justify-center">
                        <img
                            src="/images/mascots/car.png"
                            alt="Mascot"
                            className="w-32 object-contain"
                        />

                        <span className="font-heading text-small nuraloka-text -mt-4">
                            <span className="nura">{ctaFirst}</span>
                            <span className="loka">{ctaRest}</span>
                        </span>

                    </div>

                    {/* Social */}
                    <div>
                        <h3 className="mb-1 font-heading text-paragraph font-bold text-primary">
                            {t("footer.social_title")}
                        </h3>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-3 font-body text-small">
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                className="flex items-center gap-2 text-primary hover:text-secondary transition"
                            >
                                <FaInstagram size={20} />
                                <span>nuraloka.id</span>
                            </a>

                            <a
                                href="https://facebook.com"
                                target="_blank"
                                className="flex items-center gap-2 text-primary hover:text-secondary transition"
                            >
                                <FaFacebook size={20} />
                                <span>NuraLoka Indonesia</span>
                            </a>

                            <a
                                href="https://tiktok.com"
                                target="_blank"
                                className="flex items-center gap-2 text-primary hover:text-secondary transition"
                            >
                                <FaTiktok size={20} />
                                <span>nuraloka_id</span>
                            </a>

                            <a
                                href="https://youtube.com/"
                                target="_blank"
                                className="flex items-center gap-2 text-primary hover:text-secondary transition"
                            >
                                <FaYoutube size={20} />
                                <span>NuraLoka Indonesia</span>
                            </a>

                            <a
                                href="https://x.com/"
                                target="_blank"
                                className="flex items-center gap-2 text-primary hover:text-secondary transition"
                            >
                                <FaXTwitter size={20} />
                                <span>nuravers</span>
                            </a>

                        </div>

                    </div>

                </div>

                {/* Copyright */}
                <div className="pb-16 md:pb-0 pt-8 text-center">

                    <p className="font-body font-bold text-small text-primary-100">
                        © {year} {" "}
                        <span className="nuraloka-text">
                            <span className="nura">Nura</span>
                            <span className="loka">Loka</span>
                        </span>
                        . {t("footer.copyright")}
                    </p>

                </div>

            </div>
        </footer>
    );
}
