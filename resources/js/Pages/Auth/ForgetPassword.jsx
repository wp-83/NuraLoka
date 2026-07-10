import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";

import Input from "@components/Forms/Input";
import Button from "@components/Forms/Button";

export default function ForgetPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route("auth.forget-password.send"), {
            onSuccess: () => reset(),
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
                        className="mb-5 mt-4 w-48"
                    />

                    <h1 className="mb-3 text-title font-heading font-bold text-center text-primary-100">
                        Ganti Kata Sandi
                    </h1>

                    <p className="mb-10 max-w-2xl text-center text-paragraph">
                        Masukkan email yang terdaftar pada akun kamu. Kami akan
                        mengirimkan tautan untuk mengatur ulang kata sandi ke
                        email kamu.
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="w-[80%]"
                    >
                        <Input
                            name="email"
                            type="email"
                            placeholder="Masukkan alamat email akun kamu..."
                            value={data.email}
                            onChange={(e) =>
                                setData("email", e.target.value)
                            }
                            error={errors.email}
                        />

                        <Button
                            className="mt-4"
                            type="submit"
                            fullWidth
                            loading={processing}
                            variant={
                                processing
                                    ? "inactive"
                                    : "primary"
                            }
                        >
                            {processing
                                ? "Mengirim..."
                                : "Kirim Tautan Ganti Kata Sandi"}
                        </Button>
                    </form>

                    <p className="mt-2 text-body font-body">
                        Sudah ingat kata sandi?{" "}
                        <Link href={route("auth.login.index")} className="font-bold">
                            Masuk Sekarang!
                        </Link>
                    </p>

                </section>
            </main>
        </>
    );
}
