import { FaRegBookmark, FaRoute } from "react-icons/fa6";
import { MdOutlinePhotoLibrary } from "react-icons/md";
import { TbRoute, TbTargetArrow } from "react-icons/tb";
import { IoHomeOutline } from "react-icons/io5";
import { TiHomeOutline } from "react-icons/ti";
import { HiOutlineBookmark } from "react-icons/hi";


// labelKey is the translation key (lang/*/nav.php). `label` is kept as the
// fallback for when translations have not loaded yet.
export const NAV_ITEMS = [
    {
        label: "Beranda",
        labelKey: "nav.home",
        icon: TiHomeOutline,
        route: "home",
    },
    {
        label: "Jelajah",
        labelKey: "nav.explore",
        icon: TbRoute,
        route: "explore",
    },
    {
        label: "Tantangan",
        labelKey: "nav.challenge",
        icon: TbTargetArrow,
        route: "challenge",
    },
    {
        label: "Impian",
        labelKey: "nav.wishlist",
        icon: HiOutlineBookmark,
        route: "wishlist",
    },
    {
        label: "Album",
        labelKey: "nav.album",
        icon: MdOutlinePhotoLibrary,
        route: "album",
    },
];
