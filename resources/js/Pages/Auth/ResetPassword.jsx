import { Head, useForm, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";

import Input from "@components/Forms/Input";
import Button from "@components/Forms/Button";

export default function ResetPassword() {
    const { user, token } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        token: token,
        email: user.email,
        password: "",
        confirmPassword: "",
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("auth.reset-password.update"), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="NuraLoka | Ganti Kata Sandi" />

            <main className="relative flex min-h-screen items-start justify-center overflow-hidden bg-gray-10 px-6">
                <section className="flex w-full max-w-xl flex-col items-center">
                    <img
                        src="/images/logo/with-tagline.png"
                        alt="Logo"
                        className="mt-4 mb-5 w-48"
                    />

                    <h1 className="mb-1 text-center font-heading text-title font-bold text-primary-100">
                        Ganti Kata Sandi
                    </h1>

                    {user.user_details.fullname && (
                        <p className="mb-10 max-w-2xl text-center font-heading text-paragraph">
                            untuk akun <b>{user.user_details.fullname}</b>
                        </p>
                    )}

                    <form
                        onSubmit={submit}
                        className="flex w-full flex-col gap-6"
                    >
                        <Input
                            label="Kata Sandi Baru"
                            name="password"
                            type="password"
                            placeholder="Masukkan kata sandi baru"
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            error={errors.password}
                            required
                        />

                        <Input
                            label="Konfirmasi Kata Sandi Baru"
                            name="confirmPassword"
                            type="password"
                            placeholder="Masukkan kembali kata sandi baru"
                            value={data.confirmPassword}
                            onChange={(e) =>
                                setData(
                                    "confirmPassword",
                                    e.target.value
                                )
                            }
                            error={errors.confirmPassword}
                            required
                        />

                        <Button
                            type="submit"
                            disabled={processing}
                        >
                            {processing
                                ? "Menyimpan..."
                                : "Simpan Kata Sandi"}
                        </Button>
                    </form>
                </section>
            </main>
        </>
    );
}
