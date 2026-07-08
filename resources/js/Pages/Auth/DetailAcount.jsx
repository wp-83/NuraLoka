import SignUp from "@js/Layouts/SignUp";
import '@css/Auth/DetailAccount.css';

import { useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { MdOutlineDateRange, MdLocationOn } from "react-icons/md";
import { FaPerson } from "react-icons/fa6";

import Input from "@components/Forms/Input";
import Dropdown from "@components/Forms/Dropdown";
import Checkbox from "@components/Forms/Checkbox";
import Button from "@components/Forms/Button";


export default function DetailAccount(){
    const { provinces, fullname } = usePage().props;
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
                    <b>Informasi Akun</b>
                </h2>

                <p className="font-body text-body">
                    Satu langkah lagi untuk menjadi bagian dari{" "}
                    <span className="nuraloka-text">
                        <span className="nura">Nura</span>
                        <span className="loka">Loka</span>
                    </span>
                    !
                </p>
            </div>

            <form className="register-form" method="POST" onSubmit={handleSubmit}>

                <Input
                    label="Nama Lengkap"
                    name="fullname"
                    type="text"
                    placeholder="Nura Panjang Banget"
                    value={data.fullname}
                    onChange={(e) => setData("fullname", e.target.value)}
                    error={errors.fullname}
                />

                <div className="detail-account-split">

                    <Input
                        className="split-element"
                        label="Tanggal Lahir"
                        name="dob"
                        type="date"
                        value={data.dob}
                        onChange={(e) => setData("dob", e.target.value)}
                        error={errors.dob}
                    />

                    <Dropdown
                        className="split-element"
                        label="Jenis Kelamin"
                        name="gender"
                        placeholder="Jenis kelamin kamu"
                        value={data.gender}
                        onChange={(e) => setData("gender", e.target.value)}
                        error={errors.gender}
                        options={[
                            {
                                value: "male",
                                label: "Laki-laki",
                            },
                            {
                                value: "female",
                                label: "Perempuan",
                            },
                            {
                                value: "unspecified",
                                label: "Tidak ingin memberi tahu",
                            },
                        ]}
                    />

                </div>

                <Dropdown
                    label="Provinsi Domisili"
                    name="province"
                    placeholder="Provinsi tempat kamu tinggal sekarang"
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
                    label="Saya telah membaca dan menyetujui penggunaan data pribadi saya untuk proses registrasi dan konfirmasi akun."
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
                            ? "Memeriksa data..."
                            : "Simpan Data dan Masuk"}
                    </Button>
                </div>

            </form>
        </>
    );
}

DetailAccount.layout = page => <SignUp title="Informasi Akun" content={page}></SignUp>
