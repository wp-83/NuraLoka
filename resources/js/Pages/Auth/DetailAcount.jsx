import SignUp from "@js/Layouts/SignUp";
import '@css/Auth/DetailAccount.css';

import { useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { MdOutlineDateRange, MdLocationOn } from "react-icons/md";
import { FaPerson } from "react-icons/fa6";
import { useTranslation } from "@js/i18n";

import Input from "@components/Forms/Input";
import Dropdown from "@components/Forms/Dropdown";
import Checkbox from "@components/Forms/Checkbox";
import Button from "@components/Forms/Button";


export default function DetailAccount(){
    const { provinces, fullname } = usePage().props;
    const { t } = useTranslation();
    const subtitleParts = t("account.detail.subtitle").split(":app");
    const [disabledBtn, setDisabledBtn] = useState(true);

    const { data, setData, post, reset, processing, errors } = useForm({
        'fullname': fullname ?? '',
        'dob': '',
        'gender': '',
        'province': '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('auth.register.store.detail'));
    };

    return (
        <>
            <div className="page-context">
                <h2 className="text-title font-heading text-primary-100">
                    <b>{t("account.detail.title")}</b>
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

            <form className="register-form" method="POST" onSubmit={handleSubmit}>

                <Input
                    label={t("account.detail.fullname_label")}
                    name="fullname"
                    type="text"
                    placeholder={t("account.detail.fullname_placeholder")}
                    value={data.fullname}
                    onChange={(e) => setData("fullname", e.target.value)}
                    error={errors.fullname}
                />

                <div className="detail-account-split">

                    <Input
                        className="split-element"
                        label={t("account.detail.dob_label")}
                        name="dob"
                        type="date"
                        value={data.dob}
                        onChange={(e) => setData("dob", e.target.value)}
                        error={errors.dob}
                    />

                    <Dropdown
                        className="split-element"
                        label={t("account.detail.gender_label")}
                        name="gender"
                        placeholder={t("account.detail.gender_placeholder")}
                        value={data.gender}
                        onChange={(e) => setData("gender", e.target.value)}
                        error={errors.gender}
                        options={[
                            {
                                value: "male",
                                label: t("account.gender_male"),
                            },
                            {
                                value: "female",
                                label: t("account.gender_female"),
                            },
                            {
                                value: "unspecified",
                                label: t("account.gender_unspecified"),
                            },
                        ]}
                    />

                </div>

                <Dropdown
                    label={t("account.detail.province_label")}
                    name="province"
                    placeholder={t("account.detail.province_placeholder")}
                    value={data.province}
                    onChange={(e) => setData("province", e.target.value)}
                    error={errors.province}
                    options={provinces.map((province) => ({
                        value: province.id,
                        label: province.name,
                    }))}
                />

                <Checkbox
                    id="dataApproval"
                    name="dataApproval"
                    checked={!disabledBtn}
                    onChange={(e) => setDisabledBtn(!e.target.checked)}
                    label={t("account.detail.data_approval")}
                    className="mt-6 mb-4"
                />

                <div className="register-btn-container">
                    <Button
                        type="submit"
                        variant={disabledBtn || processing ? "inactive" : "primary"}
                        loading={processing}
                        disabled={disabledBtn}
                        fullWidth
                    >
                        {processing
                            ? t("account.detail.submit_processing")
                            : t("account.detail.submit")}
                    </Button>
                </div>

            </form>
        </>
    );
}

DetailAccount.layout = page => <SignUp titleKey="account.detail.layout_title" content={page}></SignUp>
