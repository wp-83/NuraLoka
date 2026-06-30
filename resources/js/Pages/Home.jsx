import '@css/Init.css';
import { Link } from '@inertiajs/react';

export default function Home(){
    return (
        <div style={{ padding: '2rem', display: 'flex', gap: '2rem' }}>
            <button className='btn-primary'>button label</button>
            <button className='btn-secondary'>button label</button>
            <button className='btn-error'>button label</button>
            <button className='btn-warning'>button label</button>
            <button className='btn-success'>button label</button>
            <button className='btn-info'>button label</button>
            <button className='btn-gray'>button label</button>
            <button className='btn-inactive'>button label</button>

            <Link href={route('auth.logout')} method='POST' as="button" className='btn-primary'>
                Logout
            </Link>
        </div>

    );
};
