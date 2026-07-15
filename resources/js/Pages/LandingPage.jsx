import { useEffect, useRef } from "react";
import Button from "@components/Forms/Button";
import Footer from "@components/Layouts/User/Footer";
import { Head, Link, usePage } from "@inertiajs/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const FEATURES = [
    {
        image: "/images/mascots/route.png",
        title: "Rute yang Personal",
        description:
            "Setiap rekomendasi disesuaikan dengan minat, gaya perjalanan, dan tujuanmu.",
    },
    {
        image: "/images/mascots/car.png",
        title: "Hidden Gems & UMKM Lokal",
        description:
            "Temukan tempat tersembunyi, kuliner khas, dan UMKM lokal yang jarang terekspos.",
    },
    {
        image: "/images/mascots/explore.png",
        title: "Jelajah Lebih Seru",
        description:
            "Selesaikan misi, kumpulkan lencana, dan jadikan perjalanan lebih menyenangkan.",
    },
    {
        image: "/images/mascots/route.png",
        title: "Destinasi Pilihan",
        description:
            "Temukan berbagai destinasi menarik yang sesuai dengan preferensi perjalananmu.",
    },
    {
        image: "/images/mascots/car.png",
        title: "Dukung Lokal",
        description:
            "Kenali berbagai usaha dan produk lokal yang menjadi bagian dari perjalananmu.",
    },
    {
        image: "/images/mascots/explore.png",
        title: "Pengalaman Berkesan",
        description:
            "Ciptakan pengalaman perjalanan yang lebih personal dan penuh cerita.",
    },
];

const TEAM_MEMBERS = [
    {
        name: "Felicia Wijaya",
        role: "Product Owner",
        image: "/images/devs/felicia.png",
    },
    {
        name: "William Pratama",
        role: "Scrum Master",
        image: "/images/devs/william.png",
    },
    {
        name: "Agnes G. F. Sukma",
        role: "Developer",
        image: "/images/devs/agnes.png",
    },
    {
        name: "Andi Zulfikar",
        role: "Developer",
        image: "/images/devs/andi.png",
    },
    {
        name: "Steven J. Wiyanto",
        role: "Developer",
        image: "/images/devs/steven.png",
    },
];

export default function LandingPage() {
    const { auth } = usePage().props;

    const sliderRef = useRef(null);
    const autoScrollRef = useRef(null);

    // Duplikasi 3x untuk infinite loop
    const infiniteFeatures = [
        ...FEATURES,
        ...FEATURES,
        ...FEATURES,
    ];

    const getSetWidth = () => {
        const slider = sliderRef.current;

        if (!slider) return 0;

        return slider.scrollWidth / 3;
    };

    const scrollSlider = (direction) => {
        const slider = sliderRef.current;

        if (!slider) return;

        const card = slider.firstElementChild;

        if (!card) return;

        const gap = 24;
        const scrollAmount = card.offsetWidth + gap;

        slider.scrollBy({
            left:
                direction === "next"
                    ? scrollAmount
                    : -scrollAmount,
            behavior: "smooth",
        });
    };

    useEffect(() => {
        const slider = sliderRef.current;

        if (!slider) return;

        // Mulai dari set kedua
        requestAnimationFrame(() => {
            const setWidth = getSetWidth();

            slider.scrollLeft = setWidth;
        });

        // Infinite loop
        const handleScroll = () => {
            const setWidth = getSetWidth();

            if (!setWidth) return;

            // Sudah masuk terlalu jauh ke set ketiga
            if (slider.scrollLeft >= setWidth * 2) {
                slider.scrollLeft -= setWidth;
            }

            // Sudah masuk ke set pertama
            if (slider.scrollLeft <= 0) {
                slider.scrollLeft += setWidth;
            }
        };

        slider.addEventListener("scroll", handleScroll);

        // Auto scroll
        autoScrollRef.current = setInterval(() => {
            scrollSlider("next");
        }, 3000);

        return () => {
            slider.removeEventListener("scroll", handleScroll);

            clearInterval(autoScrollRef.current);
        };
    }, []);

    return (
        <>
            <Head>
                <title>NuraLoka | Temukan destinasi wisata, kuliner, dan pengalaman perjalanan terbaik di Indonesia.</title>

                <meta
                    name="keywords"
                    content="wisata, destinasi, kuliner, perjalanan, Indonesia, tempat menarik, hidden gem, NuraLoka"
                />

                <meta
                    property="og:title"
                    content="NuraLoka: Temukan destinasi wisata, kuliner, dan pengalaman perjalanan terbaik di Indonesia."
                />

                <meta
                    property="og:description"
                    content="NuraLoka membantu kamu menemukan destinasi wisata, kuliner, dan pengalaman perjalanan terbaik di Indonesia."
                />

                <meta
                    property="og:type"
                    content="website"
                />
            </Head>

            {/* ==================== NAVBAR ==================== */}
            <header className="fixed left-0 top-0 z-50 w-full bg-white shadow-md">
                <div className="container flex h-16 items-center justify-between">
                    <Link href="/">
                        <img
                            src="/images/logo/with-tagline.png"
                            alt="NuraLoka"
                            className="h-14 w-auto object-contain"
                        />
                    </Link>

                    {auth.user ? (
                        <Link href={route("home.index")}>
                            <Button>Masuk ke Beranda</Button>
                        </Link>
                    ) : (
                        <Link href={route("auth.login.index")}>
                            <Button>Mulai Perjalananmu!</Button>
                        </Link>
                    )}
                </div>
            </header>

            <main>
                {/* ==================== HERO ==================== */}
                <section
                    className="
                        relative
                        flex items-center
                        overflow-hidden
                        bg-cover bg-center
                        pt-16
                        min-h-[110vh]
                    "
                    style={{
                        backgroundImage:
                            "url('/images/backgrounds/landing-page.jpg')",
                    }}
                >
                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-black/35" />

                    {/* Bottom Gradient */}
                    <div
                        className="
                            pointer-events-none
                            absolute inset-x-0 bottom-0
                            h-40
                            bg-gradient-to-b
                            from-transparent
                            to-white
                        "
                    />

                    {/* Content */}
                    <div className="container relative z-10">
                        <div className="mx-auto max-w-4xl">
                            {/* Mascot + Heading */}
                            <div className="flex items-center gap-4 md:gap-6">
                                <img
                                    src="/images/mascots/hero.png"
                                    alt="Maskot NuraLoka"
                                    className="
                                        w-24 shrink-0
                                        object-contain
                                        sm:w-28
                                        md:w-36
                                    "
                                />

                                <div>
                                    <h1
                                        className="
                                            font-heading
                                            text-3xl font-bold
                                            leading-tight
                                            text-white
                                            sm:text-4xl
                                            md:text-5xl
                                        "
                                    >
                                        Selamat Datang
                                    </h1>

                                    <p
                                        className="
                                            mt-2
                                            font-heading
                                            text-xl
                                            text-white
                                            sm:text-2xl
                                            md:text-3xl
                                        "
                                    >
                                        di{" "}
                                        <span className="bg-white px-1">
                                            <span className="text-secondary">
                                                Nura
                                            </span>
                                            <span className="text-primary">
                                                Loka
                                            </span>
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Description + CTA */}
                            <div
                                className="
                                    mt-14
                                    max-w-2xl
                                    md:ml-[calc(9rem+1.5rem)]
                                    md:mt-16
                                "
                            >
                                <p
                                    className="
                                        font-body
                                        text-small
                                        leading-relaxed
                                        text-white
                                        sm:text-body
                                    "
                                >
                                    Bersama{" "}
                                    <span className="bg-white px-1 font-bold">
                                        <span className="text-secondary">
                                            Nura
                                        </span>
                                        <span className="text-primary">
                                            Loka
                                        </span>
                                    </span>{" "}
                                    temukan{" "}
                                    <strong>
                                        destinasi yang sesuai dengan gayamu
                                    </strong>
                                    , susun{" "}
                                    <strong>
                                        rute perjalanan tanpa ribet
                                    </strong>
                                    , dan jelajahi{" "}
                                    <strong className="bg-white px-1 text-primary">
                                        keindahan Indonesia yang penuh cerita.
                                    </strong>
                                </p>

                                <div className="mt-6">
                                    <Link
                                        href={
                                            auth.user
                                                ? route("home.index")
                                                : route("auth.login.index")
                                        }
                                    >
                                        <Button>
                                            Cobain NuraLoka Sekarang!
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ==================== ABOUT ==================== */}
                <section className="container py-16 md:py-24">
                    {/* Header */}
                    <div className="max-w-2xl">
                        <h2
                            className="
                                font-heading
                                text-2xl font-bold
                                leading-tight
                                text-primary
                                md:text-3xl
                            "
                        >
                            Perjalanan Lebih dari
                            <br />
                            Sekadar Tujuan.
                        </h2>

                        <p
                            className="
                                mt-5
                                font-body
                                text-small
                                leading-relaxed
                                text-gray-70
                            "
                        >
                            Kami percaya setiap perjalanan adalah kesempatan
                            untuk menemukan tempat baru, mengenal cerita lokal,
                            dan menciptakan pengalaman yang berkesan. Itulah
                            mengapa{" "}
                            <span className="font-bold">
                                <span className="text-secondary">
                                    Nura
                                </span>
                                <span className="text-primary">
                                    Loka
                                </span>
                            </span>{" "}
                            hadir untuk menemani setiap langkahmu menjelajahi
                            Nusantara.
                        </p>
                    </div>

                    {/* Slider Header */}
                    <div className="mt-10 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => scrollSlider("prev")}
                            aria-label="Kartu sebelumnya"
                            className="
                                flex h-10 w-10
                                items-center justify-center
                                rounded-full
                                border border-primary-20
                                bg-white
                                text-primary
                                transition-all
                                hover:bg-primary-10
                                active:scale-95
                            "
                        >
                            <FiChevronLeft size={22} />
                        </button>

                        <button
                            type="button"
                            onClick={() => scrollSlider("next")}
                            aria-label="Kartu selanjutnya"
                            className="
                                flex h-10 w-10
                                items-center justify-center
                                rounded-full
                                border border-primary-20
                                bg-white
                                text-primary
                                transition-all
                                hover:bg-primary-10
                                active:scale-95
                            "
                        >
                            <FiChevronRight size={22} />
                        </button>
                    </div>

                    {/* Infinite Slider */}
                    <div
                        ref={sliderRef}
                        className="
                            mt-4
                            flex
                            snap-x snap-mandatory
                            gap-6
                            overflow-x-auto
                            scroll-smooth
                            pb-4

                            [scrollbar-width:none]
                            [&::-webkit-scrollbar]:hidden
                        "
                    >
                        {infiniteFeatures.map((feature, index) => (
                            <article
                                key={`${feature.title}-${index}`}
                                className="
                                    group
                                    min-w-[85%]
                                    snap-start
                                    rounded-2xl
                                    bg-primary-10
                                    p-6
                                    transition-all
                                    duration-300

                                    sm:min-w-[calc(50%-12px)]
                                    lg:min-w-[calc(33.333%-16px)]

                                    hover:-translate-y-1
                                    hover:shadow-lg
                                "
                            >
                                <img
                                    src={feature.image}
                                    alt={feature.title}
                                    className="
                                        h-24 w-24
                                        object-contain
                                        transition-transform
                                        duration-300
                                        group-hover:scale-105
                                    "
                                />

                                <h3
                                    className="
                                        mt-4
                                        font-heading
                                        text-body
                                        font-bold
                                        text-primary
                                    "
                                >
                                    {feature.title}
                                </h3>

                                <p
                                    className="
                                        mt-2
                                        font-body
                                        text-small
                                        leading-relaxed
                                        text-secondary
                                    "
                                >
                                    {feature.description}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>

                {/* ==================== TEAM ==================== */}
                <section className="container pb-20 md:pb-28">
                    <h2
                        className="
                            font-heading
                            text-2xl font-bold
                            leading-tight
                            text-primary
                            md:text-3xl
                        "
                    >
                        Kenalan dengan Tim
                        <br />
                        di Balik{" "}
                        <span className="nuraloka-text">
                            <span className="nura">Nura</span>
                            <span className="loka">Loka</span>
                        </span>
                        .
                    </h2>

                    <div
                        className="
                            mt-12
                            grid grid-cols-1
                            gap-x-6 gap-y-10
                            sm:grid-cols-2
                            lg:grid-cols-5
                        "
                    >
                        {TEAM_MEMBERS.map((member) => (
                            <div
                                key={member.name}
                                className="text-center"
                            >
                                {/* Profile Image */}
                                <div
                                    className="
                                        mx-auto
                                        aspect-square
                                        w-52
                                        overflow-hidden
                                        rounded-full
                                        bg-gray-10
                                        sm:w-44
                                    "
                                >
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="
                                            h-full w-full
                                            object-cover
                                        "
                                    />
                                </div>

                                {/* Member Info */}
                                <h3
                                    className="
                                        mt-4
                                        font-heading
                                        text-paragraph
                                        font-bold
                                        text-primary
                                    "
                                >
                                    {member.name}
                                </h3>

                                <p
                                    className="
                                        font-body
                                        text-body
                                        italic
                                        text-secondary
                                    "
                                >
                                    {member.role}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* ==================== FOOTER ==================== */}
            <Footer />
        </>
    );
}
