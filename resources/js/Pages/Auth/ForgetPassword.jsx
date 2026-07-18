import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";

import Input from "@components/Forms/Input";
import Button from "@components/Forms/Button";
import LanguageSwitcher from "@components/Common/LanguageSwitcher";
import { useTranslation } from "@js/i18n";

export default function ForgetPassword() {
    const { t } = useTranslation();

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
            <Head title={`NuraLoka | ${t("account.forget.meta_title")}`} />

            <main className="relative flex min-h-screen items-start justify-center overflow-hidden bg-gray-10 px-6">

                <div className="absolute right-6 top-6 z-30">
                    <LanguageSwitcher />
                </div>

                <section className="flex w-full max-w-xl flex-col items-center">

                    <img
                        src="/images/logo/with-tagline.png"
                        alt="Logo"
                        className="mb-5 mt-4 w-48"
                    />

                    <h1 className="mb-3 text-title font-heading font-bold text-center text-primary-100">
                        {t("account.forget.title")}
                    </h1>

                    <p className="mb-10 max-w-2xl text-center text-paragraph">
                        {t("account.forget.desc")}
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="w-[80%]"
                    >
                        <Input
                            name="email"
                            type="email"
                            placeholder={t("account.forget.email_placeholder")}
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
                                ? t("account.forget.submit_processing")
                                : t("account.forget.submit")}
                        </Button>
                    </form>

                    <p className="mt-2 text-body font-body">
                        {t("account.forget.remember_password")}{" "}
                        <Link href={route("auth.login.index")} className="font-bold">
                            {t("account.forget.login_now")}
                        </Link>
                    </p>

                </section>
            </main>
        </>
    );
}
