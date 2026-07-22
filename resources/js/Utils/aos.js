import AOS from 'aos';
import 'aos/dist/aos.css';
import { router } from '@inertiajs/react';

/**
 * Scroll animations (AOS), set up once for the whole application.
 *
 * Two things make AOS need wiring rather than a bare init() call here:
 *
 * 1. Inertia never reloads the document. AOS scans the DOM when it starts and
 *    positions its observers then, so after a page visit the new elements are
 *    ones it has never seen — they would keep the opacity-0 starting state that
 *    aos.css applies and simply never appear. refreshHard() after every
 *    navigation re-scans and re-measures.
 * 2. A visitor who asked their system for reduced motion must not be given
 *    motion. AOS's own `disable` option handles this correctly: the elements
 *    render in their final state instead of staying hidden.
 */

/** Defaults every animated element inherits unless it overrides them. */
const DEFAULTS = {
    // Animate once. Replaying on every scroll past an element makes long pages
    // feel restless, and repeated fades hurt readability more than they help.
    once: true,

    duration: 600,
    easing: 'ease-out-cubic',

    // Start the animation slightly before the element reaches the viewport edge,
    // so it is already settled by the time it is properly in view.
    offset: 60,

    // Honour the OS "reduce motion" setting.
    disable: () =>
        window.matchMedia('(prefers-reduced-motion: reduce)').matches,
};

/**
 * Start AOS and keep it in step with Inertia navigation.
 * Call once, from app.jsx.
 */
export default function initAos() {
    AOS.init(DEFAULTS);

    // 'navigate' fires after Inertia has swapped the page component in, which is
    // the point at which the new elements exist in the DOM.
    router.on('navigate', () => {
        AOS.refreshHard();
    });
}
