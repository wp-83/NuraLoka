import '@css/Layouts/SignUp.css';

import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from '@js/i18n';
import LanguageSwitcher from '@components/Common/LanguageSwitcher';

// titleKey: kunci terjemahan judul (diprioritaskan). title: fallback string statis.
export default function SignUp({ title, titleKey, content }) {
    const { t } = useTranslation();
    const pageTitle = titleKey ? t(titleKey) : title;
    const amountBgImage = 5;

    const [currIdx, setCurrIdx] = useState(0);
    const [fade, setFade] = useState(true);

    const bgIdentity = {
        name: [
            'Raja Ampat',
            'Tugu Khatulistiwa',
            'Garang Asem Ayam',
            'Mie Celor',
            'Proses Canting Batik Tulis',
        ],
        loc: [
            'Kabupaten Raja Ampat (Waisai), Papua Barat Daya',
            'Pontianak, Kalimantan Barat',
            'Semarang, Jawa Tengah',
            'Palembang, Sumatera Selatan',
            'Surakarta, Jawa Tengah',
        ],
        desc: [
            'Gugusan pulau karst dengan laut jernih, dikenal sebagai salah satu destinasi wisata bahari terbaik di dunia.',
            'Monumen penanda garis khatulistiwa (0° lintang) yang menjadi ikon kota dan objek wisata edukasi.',
            'Hidangan ayam berkuah asam segar dengan cabai dan belimbing wuluh, biasanya dimasak dalam bungkus daun pisang.',
            'Mie khas dengan kuah kental berbasis santan/udang, disajikan dengan telur, tauge, dan bawang goreng.',
            'Menorehkan malam (lilin panas) pada kain dengan canting untuk membentuk motif secara manual.',
        ],
    };

    useEffect(() => {
        const slider = setInterval(() => {
            setFade(false);

            setTimeout(() => {
                setFade(true);

                setCurrIdx((prev) =>
                    prev === amountBgImage - 1 ? 0 : prev + 1
                );
            }, 750);
        }, 5000);

        return () => clearInterval(slider);
    }, []);

    return (
        <>
            <Head title={`NuraLoka | ${pageTitle}`}>
                <meta
                    name="description"
                    content="Temukan rekomendasi tempat wisata, kuliner, dan lokasi persinggahan terbaik di sepanjang rute perjalanan antar kota di Indonesia bersama NuraLoka."
                />
            </Head>

            <section className="flex max-w-full overflow-hidden animate-swipe-from-right bg-gray-10">

                {/* LEFT */}

                <section className="relative h-screen w-1/2 overflow-hidden px-16 py-11 text-primary-85 max-md:absolute max-md:z-20 max-md:w-full max-md:px-16 max-sm:px-8">

                    <div className="top-left-decoration">
                        <div className="decoration-wrapper">
                            <div className="circle bg-primary-100"></div>
                            <div className="circle bg-primary-30"></div>
                            <div className="circle bg-primary-70"></div>
                        </div>
                    </div>

                    {/* Pemilih bahasa untuk pengunjung (tamu) */}
                    <div className="absolute left-6 top-6 z-30">
                        <LanguageSwitcher />
                    </div>

                    <div className="container relative h-full overflow-y-auto pb-28 hide-scrollbar animate-swipe-up">

                        <div className="mb-8 flex flex-col items-end">
                            <p className="font-body text-body">
                                <b>Hi, Nuravers!</b> Selamat datang di
                            </p>

                            <img
                                src="/images/logo/with-tagline.png"
                                alt="logo"
                                className="w-52"
                            />
                        </div>

                        <div>
                            {content}
                        </div>

                    </div>

                    <div className="bottom-right-decoration">
                        <div className="decoration-wrapper">
                            <div className="circle bg-primary-50"></div>
                            <div className="circle bg-primary-85"></div>
                        </div>
                    </div>

                </section>

                {/* RIGHT */}

                <section
                    className={`relative h-screen w-1/2 overflow-hidden transition-opacity duration-1000 ${
                        fade ? "opacity-100" : "opacity-0"
                    } max-md:w-full max-md:opacity-15`}
                >
                    <img
                        src={`/images/background-auth/register/${currIdx + 1}.jpg`}
                        alt="register-bg"
                        className="h-screen w-full object-cover opacity-85"
                    />

                    <div className="absolute left-6 top-6 flex w-[68%] flex-col gap-4 max-md:hidden">
                        <div>
                            <h2 className="font-heading text-title text-white [text-shadow:1px_1px_4px_rgba(0,0,0,0.7)]">
                                <b>{bgIdentity.name[currIdx]}</b>
                            </h2>

                            <p className="font-body text-body text-accent-10">
                                <i>{bgIdentity.loc[currIdx]}</i>
                            </p>
                        </div>

                        <p
                            className={`font-body text-paragraph ${
                                currIdx === 4
                                    ? "text-white"
                                    : "bg-additional-content"
                            }`}
                        >
                            {bgIdentity.desc[currIdx]}
                        </p>
                    </div>
                </section>
            </section>
        </>
    );
}
