import { useCallback, useEffect, useRef, useState } from "react";
import Button from "@components/Forms/Button";
import Footer from "@components/Layouts/User/Footer";
import { Head, Link, usePage } from "@inertiajs/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const FEATURES = [
    {
        image: "/images/mascots/car.png",
        title: "Rute yang Personal",
        description:
            "Setiap rekomendasi disesuaikan dengan minat, gaya perjalanan, dan tujuanmu, sehingga perjalanan terasa lebih relevan dan menyenangkan.",
    },
    {
        image: "/images/mascots/telescope.png",
        title: "Hidden Gems & UMKM Lokal",
        description:
            "Temukan tempat tersembunyi, kuliner khas, dan UMKM lokal yang sering terlewat, sekaligus mendukung potensi daerah di setiap perjalanan.",
    },
    {
        image: "/images/mascots/run.png",
        title: "Jelajah Lebih Seru",
        description:
            "Selesaikan misi, kumpulkan lencana, naikkan level sebagai Nuravers, dan ubah setiap perjalanan menjadi pengalaman yang lebih menyenangkan.",
    },
    {
        image: "/images/mascots/camera-v2.png",
        title: "Abadikan Setiap Cerita",
        description:
            "Dokumentasikan setiap perjalananmu dalam Trip Album, bagikan inspirasi kepada sesama Nuravers, dan ciptakan kenangan yang selalu bisa dikenang.",
    },
    {
        image: "/images/mascots/hi.png",
        title: "Dekat dengan Sastra",
        description:
            "Kenali sapaan dan ungkapan lokal di setiap destinasi untuk menjalin koneksi yang lebih hangat dengan budaya dan masyarakat setempat.",
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

const AUTOPLAY_MS = 3500;

// Shortest signed distance between `index` and `active` on a circular track of length `total`.
function getCircularOffset(index, active, total) {
    let diff = index - active;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
}

// Card dimensions yang lebih proporsional
function getCardDimensions(viewportWidth) {
    if (viewportWidth >= 1024) return { width: 480, height: 280 };
    if (viewportWidth >= 768) return { width: 440, height: 270 };
    if (viewportWidth >= 640) return { width: 380, height: 260 };
    return { width: 320, height: 280 };
}

export default function LandingPage() {
    const { auth } = usePage().props;

    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 480, height: 280 });

    const total = FEATURES.length;

    // Keep card sizing responsive
    useEffect(() => {
        const updateDimensions = () =>
            setDimensions(getCardDimensions(window.innerWidth));
        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    const goTo = useCallback(
        (index) => setActiveIndex(((index % total) + total) % total),
        [total]
    );

    const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
    const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

    // Infinite autoplay
    useEffect(() => {
        if (isPaused) return;
        const id = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % total);
        }, AUTOPLAY_MS);
        return () => clearInterval(id);
    }, [isPaused, total]);

    const { width: cardWidth, height: cardHeight } = dimensions;
    const stageHeight = cardHeight + 80; // ruang untuk shadow & scale
    const offsetStep = cardWidth * 0.62;

    return (
        <>
            <Head>
                <title>
                    NuraLoka | Temukan destinasi wisata, kuliner, dan pengalaman perjalanan
                    terbaik di Indonesia.
                </title>
                <meta
                    name="keywords"
                    content="wisata, destinasi, kuliner, perjalanan, Indonesia, hidden gem, NuraLoka"
                />
                <meta property="og:title" content="NuraLoka" />
                <meta
                    property="og:description"
                    content="Temukan destinasi wisata terbaik di Indonesia."
                />
                <meta property="og:type" content="website" />
            </Head>

            <header className="fixed left-0 top-0 z-50 w-full bg-white shadow-md">
                <div className="container flex h-16 items-center justify-between">
                    <Link href={route('landing-page.index')}>
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
                {/* HERO */}
                <section
                    className="
                        relative flex min-h-[110vh] items-center overflow-hidden
                        bg-cover bg-center
                    "
                    style={{
                        backgroundImage:
                            "url('/images/backgrounds/landing-page.jpg')",
                    }}
                >
                    <div className="absolute inset-0 bg-primary-70/20" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b to-white" />

                    <div className="container relative z-10">
                        <div className="mx-auto max-w-4xl">
                            <div className="flex flex-col items-center gap-6 sm:flex-row">
                                <img
                                    src="/images/mascots/map.png"
                                    alt="Maskot NuraLoka"
                                    className="w-60 shrink-0 object-contain"
                                />
                                <div>
                                    <h1 className="font-heading text-center text-title font-bold text-white sm:text-hero sm:text-left">
                                        Selamat Datang
                                    </h1>
                                    <p className="mt-2 font-heading text-subtitle text-white sm:text-title text-center sm:text-left">
                                        di{" "}
                                        <span className="relative inline-block whitespace-nowrap">
                                            <span className="absolute inset-x-0 inset-y-0 -rotate-3 bg-white" />
                                            <span className="nuraloka-text relative px-1">
                                                <span className="nura">Nura</span>
                                                <span className="loka">Loka</span>
                                            </span>
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="mt-12 max-w-xl sm:mt-8">
                                <p className="font-heading text-paragraph leading-relaxed text-white">
                                    Bersama{" "}
                                    <span className="nuraloka-text bg-white px-1 font-bold">
                                        <span className="nura">Nura</span>
                                        <span className="loka">Loka</span>
                                    </span>{" "}
                                    temukan <strong>destinasi yang sesuai dengan gayamu</strong>,
                                    susun <strong>rute perjalanan tanpa ribet</strong>, dan
                                    jelajahi{" "}
                                    <strong className="bg-white px-1 text-primary">
                                        keindahan Indonesia yang penuh cerita.
                                    </strong>
                                </p>
                                <div className="mt-12 sm:mt-8">
                                    <Link
                                        href={
                                            auth.user
                                                ? route("home.index")
                                                : route("auth.login.index")
                                        }
                                    >
                                        <Button
                                            variant="white">
                                            Cobain NuraLoka Sekarang!
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ABOUT + CAROUSEL */}
                <section className="relative overflow-hidden py-20 md:py-28">

                    <div className="container">
                        <div className="max-w-3xl">
                            <h2 className="font-heading text-subtitle font-bold leading-tight text-primary md:text-title">
                                Perjalanan Lebih dari
                                <br />
                                Sekadar Tujuan.
                            </h2>
                            <p className="mt-5 max-w-2xl font-body text-body leading-relaxed text-primary-100">
                                Kami percaya setiap perjalanan adalah kesempatan untuk
                                menemukan tempat baru, mengenal cerita lokal, dan menciptakan
                                pengalaman yang berkesan. Itulah mengapa{" "}
                                <span className="nuraloka-text">
                                    <span className="nura">Nura</span>
                                    <span className="loka">Loka</span>
                                </span>{" "}
                                hadir untuk menemani setiap langkahmu menjelajahi Nusantara.
                            </p>
                        </div>

                        <div
                            className="relative mt-6"
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                            onTouchStart={() => setIsPaused(true)}
                            onTouchEnd={() => setIsPaused(false)}
                        >
                            {/* Stage */}
                            <div
                                className="relative mx-auto overflow-hidden"
                                style={{ height: stageHeight }}
                            >
                                {FEATURES.map((feature, index) => {
                                    const offset = getCircularOffset(
                                        index,
                                        activeIndex,
                                        total
                                    );
                                    const absOffset = Math.abs(offset);
                                    const isActive = offset === 0;

                                    const translateX = offset * offsetStep;
                                    const scale = Math.max(1 - absOffset * 0.16, 0.5);
                                    const opacity = Math.max(1 - absOffset * 0.28, 0.15);
                                    const zIndex = 20 - absOffset;

                                    return (
                                        <article
                                            key={feature.title}
                                            onClick={() => !isActive && goTo(index)}
                                            className={`
                                                absolute left-1/2 top-1/2 flex flex-col
                                                rounded-xl bg-gradient-to-b from-primary-10 to-white p-6
                                                shadow-xl transition-all duration-500 ease-out
                                                ${isActive ? "shadow-2xl" : "cursor-pointer"}
                                            `}
                                            style={{
                                                width: cardWidth,
                                                height: cardHeight,
                                                transform: `translate(-50%, -50%) translateX(${translateX}px) scale(${scale})`,
                                                opacity,
                                                zIndex,
                                                filter: isActive
                                                    ? "grayscale(0)"
                                                    : "grayscale(1)",
                                            }}
                                        >
                                            <div className="relative z-10 flex h-28 w-28 shrink-0 items-center justify-center">
                                                <img
                                                    src={feature.image}
                                                    alt={feature.title}
                                                    className="w-max object-contain"
                                                />
                                            </div>
                                            <h3 className="relative z-10 mt-2 font-heading text-paragraph font-bold leading-snug text-primary">
                                                {feature.title}
                                            </h3>
                                            <p className="relative z-10 mt-2 font-body text-body text-secondary">
                                                {feature.description}
                                            </p>
                                        </article>
                                    );
                                })}
                            </div>

                            <button
                                type="button"
                                onClick={goPrev}
                                aria-label="Previous"
                                className="
                                    absolute left-2 top-1/2 z-30 flex h-12 w-12
                                    -translate-y-1/2 items-center justify-center
                                    rounded-full bg-white shadow-xl transition
                                    hover:scale-110
                                "
                            >
                                <FiChevronLeft size={24} className="text-primary" />
                            </button>

                            <button
                                type="button"
                                onClick={goNext}
                                aria-label="Next"
                                className="
                                    absolute right-2 top-1/2 z-30 flex h-12 w-12
                                    -translate-y-1/2 items-center justify-center
                                    rounded-full bg-white shadow-xl transition
                                    hover:scale-110
                                "
                            >
                                <FiChevronRight size={24} className="text-primary" />
                            </button>

                            {/* Dot navigation */}
                            <div className="mt-4 flex items-center justify-center gap-2">
                                {FEATURES.map((feature, index) => (
                                    <button
                                        key={feature.title}
                                        type="button"
                                        onClick={() => goTo(index)}
                                        aria-label={`Ke slide ${index + 1}`}
                                        className={`
                                            h-2.5 rounded-full transition-all duration-300
                                            ${
                                                index === activeIndex
                                                    ? "w-8 bg-primary"
                                                    : "w-2.5 bg-primary/20 hover:bg-primary/40"
                                            }
                                        `}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* TEAM */}
                <section className="relative overflow-hidden pb-24 md:pb-32">
                    <div className="container">
                        <div className="max-w-2xl">
                            <h2 className="font-heading text-subtitle font-bold leading-tight text-primary md:text-title">
                                Kenalan dengan Tim
                                <br />
                                di Balik{" "}
                                <span className="nuraloka-text">
                                    <span className="nura">Nura</span>
                                    <span className="loka">Loka</span>
                                </span>
                                .
                            </h2>
                            <p className="mt-5 max-w-2xl font-body text-body leading-relaxed text-primary-100">
                                NuraLoka dikembangkan oleh tim yang memiliki semangat untuk
                                membantu masyarakat menemukan pengalaman wisata yang lebih
                                personal, menyenangkan, dan bermakna.
                            </p>
                        </div>

                        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
                            {TEAM_MEMBERS.map((member) => (
                                <div key={member.name} className="group text-center">
                                    <div className="relative mx-auto aspect-square w-52 overflow-hidden rounded-full bg-primary-10 transition duration-300 group-hover:scale-105 group-hover:shadow-2xl sm:w-44">
                                        <div className="absolute inset-0 from-primary/10 to-secondary/10" />
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="relative h-full w-full object-cover"
                                        />
                                    </div>
                                    <h3 className="mt-5 font-heading text-paragraph font-bold text-primary">
                                        {member.name}
                                    </h3>
                                    <p className="font-body text-body italic text-secondary">
                                        {member.role}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
