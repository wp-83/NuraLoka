import { Link, useForm } from "@inertiajs/react";
import { route } from "ziggy-js";

import SignUp from "@js/Layouts/SignUp";

import Input from "@components/Forms/Input";
import Button from "@components/Forms/Button";

import { FaRegUserCircle } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";
import { GiPadlock } from "react-icons/gi";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route("auth.register.store"), {
            onSuccess: () => reset(),
        });
    };

    return (
        <>
            <div className="mb-2">
                <h2 className="text-title font-heading text-primary-100">
                    <b>Daftar Akun</b>
                </h2>

                <p className="font-body text-body">
                    Segera jadi bagian dari{" "}
                    <span className="nuraloka-text">
                        <span className="nura">Nura</span>
                        <span className="loka">Loka</span>
                    </span>{" "}
                    dan mulai eksplorasi Indonesia!
                </p>
            </div>

            <form
                method="POST"
                className="w-full"
                onSubmit={handleSubmit}
            >
                <div className="flex flex-col gap-4 mb-8">
                    <Input
                        label="Username"
                        name="username"
                        type="text"
                        placeholder="kocakbanget123"
                        icon={<FaRegUserCircle size={26} />}
                        value={data.username}
                        onChange={(e) =>
                            setData("username", e.target.value)
                        }
                        error={errors.username}
                    />

                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="email.kamu@gmail.com"
                        icon={<MdOutlineMail size={26} />}
                        value={data.email}
                        onChange={(e) =>
                            setData("email", e.target.value)
                        }
                        error={errors.email}
                    />

                    <Input
                        label="Kata Sandi"
                        name="password"
                        type="password"
                        placeholder="Kata sandi kamu"
                        icon={<GiPadlock size={26} />}
                        value={data.password}
                        onChange={(e) =>
                            setData("password", e.target.value)
                        }
                        error={errors.password}
                    />

                    <Input
                        label="Konfirmasi Kata Sandi"
                        name="confirmPassword"
                        type="password"
                        placeholder="Konfirmasi kata sandi kamu"
                        icon={<GiPadlock size={26} />}
                        value={data.confirmPassword}
                        onChange={(e) =>
                            setData("confirmPassword", e.target.value)
                        }
                        error={errors.confirmPassword}
                    />
                </div>

                <div className="flex flex-col w-full">
                    <Button
                        type="submit"
                        variant={processing ? "inactive" : "primary"}
                        loading={processing}
                        fullWidth
                        className="mb-3"
                    >
                        {processing
                            ? "Mendaftarkan akun..."
                            : "Daftar Akun"}
                    </Button>

                    <a
                        href={route("auth.google.register")}
                        className="block"
                    >
                        <Button
                            type="button"
                            variant="white"
                            fullWidth
                            iconLeft={
                                <img
                                    src="/images/icons/google.png"
                                    alt="Google"
                                    className="w-5 h-5"
                                />
                            }
                        >
                            Daftar dengan Google
                        </Button>
                    </a>
                </div>
            </form>

            <p className="text-body text-center mt-2">
                Sudah punya akun?{" "}
                <Link href={route("auth.login.index")}>
                    Masuk Sekarang!
                </Link>
            </p>
        </>
    );
}

Register.layout = (page) => (
    <SignUp title="Daftar Akun" content={page} />
);
