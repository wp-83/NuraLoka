import { BiMapPin } from "react-icons/bi";
import { GiStairsGoal } from "react-icons/gi";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdOutlineCategory } from "react-icons/md";
import { TbTargetArrow } from "react-icons/tb";
import { TiGroupOutline } from "react-icons/ti";


export const adminMenuItems = [
    {
        label: 'Dasbor',
        href: '#',
        icon: LuLayoutDashboard,
    },
    {
        label: 'Tempat Wisata',
        href: '/places',
        icon: BiMapPin,
    },
    {
        label: 'Kategori Tempat',
        href: '#',
        icon: MdOutlineCategory,
    },
    {
        label: 'Lencana dan Misi',
        href: '#',
        icon: TbTargetArrow,
    },
    {
        label: 'Level',
        href: '#',
        icon: GiStairsGoal,
    },
    {
        label: 'Pengguna',
        href: '#',
        icon: TiGroupOutline,
    },
];
