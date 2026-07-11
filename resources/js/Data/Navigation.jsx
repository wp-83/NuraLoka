import { FaRegBookmark, FaRoute } from "react-icons/fa6";
import { MdOutlinePhotoLibrary } from "react-icons/md";
import { TbRoute, TbTargetArrow } from "react-icons/tb";
import { IoHomeOutline } from "react-icons/io5";
import { TiHomeOutline } from "react-icons/ti";
import { HiOutlineBookmark } from "react-icons/hi";


export const NAV_ITEMS = [
    {
        label: "Beranda",
        icon: TiHomeOutline,
        href: "/",
    },
    {
        label: "Jelajah",
        icon: TbRoute,
        href: "/explore",
    },
    {
        label: "Tantangan",
        icon: TbTargetArrow,
        href: "/challenge",
    },
    {
        label: "Impian",
        icon: HiOutlineBookmark,
        href: "/dream",
    },
    {
        label: "Album",
        icon: MdOutlinePhotoLibrary,
        href: "/album",
    },
];
