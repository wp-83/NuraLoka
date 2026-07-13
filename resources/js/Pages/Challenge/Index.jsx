import MainLayout from "@js/Layouts/MainLayout";

export default function Index(){
    return (
        <>
            <p>Hai</p>
        </>
    );
}

Index.layout = (page) => <MainLayout pageTitle="Tantangan" content={page}></MainLayout>
