// ============================================================
// REVEAL
// Wraps a section so it animates into view on scroll (AOS).
//
// AOS is driven by data-* attributes, which are easy to spread across a
// codebase as slightly different magic strings. Going through this component
// keeps every page on the same animation vocabulary, and `stagger` removes the
// hand-computed delay arithmetic that lists otherwise need.
//
// AOS itself is started once in Utils/aos.js.
// ============================================================

/** How much later each item in a list starts, in milliseconds. */
const STAGGER_STEP = 80;

/**
 * The longest stagger delay allowed. Without a ceiling, the tenth card in a row
 * waits almost a second after the first, which reads as the page being slow
 * rather than as an effect.
 */
const STAGGER_MAX = 400;

export default function Reveal({
    as: Tag = 'div',
    // Any AOS animation name: 'fade-up', 'fade-right', 'zoom-in', …
    animation = 'fade-up',
    // Position in a list; the delay is derived from it.
    stagger = null,
    delay = 0,
    duration = null,
    className = '',
    children,
    ...rest
}) {
    const resolvedDelay =
        stagger === null
            ? delay
            : Math.min(stagger * STAGGER_STEP, STAGGER_MAX);

    return (
        <Tag
            data-aos={animation}
            data-aos-delay={resolvedDelay || undefined}
            data-aos-duration={duration || undefined}
            className={className}
            {...rest}
        >
            {children}
        </Tag>
    );
}
