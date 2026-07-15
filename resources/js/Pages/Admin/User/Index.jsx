import AdminLayout from '@js/Layouts/AdminLayout';
import Button from '@components/Forms/Button';
import Dropdown from '@components/Forms/Dropdown';
import Input from '@components/Forms/Input';

import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';

import {
    FiChevronLeft,
    FiChevronRight,
    FiEdit2,
    FiSearch,
    FiShield,
    FiSlash,
    FiTrash2,
    FiUnlock,
    FiUserCheck,
    FiUsers,
} from 'react-icons/fi';

import UserStatisticCard from '@components/Features/UserStatisticCard';

export default function Index({
    users,
    filters = {},
    statistics = {},
}) {

    const authUser = usePage().props.auth.user;

    const [search, setSearch] = useState(
        filters.search ?? '',
    );

    const [role, setRole] = useState(
        filters.role ?? '',
    );

    const [gender, setGender] = useState(
        filters.gender ?? '',
    );

    const [status, setStatus] = useState(
        filters.status ?? '',
    );

    const handleFilter = (e) => {
        e.preventDefault();

        router.get(
            route('admin.users.index'),
            {
                search,
                role,
                gender,
                status,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleReset = () => {
        setSearch('');
        setRole('');
        setGender('');
        setStatus('');

        router.get(
            route('admin.users.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleBan = (user) => {
        const confirmed = window.confirm(
            `Apakah kamu yakin ingin memblokir akun "${user.username}"?`,
        );

        if (!confirmed) {
            return;
        }

        router.patch(
            route(
                'admin.users.ban',
                user.id,
            ),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const handleUnban = (user) => {
        const confirmed = window.confirm(
            `Apakah kamu yakin ingin membuka blokir akun "${user.username}"?`,
        );

        if (!confirmed) {
            return;
        }

        router.patch(
            route(
                'admin.users.unban',
                user.id,
            ),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const handleDelete = (user) => {
        const confirmed = window.confirm(
            `Apakah kamu yakin ingin menghapus akun "${user.username}" secara permanen?`,
        );

        if (!confirmed) {
            return;
        }

        router.delete(
            route(
                'admin.users.destroy',
                user.id,
            ),
            {
                preserveScroll: true,
            },
        );
    };

    const getGenderLabel = (gender) => {
        const labels = {
            male: 'Laki-laki',
            female: 'Perempuan',
            unspecified: 'Tidak ingin memberi tahu',
        };

        return labels[gender] ?? '-';
    };

    const getInitial = (user) => {
        const name =
            user.user_detail?.fullname ||
            user.username ||
            'U';

        return name
            .charAt(0)
            .toUpperCase();
    };

    return (
        <div className="flex w-full flex-col gap-6">
            {/* Header */}
            <div>
                <h1 className="font-heading text-title font-bold text-primary-100">
                    Kelola Pengguna
                </h1>

                <p className="mt-1 font-body text-body text-gray-70">
                    Kelola dan pantau akun pengguna yang
                    terdaftar di NuraLoka.
                </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <UserStatisticCard
                    title="Total Pengguna"
                    value={
                        statistics.total_users ?? 0
                    }
                    icon={
                        <FiUsers size={24} />
                    }
                />

                <UserStatisticCard
                    title="Pengguna Biasa"
                    variant='green'
                    value={
                        statistics.total_regular_users ?? 0
                    }
                    icon={
                        <FiUserCheck size={24} />
                    }
                />

                <UserStatisticCard
                    title="Admin"
                    variant='yellow'
                    value={
                        statistics.total_admins ?? 0
                    }
                    icon={
                        <FiShield size={24} />
                    }
                />

                <UserStatisticCard
                    title="Pengguna Diblokir"
                    variant='red'
                    value={
                        statistics.total_banned_users ?? 0
                    }
                    icon={
                        <FiSlash size={24} />
                    }
                />
            </div>

            {/* Filter */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
                <form
                    onSubmit={handleFilter}
                    className="flex flex-col gap-4"
                >
                    {/* Search */}
                    <Input
                        label="Cari Pengguna"
                        name="search"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder="Cari nama, username, atau email..."
                        icon={<FiSearch size={20} />}
                    />

                    {/* Filters */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Dropdown
                            label="Role"
                            name="role"
                            value={role}
                            onChange={(e) =>
                                setRole(e.target.value)
                            }
                            placeholder="Semua role"
                            options={[
                                {
                                    value: 'admin',
                                    label: 'Admin',
                                },
                                {
                                    value: 'user',
                                    label: 'Pengguna',
                                },
                            ]}
                        />

                        <Dropdown
                            label="Jenis Kelamin"
                            name="gender"
                            value={gender}
                            onChange={(e) =>
                                setGender(e.target.value)
                            }
                            placeholder="Semua jenis kelamin"
                            options={[
                                {
                                    value: 'male',
                                    label: 'Laki-laki',
                                },
                                {
                                    value: 'female',
                                    label: 'Perempuan',
                                },
                                {
                                    value: 'unspecified',
                                    label: 'Tidak ingin memberi tahu',
                                },
                            ]}
                        />

                        <Dropdown
                            label="Status"
                            name="status"
                            value={status}
                            onChange={(e) =>
                                setStatus(e.target.value)
                            }
                            placeholder="Semua status"
                            options={[
                                {
                                    value: 'active',
                                    label: 'Aktif',
                                },
                                {
                                    value: 'banned',
                                    label: 'Diblokir',
                                },
                            ]}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap justify-end gap-3">
                        <Button
                            type="button"
                            variant="white"
                            onClick={handleReset}
                        >
                            Reset
                        </Button>

                        <Button type="submit">
                            Terapkan Filter
                        </Button>
                    </div>
                </form>
            </div>

            {/* Add User */}
            <div className="flex justify-end">
                <Button
                    onClick={() =>
                        router.get(
                            route('admin.users.create'),
                        )
                    }
                >
                    Tambah Pengguna Baru
                </Button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg bg-white shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-primary-100 font-heading text-body text-white">
                            <tr className='text-center'>
                                <th className="min-w-72 whitespace-nowrap px-5 py-4">
                                    Pengguna
                                </th>

                                <th className="min-w-48 whitespace-nowrap px-5 py-4">
                                    Username
                                </th>

                                <th className="min-w-68 whitespace-nowrap px-5 py-4">
                                    Email
                                </th>

                                <th className="min-w-32 whitespace-nowrap px-5 py-4">
                                    Jenis Kelamin
                                </th>

                                <th className="min-w-44 whitespace-nowrap px-5 py-4">
                                    Provinsi
                                </th>

                                <th className="min-w-28 whitespace-nowrap px-5 py-4">
                                    Poin
                                </th>

                                <th className="min-w-24 whitespace-nowrap px-5 py-4">
                                    Role
                                </th>

                                <th className="min-w-24 whitespace-nowrap px-5 py-4">
                                    Status
                                </th>

                                <th className="min-w-40 whitespace-nowrap px-5 py-4">
                                    Aksi
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.data.length > 0 ? (
                                users.data.map((user) => (
                                    <tr
                                        key={user.id}
                                        className={`border-b border-gray-20 transition-colors last:border-b-0 ${(user.id == authUser.id) ? 'bg-accent-10' : 'hover:bg-primary-10'}`}
                                    >
                                        {/* Pengguna */}
                                        <td className="px-5 py-4 font-body text-body text-gray-100">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user.public_profile_photo}
                                                    alt={user.username}
                                                    className="h-12 w-12 rounded-full object-cover"
                                                />

                                                <div>
                                                    <p className="font-heading text-body text-gray-100">
                                                        {user.user_detail?.fullname ?? '-'}
                                                        {(user.id == authUser.id) ? (<span className='font-bold text-small'> (Kamu)</span>) : ""}
                                                    </p>

                                                    <p className="font-body text-small text-gray-50">
                                                        ID: {user.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Username */}
                                        <td className="px-5 py-4 font-body text-body text-gray-100">
                                            @{user.username}
                                        </td>

                                        {/* Email */}
                                        <td className="px-5 py-4 font-body text-body text-gray-100">
                                            {user.email}
                                        </td>

                                        {/* Jenis Kelamin */}
                                        <td className="px-5 py-4 font-body text-body text-gray-100">
                                            {getGenderLabel(
                                                user.user_detail?.gender,
                                            )}
                                        </td>

                                        {/* Provinsi */}
                                        <td className="px-5 py-4 font-body text-body text-gray-100">
                                            {user.user_detail?.province?.name ?? '-'}
                                        </td>

                                        {/* Poin */}
                                        <td className="px-5 py-4 font-body text-body text-gray-100">
                                            {(
                                                user.user_detail?.total_points ?? 0
                                            ).toLocaleString('id-ID')}
                                        </td>

                                        {/* Role */}
                                        <td className="px-5 py-4 font-body text-body text-center text-gray-100">
                                            <span
                                                className={[
                                                    'inline-flex rounded-md px-3 py-1 font-body text-small',
                                                    user.is_admin
                                                        ? 'text-secondary-10 bg-secondary-100'
                                                        : 'text-accent-10 bg-accent-100',
                                                ]
                                                    .filter(Boolean)
                                                    .join(' ')}
                                            >
                                                {user.is_admin
                                                    ? 'Admin'
                                                    : 'Pengguna'}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4 font-body text-body text-center text-gray-100">
                                            <span
                                                className={[
                                                    'inline-flex rounded-md px-3 py-1 font-body text-small',
                                                    user.is_banned
                                                        ? 'text-error-light bg-error-dark'
                                                        : 'text-success-light bg-success-dark',
                                                ]
                                                    .filter(Boolean)
                                                    .join(' ')}
                                            >
                                                {user.is_banned
                                                    ? 'Diblokir'
                                                    : 'Aktif'}
                                            </span>
                                        </td>

                                        {/* Aksi */}
                                        <td className="px-5 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* Edit */}
                                                <Button
                                                    variant="info"
                                                    size="btn-sm"
                                                    className="h-9 w-9 p-0"
                                                    iconLeft={
                                                        <FiEdit2 size={17} />
                                                    }
                                                    onClick={() =>
                                                        router.get(
                                                            route(
                                                                'admin.users.edit',
                                                                user.id,
                                                            ),
                                                        )
                                                    }
                                                    title="Edit pengguna"
                                                    aria-label="Edit pengguna"
                                                />

                                                {/* Ban / Unban */}
                                                {!user.is_admin &&
                                                    (user.is_banned ? (
                                                        <Button
                                                            variant="success"
                                                            size="btn-sm"
                                                            className="h-9 w-9 p-0"
                                                            iconLeft={
                                                                <FiUnlock
                                                                    size={17}
                                                                />
                                                            }
                                                            onClick={() =>
                                                                handleUnban(user)
                                                            }
                                                            title="Buka blokir pengguna"
                                                            aria-label="Buka blokir pengguna"
                                                        />
                                                    ) : (
                                                        <Button
                                                            variant="warning"
                                                            size="btn-sm"
                                                            className="h-9 w-9 p-0"
                                                            iconLeft={
                                                                <FiSlash
                                                                    size={17}
                                                                />
                                                            }
                                                            onClick={() =>
                                                                handleBan(user)
                                                            }
                                                            title="Blokir pengguna"
                                                            aria-label="Blokir pengguna"
                                                        />
                                                    ))}

                                                {/* Delete */}
                                                {!user.is_admin && (
                                                    <Button
                                                        variant="error"
                                                        size="btn-sm"
                                                        className="h-9 w-9 p-0"
                                                        iconLeft={
                                                            <FiTrash2 size={17} />
                                                        }
                                                        onClick={() =>
                                                            handleDelete(user)
                                                        }
                                                        title="Hapus pengguna"
                                                        aria-label="Hapus pengguna"
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-6 py-16 text-center"
                                    >
                                        <FiUsers
                                            size={42}
                                            className="mx-auto text-gray-30"
                                        />

                                        <p className="mt-3 font-heading text-paragraph text-gray-100">
                                            Pengguna tidak ditemukan
                                        </p>

                                        <p className="mt-1 font-body text-body text-gray-50">
                                            Coba ubah kata kunci atau filter
                                            pencarian.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {users.links && users.links.length > 3 && (
                    <div className="flex flex-col gap-4 border-t border-gray-20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-body text-small text-gray-50">
                            Menampilkan {users.from ?? 0}–{users.to ?? 0} dari{' '}
                            {users.total ?? 0} pengguna
                        </p>

                        <div className="flex items-center gap-2">
                            {users.links.map((link, index) => {
                                const isPrevious = index === 0;
                                const isNext =
                                    index === users.links.length - 1;

                                return (
                                    <Button
                                        key={`${link.label}-${index}`}
                                        type="button"
                                        variant={
                                            link.active
                                                ? 'primary'
                                                : 'white'
                                        }
                                        size="btn-sm"
                                        disabled={!link.url}
                                        className="h-9 min-w-9 px-3"
                                        onClick={() => {
                                            if (link.url) {
                                                router.get(
                                                    link.url,
                                                    {},
                                                    {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                    },
                                                );
                                            }
                                        }}
                                    >
                                        {isPrevious ? (
                                            <FiChevronLeft size={18} />
                                        ) : isNext ? (
                                            <FiChevronRight size={18} />
                                        ) : (
                                            link.label
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

Index.layout = (page) => (
    <AdminLayout
        pageTitle="Kelola Pengguna"
        content={page}
    />
);
