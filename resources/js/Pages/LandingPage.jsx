import Button from '@components/Forms/Button';
import { Link, usePage } from '@inertiajs/react';

export default function LandingPage(){
    const { auth } = usePage().props;

    return (
        <>
            {auth.user ? (
                <Link href={route("home")}>
                    <Button>Dashboard</Button>
                </Link>
            ) : (
                <Link href={route("auth.login.index")}>
                    <Button>Login</Button>
                </Link>
            )}
        </>
    );
}
