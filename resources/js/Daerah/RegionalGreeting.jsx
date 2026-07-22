import { useRegionalGreeting } from './useRegionalGreeting';

/**
 * The regional greeting shown under a page title or hero.
 *
 * Styling comes from the .local-language class in resources/css/app.css — this
 * component defines no styles of its own, so every regional greeting looks the
 * same. `className` is only for per-site adjustments (a light colour over a dark
 * hero, for instance).
 *
 * Renders nothing when the phrase is empty, so it never leaves a gap in the
 * layout.
 */
export default function RegionalGreeting({
    phrase,
    replacements = {},
    className = '',
    as: Tag = 'p',
}) {
    const { greeting, language } = useRegionalGreeting(phrase, replacements);

    if (!greeting) return null;

    return (
        <Tag
            className={`local-language ${className}`.trim()}
            data-daerah={language ?? undefined}
        >
            {greeting}
        </Tag>
    );
}
