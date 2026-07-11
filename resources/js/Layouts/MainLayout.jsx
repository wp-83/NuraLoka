import Navbar from '@components/Layouts/Navbar';
import Footer from '@components/Layouts/Footer';

export default function MainLayout({content}){
    return (
        <>
            <Navbar></Navbar>
            <main className='bg-gray-10 min-h-80'>
                {content}
            </main>
            <Footer></Footer>
        </>
    );
}
