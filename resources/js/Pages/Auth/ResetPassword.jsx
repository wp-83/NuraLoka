import { Head, useForm, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";

import Input from "@components/Forms/Input";
import Button from "@components/Forms/Button";
import LanguageSwitcher from "@components/Common/LanguageSwitcher";
import { useTranslation } from "@js/i18n";

export default function ResetPassword() {
    const { user, token } = usePage().props;
    const { t } = useTranslation();

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
            <Head title={`NuraLoka | ${t("account.reset.meta_title")}`} />

            <main className="relative flex min-h-screen items-start justify-center overflow-hidden bg-gray-10 px-6">
                <div className="absolute right-6 top-6 z-30">
                    <LanguageSwitcher />
                </div>
                <section className="flex w-full max-w-xl flex-col items-center">
                    <img
                        src="/images/logo/with-tagline.png"
                        alt="Logo"
                        className="mt-4 mb-5 w-48"
                    />

                    <h1 className="mb-1 text-center font-heading text-title font-bold text-primary-100">
                        {t("account.reset.title")}
                    </h1>

                    {user.user_details.fullname && (
                        <p className="mb-10 max-w-2xl text-center font-heading text-paragraph">
                            {(() => {
                                const [before, after] = t("account.reset.for_account").split(":name");
                                return (<>{before}<b>{user.user_details.fullname}</b>{after}</>);
                            })()}
                        </p>
                    )}

                    <form
                        onSubmit={submit}
                        className="flex w-full flex-col gap-6"
                    >
                        <Input
                            label={t("account.reset.password_label")}
                            name="password"
                            type="password"
                            placeholder={t("account.reset.password_placeholder")}
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            error={errors.password}
                            required
                        />

                        <Input
                            label={t("account.reset.confirm_label")}
                            name="confirmPassword"
                            type="password"
                            placeholder={t("account.reset.confirm_placeholder")}
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
                                ? t("account.reset.submit_processing")
                                : t("account.reset.submit")}
                        </Button>
                    </form>
                </section>
            </main>
        </>
    );
}
