import { BiMapPin } from "react-icons/bi";
import { BiDownload } from "react-icons/bi";
import { FaRegNewspaper } from "react-icons/fa6";
import { GiStairsGoal } from "react-icons/gi";
import { IoLanguage } from "react-icons/io5";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdOutlineCategory } from "react-icons/md";
import { TbTargetArrow } from "react-icons/tb";
import { TbMedal } from "react-icons/tb";
import { TiGroupOutline } from "react-icons/ti";

export const adminMenuItems = [
    {
        label: 'Dasbor',
        route: 'dashboard',
        icon: LuLayoutDashboard,
    },
    {
        label: 'Tempat Wisata',
        route: 'places',
        icon: BiMapPin,
    },
    {
        label: 'Impor Titik OSM',
        route: 'osm-import',
        icon: BiDownload,
    },
    {
        label: 'Kategori Tempat',
        route: 'categories',
        icon: MdOutlineCategory,
    },
    {
        label: 'Misi / Tantangan',
        route: 'missions',
        icon: TbTargetArrow,
    },
    {
        label: 'Lencana',
        route: 'badges',
        icon: TbMedal,
    },
    {
        label: 'Level',
        route: 'levels',
        icon: GiStairsGoal,
    },
    {
        label: 'Wawasan Wisata',
        route: 'news',
        icon: FaRegNewspaper,
    },
    {
        label: 'Pengguna',
        route: 'users',
        icon: TiGroupOutline,
    },
    // {
    //     label: 'Preferensi Bahasa',
    //     route: 'languages',
    //     icon: IoLanguage,
    // },
];
