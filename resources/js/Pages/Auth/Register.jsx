import { Link, useForm } from "@inertiajs/react";
import { route } from "ziggy-js";

import SignUp from "@js/Layouts/SignUp";
import { useTranslation } from "@js/i18n";

import Input from "@components/Forms/Input";
import Button from "@components/Forms/Button";

import { FaRegUserCircle } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";
import { GiPadlock } from "react-icons/gi";

export default function Register() {
    const { t } = useTranslation();
    const subtitleParts = t("account.register.subtitle").split(":app");

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
                    <b>{t("account.register.title")}</b>
                </h2>

                <p className="font-body text-body">
                    {subtitleParts[0]}
                    <span className="nuraloka-text">
                        <span className="nura">Nura</span>
                        <span className="loka">Loka</span>
                    </span>
                    {subtitleParts[1]}
                </p>
            </div>

            <form
                method="POST"
                className="w-full"
                onSubmit={handleSubmit}
            >
                <div className="flex flex-col gap-4 mb-8">
                    <Input
                        label={t("account.register.username_label")}
                        name="username"
                        type="text"
                        placeholder={t("account.register.username_placeholder")}
                        icon={<FaRegUserCircle size={26} />}
                        value={data.username}
                        onChange={(e) =>
                            setData("username", e.target.value)
                        }
                        error={errors.username}
                    />

                    <Input
                        label={t("account.register.email_label")}
                        name="email"
                        type="email"
                        placeholder={t("account.register.email_placeholder")}
                        icon={<MdOutlineMail size={26} />}
                        value={data.email}
                        onChange={(e) =>
                            setData("email", e.target.value)
                        }
                        error={errors.email}
                    />

                    <Input
                        label={t("account.register.password_label")}
                        name="password"
                        type="password"
                        placeholder={t("account.register.password_placeholder")}
                        icon={<GiPadlock size={26} />}
                        value={data.password}
                        onChange={(e) =>
                            setData("password", e.target.value)
                        }
                        error={errors.password}
                    />

                    <Input
                        label={t("account.register.confirm_label")}
                        name="confirmPassword"
                        type="password"
                        placeholder={t("account.register.confirm_placeholder")}
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
                            ? t("account.register.submit_processing")
                            : t("account.register.submit")}
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
                            {t("account.register.google")}
                        </Button>
                    </a>
                </div>
            </form>

            <p className="text-body text-center mt-2">
                {t("account.register.have_account")}{" "}
                <Link href={route("auth.login.index")}>
                    {t("account.register.login_now")}
                </Link>
            </p>
        </>
    );
}

Register.layout = (page) => (
    <SignUp titleKey="account.register.layout_title" content={page} />
);
