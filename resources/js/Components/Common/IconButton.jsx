export default function IconButton({ icon, theme = 'primary', ...props }){
    // primary, secondary, ... as the design system

    return (
        <>
            <div className={`p-1 rounded-full bg-${theme}-30 text-${theme}-100 hover:opacity-60`} {...props}>
                {icon}
            </div>
        </>
    );
}
